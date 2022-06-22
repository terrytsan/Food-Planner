import { Component, OnInit } from '@angular/core';
import { FoodPlanService } from "../services/food-plan.service";
import { Dish, FoodPlan, SimpleDish } from "../food-plan-preview/foodPlan";
import { EMPTY, Subject } from "rxjs";
import { catchError, takeUntil } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { Food } from "../food-card/food";
import { UtilsService } from "../services/utils.service";

@Component({
	selector: 'app-food-plan-details',
	templateUrl: './food-plan-details.component.html',
	styleUrls: ['./food-plan-details.component.css']
})
export class FoodPlanDetailsComponent implements OnInit {

	id: string;
	foodPlan: FoodPlanDetails;
	foodPlanLoadError: boolean = false;

	ngUnsubscribe = new Subject<void>();					// Used for unsubscribing from observable

	constructor(private route: ActivatedRoute, private foodPlanService: FoodPlanService) {
		this.id = this.route.snapshot.params['id'];

		let foodPlan$ = foodPlanService.getFoodPlan(this.id);
		foodPlan$.pipe(
			takeUntil(this.ngUnsubscribe),
			catchError(() => {
				this.foodPlanLoadError = true;
				return EMPTY;
			})
		).subscribe(t => {
			t.dishes = t.dishes.sort((a, b) => a.index - b.index);

			// Map to local modal to avoid function calls in template
			this.foodPlan = {
				...t,
				dishes: t.dishes.map(d => {
					return {
						...d,
						additionalIngredients: this.getAdditionalIngredients(d),
						food: {
							...d.food,
							allIngredients: UtilsService.combineArrays(d.food.coreIngredients, d.food.optionalIngredients)
						} as FoodPlanDetailsFood
					} as FoodPlanDetailsDish;
				})
			};
		});
	}

	ngOnInit(): void {
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	isIngredientChecked(dish: Dish, ingredient: string): boolean {
		return dish.ingredients.includes(ingredient);
	}

	ingredientClicked(dish: Dish, ingredient: string) {
		let index = this.foodPlan.dishes.findIndex(d => d.index == dish.index);

		if (this.foodPlan.dishes[index].ingredients.includes(ingredient)) {
			this.foodPlan.dishes[index].ingredients = this.foodPlan.dishes[index].ingredients.filter(i => i != ingredient);
		} else {
			this.foodPlan.dishes[index].ingredients.push(ingredient);
		}

		let simpleDishes: SimpleDish[] = [];
		this.foodPlan.dishes.forEach(d => {
			simpleDishes.push(this.foodPlanService.convertDishToSimpleDish(d));
		});

		this.foodPlanService.updateFoodPlan(this.foodPlan.id, {dishes: simpleDishes});
	}

	/**
	 * Ingredients that aren't in core/optional
	 * @param dish {Dish} to get additional ingredients for
	 */
	getAdditionalIngredients(dish: Dish): string[] {
		let foodIngredients = UtilsService.combineArrays(dish.food.coreIngredients, dish.food.optionalIngredients);

		return dish.ingredients.filter(i => !foodIngredients.includes(i));
	}
}

export interface FoodPlanDetails extends FoodPlan {
	dishes: FoodPlanDetailsDish[];
}

export interface FoodPlanDetailsDish extends Dish {
	additionalIngredients: string[];
	food: FoodPlanDetailsFood;
}

export interface FoodPlanDetailsFood extends Food {
	allIngredients: string[];
}
