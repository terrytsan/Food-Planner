import { Component, OnInit } from '@angular/core';
import { collection, collectionData, CollectionReference, Firestore, query } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Food } from "../food-detail/food";

@Component({
	selector: 'app-foods',
	templateUrl: './foods.component.html',
	styleUrls: ['./foods.component.css']
})
export class FoodsComponent implements OnInit {

	foods$: Observable<Food[]>;

	constructor(firestore: Firestore) {
		this.foods$ = collectionData<Food>(query<Food>(
				collection(firestore, 'foods') as CollectionReference<Food>
			), {idField: 'id'}
		);
	}

	ngOnInit(): void {
	}

}
