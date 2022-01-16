import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { CatalogueItem } from "../catalogue-item/catalogueItem";
import {
	collection,
	collectionData,
	collectionGroup,
	CollectionReference,
	Firestore,
	getDocs,
	orderBy,
	query
} from "@angular/fire/firestore";
import { PriceHistory } from "../catalogue-item/priceHistory";

@Component({
	selector: 'app-food-catalogue',
	templateUrl: './food-catalogue.component.html',
	styleUrls: ['./food-catalogue.component.css']
})
export class FoodCatalogueComponent implements OnInit {

	catalogueItems$: Observable<CatalogueItem[]>;
	priceHistories = new Map();

	constructor(private firestore: Firestore) {
		this.catalogueItems$ = collectionData<CatalogueItem>(
			query<CatalogueItem>(
				collection(firestore, 'catalogueItems') as CollectionReference<CatalogueItem>
			), {idField: 'id'}
		);

		this.getPriceHistory();
	}

	ngOnInit(): void {
	}

	async getPriceHistory() {
		let priceHistoryQuery = query(collectionGroup(this.firestore, 'priceHistory'), orderBy('date', 'desc'));
		let allPriceHistories = await getDocs(priceHistoryQuery);

		allPriceHistories.forEach(t => {
			// Ensure items in map has valid price
			if (!t.data().price) {
				return;
			}

			let currentPriceHistory: PriceHistory = this.priceHistories.get(t.ref.parent.parent?.id);

			if (!currentPriceHistory) {
				this.priceHistories.set(t.ref.parent.parent?.id, t.data());		// Add if it doesn't exist
			} else {
				if (currentPriceHistory.price && (t.data().price < currentPriceHistory.price)) {
					this.priceHistories.set(t.ref.parent.parent?.id, t.data());		// Add if better price is found
				}
			}
		});
	}
}
