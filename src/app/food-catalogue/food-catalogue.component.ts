import { Component } from '@angular/core';
import { Observable, of } from "rxjs";
import { CatalogueItem } from "../catalogue-item/catalogueItem";
import { PriceHistory } from "../catalogue-item/priceHistory";
import { AuthService, SimpleUser } from "../services/auth.service";
import { switchMap, take } from "rxjs/operators";
import { CatalogueItemService } from "../services/catalogue-item.service";

@Component({
	selector: 'app-food-catalogue',
	templateUrl: './food-catalogue.component.html',
	styleUrls: ['./food-catalogue.component.scss']
})
export class FoodCatalogueComponent {

	user$: Observable<SimpleUser | null> = this.authService.getSimpleUser();
	catalogueItems$: Observable<CatalogueItem[]>;
	priceHistories = new Map();

	constructor(private authService: AuthService, private catalogueItemService: CatalogueItemService) {
		this.catalogueItems$ = this.user$.pipe(switchMap(user => {
			if (user == null) {
				return of([] as CatalogueItem[]);
			}
			return catalogueItemService.getCatalogueItemsByGroup(user.selectedGroup);
		}));

		this.getPriceHistory();
	}

	async getPriceHistory() {
		this.user$.pipe(take(1)).subscribe(async user => {
			if (user == null) {
				return;
			}

			let allPriceHistories = await this.catalogueItemService.getPriceHistoriesByGroupOrderByDate(user.selectedGroup);
			allPriceHistories.forEach(t => {
				// Ensure items in map has valid price
				if (!t.data().price) {
					return;
				}

				let currentPriceHistory: PriceHistory = this.priceHistories.get(t.ref.parent.parent?.id);

				if (!currentPriceHistory) {
					this.priceHistories.set(t.ref.parent.parent?.id, t.data());		// Add if it doesn't exist
				} else {
					if (currentPriceHistory.price && (t.data().price < currentPriceHistory.price) && t.data().store != currentPriceHistory.store) {
						this.priceHistories.set(t.ref.parent.parent?.id, t.data());		// Add if better price is found
					}
				}
			});
		});
	}
}
