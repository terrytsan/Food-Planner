import { Injectable } from '@angular/core';
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
	orderBy,
	query,
	setDoc,
	updateDoc,
	where
} from "@angular/fire/firestore";
import { Food } from "../food-card/food";
import { combineLatest, Observable, of } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { filter, map } from "rxjs/operators";
import { isNonNullOrUndefined } from "../utils";

@Injectable({
	providedIn: 'root'
})
export class FoodService {

	constructor(private afs: Firestore, private _snackBar: MatSnackBar) {
	}

	getFood(id: string): Observable<Food> {
		let ref = doc(this.afs, 'foods', id) as DocumentReference<Food>;
		return docData<Food>(ref, { idField: 'id' }).pipe(filter(isNonNullOrUndefined));
	}

	/**
	 * Get all foods with IDs.
	 * Uses batching internally to supports >10IDs.
	 * @param ids Food IDs
	 */
	getFoods(ids: string[]): Observable<Food[]> {
		let foods$: Observable<Food[]>[] = [];
		let foodIds: string[] = [...new Set(ids)];		// Keep unique ids only

		if (foodIds.length == 0) {
			return of([]);
		}

		// Batch food queries into 10 (current limit of 'in' query)
		while (foodIds.length > 0) {
			let batchedFoodIds: string[] = foodIds.splice(0, 10);
			let batchedFoodsObservable = collectionData<Food>(
				query<Food, Food>(
					collection(this.afs, 'foods') as CollectionReference<Food, Food>,
					where('__name__', 'in', batchedFoodIds)				// __name__ is document id
				), { idField: 'id' }
			);
			foods$.push(batchedFoodsObservable);
		}

		return combineLatest(foods$).pipe(map(batchedFoods => batchedFoods.flat(1)));
	}

	getFoodsByGroupOrderByName(groupId: string): Observable<Food[]> {
		return collectionData<Food>(
			query<Food, Food>(
				collection(this.afs, 'foods') as CollectionReference<Food, Food>,
				where('group', '==', groupId),
				orderBy('name')
			), { idField: 'id' }
		);
	}

	addFood(data: any) {
		return addDoc(collection(this.afs, 'foods'), data);
	}

	updateFood(id: string, data: any) {
		return updateDoc(doc(this.afs, 'foods', id), data);
	}

	async deleteFoodWithUndo(foodToDelete: Food) {
		let foodRef = doc(this.afs, 'foods', foodToDelete.id);
		await deleteDoc(foodRef);

		let snackBarRef = this._snackBar.open(`Deleted ${foodToDelete.name}.`, 'Undo', { duration: 3000 });
		snackBarRef.onAction().subscribe(async () => {
			if (!foodToDelete) return;

			await setDoc(doc(this.afs, 'foods', foodToDelete.id), {
				name: foodToDelete.name,
				description: foodToDelete.description,
				image: foodToDelete.image,
				imagePath: foodToDelete.imagePath,
				labels: foodToDelete.labels
			});
		});
	}
}
