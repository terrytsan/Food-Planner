import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Dish, FoodPlan, SimpleDish } from "./foodPlan";
import { Food } from "../food-card/food";
import { MatDialog } from "@angular/material/dialog";
import { ChooseFoodDialogComponent } from "../choose-food-dialog/choose-food-dialog.component";
import { FoodPlanService } from "../services/food-plan.service";
import { FoodService } from "../services/food.service";
import { Router } from "@angular/router";
import { CdkDragDrop } from "@angular/cdk/drag-drop";

@Component({
	selector: 'app-food-plan-preview',
	templateUrl: './food-plan-preview.component.html',
	styleUrls: ['./food-plan-preview.component.css']
})
export class FoodPlanPreviewComponent implements OnInit {

	@Input() foodPlan: FoodPlan = {} as FoodPlan;
	@Input() canEdit: boolean = false;
	@Input() selectedEndDate: Date = new Date();
	@Output() dishDropped = new EventEmitter<CdkDragDrop<Dish[]>>();

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
		if (this.foodPlan.dishes && this.foodPlan.dishes.length > 0) {
			this.showAddFoodsBtn = this.foodPlan.dishes.length <= 10;		// Arbitrary limit of 10 foods
		}
		if (this.foodPlan.id) {
			this.showPointer = true;
		}
	}

	addFood() {
		const dialogRef = this.dialog.open(ChooseFoodDialogComponent, {
			width: '500px',
			autoFocus: false,
			data: this.selectedEndDate
		});

		dialogRef.afterClosed().subscribe(async (result: Food) => {
			if (result) {
				let dish: SimpleDish = {
					foodId: result.id,
					ingredients: result.coreIngredients || [],
					index: (this.foodPlan.dishes.map(d => d.index).sort().pop() ?? -1) + 1
				} as SimpleDish;
				await this.foodPlanService.addDishToFoodPlan(dish, this.foodPlanService.convertFoodPlanToFoodPlanDoc(this.foodPlan));
			}
		});
	}

	navigateToDetailsPage() {
		if (this.foodPlan.id) {
			this.router.navigate(['/foodPlans', this.foodPlan.id]);
		}
	}

	trackByIndex(index: number, item: any) {
		return item.index;
	}

	drop($event: CdkDragDrop<Dish[]>) {
		this.dishDropped.next($event);
	}
}
