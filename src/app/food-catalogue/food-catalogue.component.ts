import { Component, OnInit } from '@angular/core';
import { Observable, of } from "rxjs";
import { CatalogueItem } from "../catalogue-item/catalogueItem";
import {
	collection,
	collectionData,
	collectionGroup,
	CollectionReference,
	Firestore,
	getDocs,
	orderBy,
	query,
	where
} from "@angular/fire/firestore";
import { PriceHistory } from "../catalogue-item/priceHistory";
import { AuthService, SimpleUser } from "../auth.service";
import { switchMap, take } from "rxjs/operators";

@Component({
	selector: 'app-food-catalogue',
	templateUrl: './food-catalogue.component.html',
	styleUrls: ['./food-catalogue.component.css']
})
export class FoodCatalogueComponent implements OnInit {

	user$: Observable<SimpleUser | null> = this.authService.getSimpleUser();
	catalogueItems$: Observable<CatalogueItem[]>;
	priceHistories = new Map();

	constructor(private firestore: Firestore, private authService: AuthService) {
		this.catalogueItems$ = this.user$.pipe(switchMap(user => {
			if (user == null) {
				return of([] as CatalogueItem[]);
			}
			return collectionData<CatalogueItem>(
				query<CatalogueItem>(
					collection(firestore, 'catalogueItems') as CollectionReference<CatalogueItem>,
					where('group', '==', user.selectedGroup)
				), {idField: 'id'}
			);
		}));

		this.getPriceHistory();
	}

	ngOnInit(): void {
	}

	async getPriceHistory() {
		this.user$.pipe(take(1)).subscribe(async user => {
			if (user == null) {
				return;
			}
			let priceHistoryQuery = query(
				collectionGroup(this.firestore, 'priceHistory'),
				where('group', '==', user?.selectedGroup),
				orderBy('date', 'desc'));
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
		});
	}
}
