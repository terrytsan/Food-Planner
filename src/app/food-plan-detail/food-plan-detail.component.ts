import { Component, Input, OnInit } from '@angular/core';
import { FoodPlan } from "./foodPlan";
import { Food } from "../food-card/food";
import { Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { ChooseFoodDialogComponent } from "../choose-food-dialog/choose-food-dialog.component";
import {
	collection,
	collectionData,
	CollectionReference,
	doc,
	Firestore,
	query,
	updateDoc,
	where
} from "@angular/fire/firestore";

@Component({
	selector: 'app-food-plan-detail',
	templateUrl: './food-plan-detail.component.html',
	styleUrls: ['./food-plan-detail.component.css']
})
export class FoodPlanDetailComponent implements OnInit {

	@Input() foodPlan: FoodPlan = {} as FoodPlan;

	foods$: Observable<Food[]>;
	showAddFoodsBtn: boolean = true;

	constructor(private afs: Firestore, public dialog: MatDialog) {
	}

	ngOnInit(): void {
		if (this.foodPlan.foods) {
			// __name__ is document id
			this.foods$ = collectionData<Food>(
				query<Food>(
					collection(this.afs, 'foods') as CollectionReference<Food>,
					where('__name__', 'in', this.foodPlan.foods)
				), {idField: 'id'}
			);

			this.showAddFoodsBtn = this.foodPlan.foods.length <= 10;		// "in" query limited to max 10
		}
	}

	addFood() {
		const dialogRef = this.dialog.open(ChooseFoodDialogComponent, {
			width: '500px',
			autoFocus: false
		});

		dialogRef.afterClosed().subscribe(async result => {
			if (result) {
				let foods = this.foodPlan.foods ? this.foodPlan.foods.concat([result.id]) : [result.id];
				let foodRef = doc(this.afs, 'foodPlans', this.foodPlan.id);
				await updateDoc(foodRef, {
					foods: foods
				});
			}
		});
	}
}
