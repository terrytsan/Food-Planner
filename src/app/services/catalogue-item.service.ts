import { Injectable } from '@angular/core';
import {
	addDoc,
	collection,
	collectionData,
	collectionGroup,
	CollectionReference,
	deleteDoc,
	doc,
	docData,
	DocumentReference,
	Firestore,
	getDocs,
	orderBy,
	query,
	setDoc,
	updateDoc,
	where,
	writeBatch
} from "@angular/fire/firestore";
import { CatalogueItem } from "../catalogue-item/catalogueItem";
import { Observable } from "rxjs";
import { PriceHistory } from "../catalogue-item/priceHistory";
import { MatSnackBar } from "@angular/material/snack-bar";
import { isNonNullOrUndefined } from "../utils";
import { filter } from "rxjs/operators";

@Injectable({
	providedIn: 'root'
})
export class CatalogueItemService {

	constructor(private afs: Firestore, private _snackBar: MatSnackBar) {
	}

	//region CatalogueItem

	getCatalogueItem(id: string): Observable<CatalogueItem> {
		let ref = doc(this.afs, 'catalogueItems', id) as DocumentReference<CatalogueItem>;
		return docData<CatalogueItem>(ref, { idField: 'id' }).pipe(filter(isNonNullOrUndefined));
	}

	getCatalogueItemsByGroup(groupId: string): Observable<CatalogueItem[]> {
		return collectionData<CatalogueItem>(
			query<CatalogueItem, CatalogueItem>(
				collection(this.afs, 'catalogueItems') as CollectionReference<CatalogueItem, CatalogueItem>,
				where('group', '==', groupId)
			), { idField: 'id' }
		);
	}

	addCatalogueItem(data: any) {
		return addDoc(collection(this.afs, 'catalogueItems'), data);
	}

	updateCatalogueItem(id: string, data: any) {
		return updateDoc(doc(this.afs, 'catalogueItems', id), data);
	}

	async updateCatalogueItemStatus(id: string, status: string) {
		const catalogueItemRef = doc(this.afs, 'catalogueItems', id);
		await updateDoc(catalogueItemRef, {
			status: status
		});
	}

	async deleteCatalogueItem(catalogueItemId: string, priceHistories: PriceHistory[]) {
		// Delete Price Histories
		await this.batchDeletePriceHistories(catalogueItemId, priceHistories);

		// Delete Catalogue Item
		const catalogueItemRef = doc(this.afs, 'catalogueItems', catalogueItemId);
		await deleteDoc(catalogueItemRef);
	}

	//endregion

	//region PriceHistory

	/**
	 * Gets all price histories for all catalogue items.
	 * This is promise based as collection doesn't return information about parent document.
	 * @param groupId GroupID of desired price histories
	 */
	getPriceHistoriesByGroupOrderByDate(groupId: string) {
		let priceHistoryQuery = query(
			collectionGroup(this.afs, 'priceHistory'),
			where('group', '==', groupId),
			orderBy('date', 'desc'));
		return getDocs(priceHistoryQuery);
	}

	getPriceHistoriesForCatalogueItem(id: string, groupId: string): Observable<PriceHistory[]> {
		return collectionData<PriceHistory>(
			query<PriceHistory, PriceHistory>(
				collection(this.afs, 'catalogueItems', id, 'priceHistory') as CollectionReference<PriceHistory, PriceHistory>,
				where('group', '==', groupId),
				orderBy('date', 'desc')
			), { idField: 'id' }
		);
	}

	addPriceHistory(catalogueItemId: string, data: any) {
		return addDoc(collection(this.afs, 'catalogueItems', catalogueItemId, 'priceHistory'), data);
	}

	updatePriceHistory(catalogueItemId: string, priceHistoryId: string, data: any) {
		const catalogueItemRef = doc(this.afs, 'catalogueItems', catalogueItemId, 'priceHistory', priceHistoryId);
		return updateDoc(catalogueItemRef, data);
	}

	async deletePriceHistoryWithUndo(catalogueItemId: string, history: PriceHistory) {
		let priceHistoryRef = doc(this.afs, 'catalogueItems', catalogueItemId, 'priceHistory', history.id);
		await deleteDoc(priceHistoryRef);

		let snackBarRef = this._snackBar.open(`Deleted ${(history.date?.toDate().toLocaleDateString())}.`, 'Undo', { duration: 3000 });
		snackBarRef.onAction().subscribe(async () => {
			await setDoc(doc(this.afs, 'catalogueItems', catalogueItemId, 'priceHistory', history.id), {
				date: history.date,
				price: history.price,
				store: history.store,
				group: history.group
			});
		});
	}

	async batchDeletePriceHistories(catalogueItemId: string, priceHistories: PriceHistory[]) {
		const batch = writeBatch(this.afs);
		priceHistories.forEach(pH => {
			let pHRef = doc(this.afs, 'catalogueItems', catalogueItemId, 'priceHistory', pH.id);
			batch.delete(pHRef);
		});
		await batch.commit();
	}

	//endregion
}
