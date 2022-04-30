import { Injectable } from '@angular/core';
import { FoodPlan } from "../food-plan-detail/foodPlan";
import { addDoc, collection, deleteDoc, doc, Firestore, updateDoc } from "@angular/fire/firestore";

@Injectable({
	providedIn: 'root'
})
export class FoodPlanService {

	constructor(private afs: Firestore) {
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
