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
import { Observable } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
	providedIn: 'root'
})
export class FoodService {

	constructor(private afs: Firestore, private _snackBar: MatSnackBar) {
	}

	getFood(id: string): Observable<Food> {
		let ref = doc(this.afs, 'foods', id) as DocumentReference<Food>;
		return docData<Food>(ref, {idField: 'id'});
	}

	/**
	 * Get all foods with IDs.
	 * Note: "in" query is currently limited to 10.
	 * @param ids Food IDs
	 */
	getFoods(ids: string[]): Observable<Food[]> {
		// __name__ is document id
		return collectionData<Food>(
			query<Food>(
				collection(this.afs, 'foods') as CollectionReference<Food>,
				where('__name__', 'in', ids)
			), {idField: 'id'}
		);
	}

	getFoodsByGroupOrderByName(groupId: string): Observable<Food[]> {
		return collectionData<Food>(
			query<Food>(
				collection(this.afs, 'foods') as CollectionReference<Food>,
				where('group', '==', groupId),
				orderBy('name')
			), {idField: 'id'}
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

		let snackBarRef = this._snackBar.open(`Deleted ${foodToDelete.name}.`, 'Undo', {duration: 3000});
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
