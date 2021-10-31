import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from "rxjs";
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
	randomFood: Food;
	foodSubscription: Subscription;

	constructor(public dialogRef: MatDialogRef<FoodEditDialogComponent>, firestore: Firestore) {
		this.foods$ = collectionData<Food>(query<Food>(
				collection(firestore, 'foods') as CollectionReference<Food>
			), {idField: 'id'}
		);

		this.foodSubscription = this.foods$.subscribe(foods => {
			this.randomFood = foods[Math.floor(Math.random() * foods.length)];
		});
	}

	ngOnInit(): void {
	}

	ngOnDestroy() {
		this.foodSubscription.unsubscribe();
	}

	chooseFood(food: Food) {
		this.dialogRef.close(food);
	}

	chooseRandomFood() {
		this.dialogRef.close(this.randomFood);
	}
}
