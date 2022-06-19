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
import { forkJoin, Observable, of, zip } from "rxjs";
import { switchMap, take } from "rxjs/operators";
import { Food } from "../food-card/food";

@Injectable({
	providedIn: 'root'
})
export class FoodPlanService {

	constructor(private afs: Firestore) {
	}

	convertDishToSimpleDish(dish: Dish): SimpleDish {
		return {
			index: dish.index,
			foodId: dish.food.id,
			ingredients: dish.ingredients
		} as SimpleDish;
	}

	getFoodPlan(id: string): Observable<FoodPlan> {
		let ref = doc(this.afs, 'foodPlans', id) as DocumentReference<FoodPlanDocument>;
		return docData<FoodPlanDocument>(ref, {idField: 'id'}).pipe(
			switchMap(foodPlanDoc => {
				// Get food objects
				let foodIds = foodPlanDoc.dishes?.map(f => f.foodId) ?? [];

				let foods$: Observable<Food[]>[] = [];
				if (foodIds.length == 0) {
					foods$.push(of([]));
				}

				// Batch food queries into 10 (limit of 'in' query)
				while (foodIds.length > 0) {
					let batchedFoodIds: string[] = foodIds.splice(0, 10);
					let batchedFoodsObservable = collectionData<Food>(
						query<Food>(
							collection(this.afs, 'foods') as CollectionReference<Food>,
							where('__name__', 'in', batchedFoodIds)
						), {idField: 'id'}
					).pipe(take(1));
					foods$.push(batchedFoodsObservable);
				}

				return zip(
					of(foodPlanDoc),
					forkJoin(foods$)
				);
			}),
			switchMap(([foodPlanDoc, batchedFoods]) => {
				let foods = batchedFoods.flat(1);

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

				return of(foodPlan);
			})
		);
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
	 * Add a food to a FoodPlan.
	 * Supports 'dummy' foodPlans that have id='' indicating a firestore document does not exist for this foodPlan.
	 * @param foodId {string} {@link Food} to add
	 * @param foodPlan {FoodPlanDocument} {@link FoodPlanDocument} to add food to. id should be '' to indicate a firestore document needs to be created
	 */
	async addFoodToFoodPlan(foodId: string, foodPlan: FoodPlanDocument) {
		if (foodPlan.id == '') {
			await addDoc(collection(this.afs, 'foodPlans'), {
				foods: [foodId],
				date: foodPlan.date,
				group: foodPlan.group
			});
		} else {
			let foods = foodPlan.foods ? foodPlan.foods.concat([foodId]) : [foodId];
			let foodRef = doc(this.afs, 'foodPlans', foodPlan.id);
			await updateDoc(foodRef, {
				foods: foods
			});
		}
	}

	/**
	 * Remove a food from a FoodPlan. FoodPlan document will be deleted if this is the last food.
	 * @param foodId {string} {@link Food} to remove
	 * @param foodPlan {FoodPlanDocument} {@link FoodPlanDocument} to remove food from
	 */
	async removeFoodFromFoodPlan(foodId: string, foodPlan: FoodPlanDocument) {
		if (!foodPlan.foods) {
			return;
		}

		const foodPlanRef = doc(this.afs, 'foodPlans', foodPlan.id);
		if (foodPlan.foods.length <= 1) {
			await deleteDoc(foodPlanRef);
		} else {
			let updatedFoods = foodPlan.foods.filter(food => food != foodId);
			await updateDoc(foodPlanRef, {
				foods: updatedFoods
			});
		}
	}
}
