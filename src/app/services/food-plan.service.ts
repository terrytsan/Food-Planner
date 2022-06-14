import { Injectable } from '@angular/core';
import { FoodPlan } from "../food-plan-preview/foodPlan";
import {
	addDoc,
	collection,
	collectionData,
	CollectionReference,
	deleteDoc,
	doc,
	Firestore,
	query,
	updateDoc,
	where
} from "@angular/fire/firestore";
import { Timestamp } from "firebase/firestore";
import { Observable } from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class FoodPlanService {

	constructor(private afs: Firestore) {
	}

	getFoodPlansBetweenDates(startDate: Timestamp, endDate: Timestamp, groupId: string): Observable<FoodPlan[]> {
		return collectionData<FoodPlan>(
			query<FoodPlan>(
				collection(this.afs, 'foodPlans') as CollectionReference<FoodPlan>,
				where('date', '>=', startDate),
				where('date', '<=', endDate),
				where('group', '==', groupId)
			), {idField: 'id'}
		);
	}

	/**
	 * Add a food to a FoodPlan.
	 * Supports 'dummy' foodPlans that have id='' indicating a firestore document does not exist for this foodPlan.
	 * @param foodId {string} {@link Food} to add
	 * @param foodPlan {FoodPlan} {@link FoodPlan} to add food to. id should be '' to indicate a firestore document needs to be created
	 */
	async addFoodToFoodPlan(foodId: string, foodPlan: FoodPlan) {
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
	 * @param foodPlan {FoodPlan} {@link FoodPlan} to remove food from
	 */
	async removeFoodFromFoodPlan(foodId: string, foodPlan: FoodPlan) {
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
