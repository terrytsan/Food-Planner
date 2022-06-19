import { Component, Input, OnInit } from '@angular/core';
import { FoodPlanDocument } from "./foodPlan";
import { Food } from "../food-card/food";
import { Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { ChooseFoodDialogComponent } from "../choose-food-dialog/choose-food-dialog.component";
import { FoodPlanService } from "../services/food-plan.service";
import { FoodService } from "../services/food.service";
import { Router } from "@angular/router";

@Component({
	selector: 'app-food-plan-preview',
	templateUrl: './food-plan-preview.component.html',
	styleUrls: ['./food-plan-preview.component.css']
})
export class FoodPlanPreviewComponent implements OnInit {

	@Input() foodPlanDoc: FoodPlanDocument = {} as FoodPlanDocument;
	@Input() canEdit: boolean = false;
	@Input() selectedEndDate: Date = new Date();

	foods$: Observable<Food[]>;
	showAddFoodsBtn: boolean = true;
	showPointer: boolean = false;

	constructor(
		private dialog: MatDialog,
		private foodPlanService: FoodPlanService,
		private foodService: FoodService,
		private router: Router
	) {
	}

	ngOnInit(): void {
		if (this.foodPlanDoc.foods) {
			this.foods$ = this.foodService.getFoods(this.foodPlanDoc.foods);

			this.showAddFoodsBtn = this.foodPlanDoc.foods.length <= 10;		// "in" query limited to max 10
		}
		if (this.foodPlanDoc.id) {
			this.showPointer = true;
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
				await this.foodPlanService.addFoodToFoodPlan(result.id, this.foodPlanDoc);
			}
		});
	}

	navigateToDetailsPage() {
		if (this.foodPlanDoc.id) {
			this.router.navigate(['/foodPlans', this.foodPlanDoc.id]);
		}
	}
}
