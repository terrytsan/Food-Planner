import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Dish, FoodPlan } from "../food-plan-preview/foodPlan";
import { Timestamp } from "firebase/firestore";
import { LocalStorageService } from "../services/local-storage.service";

@Component({
	selector: 'app-shopping-list',
	templateUrl: './shopping-list.component.html',
	styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent implements OnInit {

	shoppingListTtl: number = 14;		// Time in days for shopping list to be considered expired

	groupedIngredients: Ingredient[];

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: ShoppingListData,
		private localStorageService: LocalStorageService
	) {
	}

	ngOnInit(): void {
		let dishes: Dish[] = this.data.FoodPlans.map(f => f.dishes).flat(1);
		let ingredientStrings: string[] = dishes.map(d => d.ingredients).flat(1);

		let ingredients: Ingredient[] = ingredientStrings.map(i => new Ingredient(i));
		this.groupedIngredients = this.groupIngredients(ingredients);

		// Retrieve checked status of ingredients from local storage
		let stored = this.localStorageService.getShoppingList(this.data.startDate, this.data.endDate);

		if (stored) {
			if (!stored.hasExpired()) {
				stored.ingredients.forEach(t => {
					let match = this.groupedIngredients.find(i => Ingredient.isSameIngredient(i, t));
					if (match) {
						// Update checked to match value in local storage
						match.checked = t.checked;
					}
				});
			} else {
				this.localStorageService.removeShoppingList(stored);
			}
		}
	}

	/**
	 * Groups ingredients with the same name and unit and sums the count.
	 * @param ingredients array of {@link ingredients} to group
	 */
	groupIngredients(ingredients: Ingredient[]): Ingredient[] {
		return ingredients.reduce((previousValue, currentValue) => {
			// Check if it's been found already
			let index = previousValue.findIndex(i => Ingredient.isSameIngredient(i, currentValue));
			if (index > -1) {
				// If found, combine count
				previousValue[index].count += currentValue.count;
				return previousValue;
			} else {
				previousValue.push(currentValue);
				return previousValue;
			}
		}, [] as Ingredient[]);
	}

	ingredientClicked(ingredient: Ingredient) {
		ingredient.toggleIngredientChecked();
		this.localStorageService.saveShoppingList(new ShoppingList(this.data.startDate, this.data.endDate, this.groupedIngredients, this.calculateExpiryDate()));
	}

	calculateExpiryDate(): Date {
		let result = new Date();
		result.setDate(result.getDate() + this.shoppingListTtl);
		return result;
	}
}

export interface ShoppingListData {
	FoodPlans: FoodPlan[];
	startDate: Timestamp;
	endDate: Timestamp;
}

export class Ingredient {
	count: number = 1;
	unit?: string;
	name: string;
	checked: boolean = false;

	constructor(ingredientString: string) {
		let index = ingredientString.indexOf(' ');

		if (index <= -1) {
			// No blank space - assume no count/unit
			this.name = ingredientString;
			this.count = 0;
			return;
		}
		let countAndUnit = ingredientString.substring(0, index);
		this.name = ingredientString.substring(index + 1);

		let count = parseFloat(countAndUnit);

		if (count) {
			this.count = count;
		}
		let unit = countAndUnit.replace(count ? count.toString() : '', '');
		if (unit) {
			this.unit = unit;
		}
	}

	/**
	 * Determine if two ingredients are the same (same name and unit).
	 * @param a First {@link Ingredient} to compare
	 * @param b Second {@link Ingredient} to compare
	 */
	static isSameIngredient(a: Ingredient, b: Ingredient): boolean {
		return a.name.toLowerCase() === b.name.toLowerCase() && a.unit?.toLowerCase() === b.unit?.toLowerCase();
	}

	toggleIngredientChecked(): void {
		this.checked = !this.checked;
	}
}

export class ShoppingList {
	startDate: Timestamp;
	endDate: Timestamp;
	ingredients: Ingredient[];
	expiry: Date = new Date();

	constructor(startDate: Timestamp, endDate: Timestamp, ingredients: Ingredient[], expiry: Date) {
		this.startDate = startDate;
		this.endDate = endDate;
		this.ingredients = ingredients;
		this.expiry = expiry;
	}

	hasExpired(): boolean {
		return new Date() >= this.expiry;
	}
}
