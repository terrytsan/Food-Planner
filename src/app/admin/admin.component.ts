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
	query
} from "@angular/fire/firestore";
import { FoodPlan } from "../food-plan-preview/foodPlan";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { deleteObject, getDownloadURL, getStorage, listAll, ref } from "@angular/fire/storage";

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

	duplicateFoodPlans$: Observable<FoodPlan[]>;
	emptyDuplicateFoodPlans$: Observable<FoodPlan[]>;
	storage = getStorage();
	unusedFoodImages: FirebaseImage[] = [];
	unusedCatalogueItemImages: FirebaseImage[] = [];

	constructor(private afs: Firestore) {
		this.initDuplicateFoodPlan();
		this.initUnusedImages();
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
}

export class FirebaseImage {
	imageUrl: string;
	imagePath: string;

	constructor(imageUrl: string, imagePath: string) {
		this.imageUrl = imageUrl;
		this.imagePath = imagePath;
	}
}
