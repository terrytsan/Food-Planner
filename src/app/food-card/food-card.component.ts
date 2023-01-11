import { Component, Input, OnInit } from '@angular/core';
import { Food } from "./food";
import { MatDialog } from "@angular/material/dialog";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { Dish, FoodPlan } from "../food-plan-preview/foodPlan";
import { GlobalVariable } from "../global";
import { FoodPlanService } from "../services/food-plan.service";
import { FoodService } from "../services/food.service";
import { animate, style, transition, trigger } from "@angular/animations";
import { DragStartDelay } from "@angular/cdk/drag-drop";

@Component({
	selector: 'app-food-card',
	templateUrl: './food-card.component.html',
	styleUrls: ['./food-card.component.css'],
	animations: [
		trigger('fade', [
			transition(':enter', [
				style({ opacity: 0, transform: "translateY(50px)" }),
				animate('150ms ease-in-out', style({ opacity: 1, transform: "translateY(0px)" }))
			])
		])
	]
})
export class FoodCardComponent implements OnInit {

	@Input() food: Food | null = null;
	@Input() foodPlan: FoodPlan | null = null;
	@Input() dish: Dish | null = null;
	@Input() canEdit: boolean = false;
	defaultImage: string = GlobalVariable.PLACEHOLDER_IMAGE_URL;
	dragStartDelay: DragStartDelay = { mouse: 0, touch: 500 };

	constructor(
		private dialog: MatDialog,
		private foodPlanService: FoodPlanService,
		private foodService: FoodService
	) {
	}

	ngOnInit(): void {
	}

	editFood() {
		// Open the modal, passing in food item
		this.dialog.open(FoodEditDialogComponent, {
			maxWidth: '600px',
			width: '80%',
			data: {FoodData: this.food}
		});
	}

	async deleteFood() {
		let foodToDelete = this.food;
		if (foodToDelete) {
			await this.foodService.deleteFoodWithUndo(foodToDelete);
		}
	}


	async removeFood() {
		if (this.dish && this.foodPlan) {
			await this.foodPlanService.removeDishFromFoodPlan(this.foodPlanService.convertDishToSimpleDish(this.dish), this.foodPlan);
		}
	}
}
