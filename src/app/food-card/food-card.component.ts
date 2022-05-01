import { Component, Input, OnInit } from '@angular/core';
import { Food } from "./food";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { FoodPlan } from "../food-plan-detail/foodPlan";
import { deleteDoc, doc, Firestore, setDoc } from "@angular/fire/firestore";
import { GlobalVariable } from "../global";
import { FoodPlanService } from "../services/food-plan.service";

@Component({
	selector: 'app-food-card',
	templateUrl: './food-card.component.html',
	styleUrls: ['./food-card.component.css']
})
export class FoodCardComponent implements OnInit {

	@Input() food: Food | null = null;
	@Input() foodPlan: FoodPlan | null = null;
	@Input() canEdit: boolean = false;
	defaultImage: string = GlobalVariable.PLACEHOLDER_IMAGE_URL;

	constructor(
		private _snackBar: MatSnackBar,
		private dialog: MatDialog,
		private afs: Firestore,
		private foodPlanService: FoodPlanService
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
		if (!foodToDelete) return;

		let foodRef = doc(this.afs, 'foods', foodToDelete.id);
		await deleteDoc(foodRef);

		let snackBarRef = this._snackBar.open(`Deleted ${foodToDelete.name}.`, 'Undo', {duration: 3000});
		snackBarRef.onAction().subscribe(async () => {
			if (!foodToDelete) return;

			await setDoc(doc(this.afs, 'foods', foodToDelete.id), {
				name: foodToDelete.name,
				description: foodToDelete.description,
				image: foodToDelete.image,
				imagePath: foodToDelete.imagePath,
				labels: foodToDelete.labels
			});
		});
	}

	async removeFood() {
		if (this.food && this.foodPlan) {
			await this.foodPlanService.removeFoodFromFoodPlan(this.food.id, this.foodPlan);
		}
	}
}
