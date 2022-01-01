import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { PriceHistory } from "../catalogue-item/priceHistory";
import { doc, Firestore, updateDoc } from "@angular/fire/firestore";
import { Timestamp } from "firebase/firestore";

@Component({
	selector: 'app-price-history-edit-dialog',
	templateUrl: './price-history-edit-dialog.component.html',
	styleUrls: ['./price-history-edit-dialog.component.css']
})
export class PriceHistoryEditDialogComponent implements OnInit {

	catalogueItemId: string;
	priceHistoryId: string;
	date: Date;
	price: number;
	store: string;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: PriceHistoryEditDialogData,
		public dialogRef: MatDialogRef<PriceHistoryEditDialogComponent>,
		private afs: Firestore
	) {
		this.catalogueItemId = data.CatalogueItemId;
		this.priceHistoryId = data.PriceHistory.id;
		this.date = data.PriceHistory.date?.toDate() || new Date();
		this.price = data.PriceHistory.price || 0;
		this.store = data.PriceHistory.store || '';
	}

	ngOnInit(): void {
	}

	async updatePriceHistory() {
		const catalogueItemRef = doc(this.afs, 'catalogueItems', this.catalogueItemId, 'priceHistory', this.priceHistoryId);
		await updateDoc(catalogueItemRef, {
			date: Timestamp.fromDate(this.date),
			price: this.price,
			store: this.store
		});
		this.dialogRef.close();
	}

	onCancelClick() {
		this.dialogRef.close();
	}
}

export interface PriceHistoryEditDialogData {
	CatalogueItemId: string;
	PriceHistory: PriceHistory;
}
