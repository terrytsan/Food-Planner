import { Component, OnInit } from '@angular/core';
import { collection, collectionData, CollectionReference, Firestore, orderBy, query } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Food } from "../food-card/food";
import { MatDialog } from "@angular/material/dialog";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";

@Component({
	selector: 'app-foods',
	templateUrl: './foods.component.html',
	styleUrls: ['./foods.component.css']
})
export class FoodsComponent implements OnInit {

	foods$: Observable<Food[]>;

	constructor(firestore: Firestore, public dialog: MatDialog) {
		this.foods$ = collectionData<Food>(
			query<Food>(
				collection(firestore, 'foods') as CollectionReference<Food>,
				orderBy('name')
			), {idField: 'id'}
		);
	}

	ngOnInit(): void {
	}

	openAddFoodDialog() {
		this.dialog.open(FoodEditDialogComponent, {
			width: '298px'
		});
	}
}
