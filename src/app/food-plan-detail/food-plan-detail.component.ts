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

	food$: Observable<Food>;

	constructor(public firestore: AngularFirestore, public dialog: MatDialog) {
	}

	ngOnInit(): void {
		this.food$ = this.firestore.collection('foods').doc(this.foodPlan.foodId).valueChanges() as Observable<Food>;
	}

	addFood() {
		const dialogRef = this.dialog.open(ChooseFoodDialogComponent, {
			width: '500px'
		});

		dialogRef.afterClosed().subscribe(result => {
			this.firestore.collection('foodPlans').doc(this.foodPlan.id).update({foodId: result.id});
		});
	}
}
