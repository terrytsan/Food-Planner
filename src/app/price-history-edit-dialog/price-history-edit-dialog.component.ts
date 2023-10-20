import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { PriceHistory } from "../catalogue-item/priceHistory";
import { Timestamp } from "firebase/firestore";
import { CatalogueItemService } from "../services/catalogue-item.service";

@Component({
	selector: 'app-price-history-edit-dialog',
	templateUrl: './price-history-edit-dialog.component.html',
	styleUrls: ['./price-history-edit-dialog.component.scss']
})
export class PriceHistoryEditDialogComponent {

	catalogueItemId: string;
	priceHistoryId: string;
	date: Date;
	price: number;
	store: string;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: PriceHistoryEditDialogData,
		public dialogRef: MatDialogRef<PriceHistoryEditDialogComponent>,
		private catalogueItemService: CatalogueItemService
	) {
		this.catalogueItemId = data.CatalogueItemId;
		this.priceHistoryId = data.PriceHistory.id;
		this.date = data.PriceHistory.date?.toDate() || new Date();
		this.price = data.PriceHistory.price || 0;
		this.store = data.PriceHistory.store || '';
	}

	async updatePriceHistory() {
		await this.catalogueItemService.updatePriceHistory(this.catalogueItemId, this.priceHistoryId, {
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
