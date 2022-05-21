import { Component, Input, OnInit } from '@angular/core';
import { FoodPlan } from "./foodPlan";
import { Food } from "../food-card/food";
import { Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { ChooseFoodDialogComponent } from "../choose-food-dialog/choose-food-dialog.component";
import { FoodPlanService } from "../services/food-plan.service";
import { FoodService } from "../services/food.service";

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

	constructor(private dialog: MatDialog, private foodPlanService: FoodPlanService, private foodService: FoodService) {
	}

	ngOnInit(): void {
		if (this.foodPlan.foods) {
			this.foods$ = this.foodService.getFoods(this.foodPlan.foods);

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
