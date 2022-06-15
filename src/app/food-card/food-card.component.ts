import { Component, Input, OnInit } from '@angular/core';
import { Food } from "./food";
import { MatDialog } from "@angular/material/dialog";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { FoodPlanDocument } from "../food-plan-preview/foodPlan";
import { GlobalVariable } from "../global";
import { FoodPlanService } from "../services/food-plan.service";
import { FoodService } from "../services/food.service";

@Component({
	selector: 'app-food-card',
	templateUrl: './food-card.component.html',
	styleUrls: ['./food-card.component.css']
})
export class FoodCardComponent implements OnInit {

	@Input() food: Food | null = null;
	@Input() foodPlanDoc: FoodPlanDocument | null = null;
	@Input() canEdit: boolean = false;
	defaultImage: string = GlobalVariable.PLACEHOLDER_IMAGE_URL;

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
		if (this.food && this.foodPlanDoc) {
			await this.foodPlanService.removeFoodFromFoodPlan(this.food.id, this.foodPlanDoc);
		}
	}
}
