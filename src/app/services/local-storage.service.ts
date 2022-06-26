import { Injectable } from '@angular/core';
import { Timestamp } from "firebase/firestore";
import { ShoppingList } from "../shopping-list/shopping-list.component";

@Injectable({
	providedIn: 'root'
})
export class LocalStorageService {

	constructor() {
	}

	removeItem(key: string): void {
		localStorage.removeItem(key);
	}

	//region Shopping List

	getShoppingListKey(startDate: Timestamp, endDate: Timestamp): string {
		return `${startDate.toDate().toISOString()}|${endDate.toDate().toISOString()}`;
	}

	/**
	 * Get shopping list for given date range from local storage
	 * @param startDate
	 * @param endDate
	 */
	getShoppingList(startDate: Timestamp, endDate: Timestamp): ShoppingList | null {
		let key = this.getShoppingListKey(startDate, endDate);
		let retrieved = localStorage.getItem(key);
		if (retrieved == null) {
			return null;
		}

		let parsed = JSON.parse(retrieved);
		return new ShoppingList(
			new Timestamp(parsed.startDate.seconds, parsed.startDate.nanoseconds),
			new Timestamp(parsed.endDate.seconds, parsed.endDate.nanoseconds),
			parsed.ingredients,
			new Date(parsed.expiry)
		);
	}

	/**
	 * Save shopping list to local storage, using startDate and endDate as key
	 * @param shoppingList {@link ShoppingList} to save
	 */
	saveShoppingList(shoppingList: ShoppingList) {
		let key = this.getShoppingListKey(shoppingList.startDate, shoppingList.endDate);
		localStorage.setItem(key, JSON.stringify(shoppingList));
	}

	removeShoppingList(shoppingList: ShoppingList) {
		this.removeItem(this.getShoppingListKey(shoppingList.startDate, shoppingList.endDate));
	}

	//endregion
}
