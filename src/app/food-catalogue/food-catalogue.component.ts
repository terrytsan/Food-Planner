import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { CatalogueItem } from "../catalogue-item/catalogueItem";
import { collection, collectionData, CollectionReference, Firestore, query } from "@angular/fire/firestore";

@Component({
	selector: 'app-food-catalogue',
	templateUrl: './food-catalogue.component.html',
	styleUrls: ['./food-catalogue.component.css']
})
export class FoodCatalogueComponent implements OnInit {

	catalogueItems$: Observable<CatalogueItem[]>;

	constructor(firestore: Firestore) {
		this.catalogueItems$ = collectionData<CatalogueItem>(
			query<CatalogueItem>(
				collection(firestore, 'catalogueItems') as CollectionReference<CatalogueItem>
			), {idField: 'id'}
		);
	}

	ngOnInit(): void {
	}

}
