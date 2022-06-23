import { Component, OnInit } from '@angular/core';
import {
	collection,
	collectionData,
	CollectionReference,
	deleteDoc,
	doc,
	Firestore,
	getDocs,
	orderBy,
	query,
	where
} from "@angular/fire/firestore";
import { FoodPlan, FoodPlanDocument, SimpleDish } from "../food-plan-preview/foodPlan";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { deleteObject, getDownloadURL, listAll, ref, Storage } from "@angular/fire/storage";
import { FoodPlanService } from "../services/food-plan.service";

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

	duplicateFoodPlans$: Observable<FoodPlan[]>;
	emptyDuplicateFoodPlans$: Observable<FoodPlan[]>;

	unusedFoodImages: FirebaseImage[] = [];
	unusedCatalogueItemImages: FirebaseImage[] = [];

	emptyFoodPlans$: Observable<FoodPlan[]>;

	foodPlansNotUsingDishes$: Observable<FoodPlanDocument[]>;

	constructor(private afs: Firestore, private storage: Storage, private foodPlanService: FoodPlanService) {
		// this.initDuplicateFoodPlan();
		// this.initUnusedImages();
		// this.initEmptyFoodPlans();
		// this.initFoodPlansNotUsingDishes();
	}

	ngOnInit(): void {
	}

	initDuplicateFoodPlan() {
		this.duplicateFoodPlans$ = collectionData<FoodPlan>(
			query<FoodPlan>(
				collection(this.afs, 'foodPlans') as CollectionReference<FoodPlan>,
				orderBy('date')
			), {idField: 'id'}
		).pipe(map(foodPlans => {
			const lookup = foodPlans.reduce((a, e) => {
				let dateWithoutHours = new Date(e.date.toMillis()).setHours(0, 0, 0, 0);
				a.set(dateWithoutHours, (a.get(dateWithoutHours) ?? 0) + 1);
				return a;
			}, new Map());

			return foodPlans.filter(e => lookup.get(new Date(e.date.toMillis()).setHours(0, 0, 0, 0)) > 1);
		}));

		this.emptyDuplicateFoodPlans$ = this.duplicateFoodPlans$.pipe(map(foodPlans => {
			return foodPlans.filter(e => !e.foods);
		}));
	}

	async deleteFoodPlan(id: string) {
		const foodPlanRef = doc(this.afs, 'foodPlans', id);
		await deleteDoc(foodPlanRef);
	}

	async initUnusedImages() {
		const foods = await getDocs(collection(this.afs, 'foods'));
		const foodImageUrls: string[] = [];
		foods.forEach(f => {
			foodImageUrls.push(f.data().imagePath);
		});
		this.unusedFoodImages = await this.getUnusedImages(foodImageUrls, 'foodImages');

		const catalogueItems = await getDocs(collection(this.afs, 'catalogueItems'));
		const catalogueItemImageUrls: string [] = [];
		catalogueItems.forEach(f => {
			catalogueItemImageUrls.push(f.data().imagePath);
		});
		this.unusedCatalogueItemImages = await this.getUnusedImages(catalogueItemImageUrls, 'catalogueItemImages');
	}

	/**
	 * Gets list of unused images
	 * @param usedUrls list of image urls that are in use
	 * @param filePath relative path of folder containing collection's images
	 */
	async getUnusedImages(usedUrls: string[], filePath: string): Promise<FirebaseImage[]> {
		let unusedImages: FirebaseImage[] = [];

		const listRef = ref(this.storage, filePath);
		listAll(listRef).then(res => {
			res.items.forEach(async (itemRef) => {
				if (!usedUrls.includes(itemRef.fullPath)) {
					let downloadUrl = await getDownloadURL(itemRef);
					let unusedImage = new FirebaseImage(downloadUrl, itemRef.fullPath);
					unusedImages.push(unusedImage);
				}
			});
		});
		return unusedImages;
	}

	async deleteImage(path: string) {
		const imageRef = ref(this.storage, path);

		deleteObject(imageRef).then(() => {
			this.initUnusedImages();
		}).catch(error => {
			console.error(`Error deleting image at: ${path}. ${error}`);
		});
	}

	initEmptyFoodPlans() {
		this.emptyFoodPlans$ = collectionData<FoodPlan>(
			query<FoodPlan>(
				collection(this.afs, 'foodPlans') as CollectionReference<FoodPlan>,
				where('group', '==', ''),
				orderBy('date')
			), {idField: 'id'}
		).pipe(map(foodPlans => {
			return foodPlans.filter(f => (f.foods == undefined || f.foods.length <= 0));
		}));
	}

	/**
	 * Any FoodPlans that have foods and not dishes. Foods should be migrated to dishes.
	 */
	initFoodPlansNotUsingDishes() {
		this.foodPlansNotUsingDishes$ = collectionData<FoodPlanDocument>(
			query<FoodPlanDocument>(
				collection(this.afs, 'foodPlans') as CollectionReference<FoodPlanDocument>,
				where('group', '==', 'mP7yE8Gu3qpcySMUxBdL'),
				orderBy('date')
			), {idField: 'id'}
		).pipe(map(foodPlans => {
			// Only keep foodIds that don't exist in dish form
			let foodPlansNotUsingDishes = [] as FoodPlanDocument[];
			foodPlans.forEach(f => {
				let filteredFoodPlan = {...f} as FoodPlanDocument;
				if (f.dishes && f.foods) {
					let existingDishFoodIds = f.dishes.map(d => d.foodId);
					let foodIdsToAddToDishes = f.foods.filter(f => !existingDishFoodIds.includes(f));

					if (foodIdsToAddToDishes.length == 0) {
						// no need to add if foodPlan has no foods to add
						return;
					}

					filteredFoodPlan.foods = foodIdsToAddToDishes;
				}

				if (!f.foods) {
					return;
				}
				foodPlansNotUsingDishes.push(filteredFoodPlan);
			});
			return foodPlansNotUsingDishes;
		}));
	}

	addDishToFoodPlan(foodId: string, foodPlan: FoodPlanDocument) {
		let highestIndex = 0;
		if (foodPlan.dishes && foodPlan.dishes.length > 0) {
			highestIndex = Math.max(...foodPlan.dishes.map(f => f.index));
		}
		let dishToAdd = {foodId: foodId, index: highestIndex++, ingredients: []} as SimpleDish;
		this.foodPlanService.addDishToFoodPlan(dishToAdd, foodPlan);
	}
}

export class FirebaseImage {
	imageUrl: string;
	imagePath: string;

	constructor(imageUrl: string, imagePath: string) {
		this.imageUrl = imageUrl;
		this.imagePath = imagePath;
	}
}
