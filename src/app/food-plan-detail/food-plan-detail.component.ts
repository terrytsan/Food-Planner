import { Component, Input, OnInit } from '@angular/core';
import { FoodPlan } from "./foodPlan";
import { Food } from "../food-detail/food";
import { Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { MatDialog } from "@angular/material/dialog";
import { ChooseFoodDialogComponent } from "../choose-food-dialog/choose-food-dialog.component";

@Component({
	selector: 'app-food-plan-detail',
	templateUrl: './food-plan-detail.component.html',
	styleUrls: ['./food-plan-detail.component.css']
})
export class FoodPlanDetailComponent implements OnInit {

	@Input() foodPlan: FoodPlan = {} as FoodPlan;

	foods$: Observable<Food[]>;
	showAddFoodsBtn: boolean = true;

	constructor(public firestore: AngularFirestore, public dialog: MatDialog) {
	}

	ngOnInit(): void {
		if (this.foodPlan.foods) {
			// __name__ is document id
			this.foods$ = this.firestore.collection('foods', food => food.where("__name__", "in", this.foodPlan.foods)).valueChanges({idField: 'id'}) as Observable<Food[]>;

			this.showAddFoodsBtn = this.foodPlan.foods.length <= 10;		// "in" query limited to max 10
		}
	}

	addFood() {
		const dialogRef = this.dialog.open(ChooseFoodDialogComponent, {
			width: '500px',
			autoFocus: false
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				let foods = this.foodPlan.foods ? this.foodPlan.foods.concat([result.id]) : [result.id];
				this.firestore.collection('foodPlans').doc(this.foodPlan.id).update({foods: foods});
			}
		});
	}
}
