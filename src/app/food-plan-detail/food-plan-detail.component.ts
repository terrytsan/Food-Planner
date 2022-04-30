import { Component, Input, OnInit } from '@angular/core';
import { FoodPlan } from "./foodPlan";
import { Food } from "../food-card/food";
import { Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { ChooseFoodDialogComponent } from "../choose-food-dialog/choose-food-dialog.component";
import { collection, collectionData, CollectionReference, Firestore, query, where } from "@angular/fire/firestore";
import { FoodPlanService } from "../services/food-plan.service";

@Component({
	selector: 'app-food-plan-detail',
	templateUrl: './food-plan-detail.component.html',
	styleUrls: ['./food-plan-detail.component.css']
})
export class FoodPlanDetailComponent implements OnInit {

	@Input() foodPlan: FoodPlan = {} as FoodPlan;
	@Input() canEdit: boolean = false;
	@Input() selectedEndDate: Date = new Date();

	foods$: Observable<Food[]>;
	showAddFoodsBtn: boolean = true;

	constructor(private afs: Firestore, private dialog: MatDialog, private foodPlanService: FoodPlanService) {
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
			autoFocus: false,
			data: this.selectedEndDate
		});

		dialogRef.afterClosed().subscribe(async result => {
			if (result) {
				await this.foodPlanService.addFoodToFoodPlan(result.id, this.foodPlan);
			}
		});
	}
}
