import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { Food } from "../food-detail/food";
import { collection, collectionData, CollectionReference, Firestore, query } from "@angular/fire/firestore";
import { MatDialogRef } from "@angular/material/dialog";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";

@Component({
	selector: 'app-choose-food-dialog',
	templateUrl: './choose-food-dialog.component.html',
	styleUrls: ['./choose-food-dialog.component.css']
})
export class ChooseFoodDialogComponent implements OnInit {

	defaultImage: string = "assets/images/placeholder.jpg";
	foods$: Observable<Food[]>;

	constructor(public dialogRef: MatDialogRef<FoodEditDialogComponent>, firestore: Firestore) {
		this.foods$ = collectionData<Food>(query<Food>(
				collection(firestore, 'foods') as CollectionReference<Food>
			), {idField: 'id'}
		);
	}

	ngOnInit(): void {
	}

	chooseFood(food: Food) {
		this.dialogRef.close(food);
	}
}
