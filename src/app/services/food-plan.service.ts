import { Injectable } from '@angular/core';
import { Dish, FoodPlan, FoodPlanDocument, SimpleDish } from "../food-plan-preview/foodPlan";
import {
	addDoc,
	collection,
	collectionData,
	CollectionReference,
	deleteDoc,
	doc,
	docData,
	DocumentReference,
	Firestore,
	query,
	updateDoc,
	where
} from "@angular/fire/firestore";
import { Timestamp } from "firebase/firestore";
import { Observable, of, pipe, zip } from "rxjs";
import { switchMap } from "rxjs/operators";
import { Food } from "../food-card/food";
import { FoodService } from "./food.service";

@Injectable({
	providedIn: 'root'
})
export class FoodPlanService {

	constructor(private afs: Firestore, private foodService: FoodService) {
	}

	convertDishToSimpleDish(dish: Dish): SimpleDish {
		return {
			index: dish.index,
			foodId: dish.food.id,
			ingredients: dish.ingredients
		} as SimpleDish;
	}

	convertFoodPlanToFoodPlanDoc(foodPlan: FoodPlan): FoodPlanDocument {
		return {
			id: foodPlan.id,
			foods: foodPlan.foods,
			date: foodPlan.date,
			group: foodPlan.group,
			dishes: foodPlan.dishes.map(d => this.convertDishToSimpleDish(d))
		} as FoodPlanDocument;
	}

	private convertFoodPlanDocToFoodPlan(foodPlanDoc: FoodPlanDocument, foods: Food[]): FoodPlan {
		let foodPlan = {
			id: foodPlanDoc.id,
			foods: foodPlanDoc.foods,
			date: foodPlanDoc.date,
			group: foodPlanDoc.group,
			dishes: []
		} as FoodPlan;

		foodPlanDoc.dishes?.forEach((s: SimpleDish) => {
			let dish: Dish = {
				index: s.index,
				ingredients: s.ingredients,
				food: foods.find(f => f.id == s.foodId) || {} as Food
			} as Dish;
			foodPlan.dishes.push(dish);
		});
		return foodPlan;
	}

	/**
	 * rxjs pipe to convert {@link FoodPlanDocument} to {@link FoodPlan}
	 */
	foodPlanDocsToFoodPlans = () => pipe(
		switchMap((foodPlanDocs: FoodPlanDocument[]) => {
			let foodIds = foodPlanDocs.map(f => f.dishes?.map(f => f.foodId)).flat(1);
			if (foodIds.some(f => f == undefined)) {
				let foodPlansWithoutDishes = foodPlanDocs.filter(f => f.dishes === undefined);
				console.error('FoodPlan(s) without dishes detected:', foodPlansWithoutDishes);
				foodIds = foodIds.filter(f => f !== undefined);
			}

			return zip(
				of(foodPlanDocs),
				this.foodService.getFoods(foodIds)
			);
		}),
		switchMap(([foodPlanDocs, foods]) => {
			// Map foodPlanDocs to
			let foodPlans: FoodPlan[] = [];
			foodPlanDocs.forEach(f => {
				let foodPlan = this.convertFoodPlanDocToFoodPlan(f, foods);
				foodPlans.push(foodPlan);
			});
			return of(foodPlans);
		})
	);

	sortSimpleDishesByIndex(dishes: SimpleDish[]): SimpleDish[] {
		return dishes.sort((a, b) => a.index - b.index);
	}

	/**
	 * Restart indexing of dishes from 0, following array's order
	 * @param dishes {Dish} {@link Dish}es to re-index
	 */
	reIndexSimpleDishes(dishes: SimpleDish[]): SimpleDish[] {
		dishes.forEach((dish, index) => {
			dish.index = index;
		});
		return dishes;
	}

	getFoodPlan(id: string): Observable<FoodPlan> {
		let ref = doc(this.afs, 'foodPlans', id) as DocumentReference<FoodPlanDocument>;
		return docData<FoodPlanDocument>(ref, {idField: 'id'}).pipe(
			switchMap(foodPlanDoc => {
				if (!foodPlanDoc) throw new Error("Failed to get FoodPlan document.");
				// Map food Ids to food objects
				let foodIds = foodPlanDoc.dishes?.map(f => f.foodId) ?? [];

				return zip(
					of(foodPlanDoc),
					this.foodService.getFoods(foodIds)
				);
			}),
			switchMap(([foodPlanDoc, foods]) => {
				let foodPlan = this.convertFoodPlanDocToFoodPlan(foodPlanDoc, foods);
				return of(foodPlan);
			})
		);
	}

	getFoodPlans(ids: string[]): Observable<FoodPlan[]> {
		return collectionData<FoodPlanDocument>(
			query<FoodPlanDocument>(
				collection(this.afs, 'foodPlans') as CollectionReference<FoodPlanDocument>,
				where('__name__', 'in', ids)
			), {idField: 'id'}
		).pipe(
			this.foodPlanDocsToFoodPlans()
		);
	}

	getFoodPlansBetweenDates(
		startDate: Timestamp,
		endDate: Timestamp,
		groupId: string
	): Observable<FoodPlan[]> {
		return collectionData<FoodPlanDocument>(
			query<FoodPlanDocument>(
				collection(this.afs, 'foodPlans') as CollectionReference<FoodPlanDocument>,
				where('date', '>=', startDate),
				where('date', '<=', endDate),
				where('group', '==', groupId)
			), {idField: 'id'}
		).pipe(
			this.foodPlanDocsToFoodPlans()
		);
	}

	/**
	 * Add a dish to a FoodPlan.
	 * Supports 'dummy' foodPlans that have id='' indicating a firestore document does not exist for this foodPlan.
	 * @param dish {SimpleDish} {@link SimpleDish} to add
	 * @param foodPlan {FoodPlanDocument} {@link FoodPlanDocument} to add dish to. id should be '' to indicate a firestore document needs to be created
	 */
	async addDishToFoodPlan(dish: SimpleDish, foodPlan: FoodPlanDocument) {
		if (foodPlan.id == '') {
			await addDoc(collection(this.afs, 'foodPlans'), {
				dishes: [dish],
				date: foodPlan.date,
				group: foodPlan.group
			});
		} else {
			let dishes = foodPlan.dishes ? foodPlan.dishes.concat(dish) : [dish];
			let foodRef = doc(this.afs, 'foodPlans', foodPlan.id);
			await updateDoc(foodRef, {
				dishes: dishes
			});
		}
	}

	getFoodPlanDocumentsBetweenDates(
		startDate: Timestamp,
		endDate: Timestamp,
		groupId: string
	): Observable<FoodPlanDocument[]> {
		return collectionData<FoodPlanDocument>(
			query<FoodPlanDocument>(
				collection(this.afs, 'foodPlans') as CollectionReference<FoodPlanDocument>,
				where('date', '>=', startDate),
				where('date', '<=', endDate),
				where('group', '==', groupId)
			), {idField: 'id'}
		);
	}

	updateFoodPlan(id: string, data: any) {
		return updateDoc(doc(this.afs, 'foodPlans', id), data);
	}

	/**
	 * Remove a dish from a FoodPlan. FoodPlan document will be deleted if this is the last dish.
	 * @param dish {SimpleDish} {@link SimpleDish} to remove
	 * @param foodPlan {FoodPlan} {@link FoodPlan} to remove dish from
	 */
	async removeDishFromFoodPlan(dish: SimpleDish, foodPlan: FoodPlan) {
		let foodPlanDoc = this.convertFoodPlanToFoodPlanDoc(foodPlan);
		const foodPlanRef = doc(this.afs, 'foodPlans', foodPlan.id);

		if (foodPlan.dishes.length <= 1) {
			await deleteDoc(foodPlanRef);
		} else {
			let updatedDishes = foodPlanDoc.dishes.filter(d => d.index != dish.index);
			this.sortSimpleDishesByIndex(updatedDishes);
			this.reIndexSimpleDishes(updatedDishes);

			await updateDoc(foodPlanRef, {
				dishes: updatedDishes
			});
		}
	}
}
