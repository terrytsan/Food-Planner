import { Component, Input, OnInit } from '@angular/core';
import { Food } from "./food";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { FoodPlan } from "../food-plan-detail/foodPlan";
import { deleteDoc, deleteField, doc, Firestore, setDoc, updateDoc } from "@angular/fire/firestore";
import { GlobalVariable } from "../global";

@Component({
	selector: 'app-food-card',
	templateUrl: './food-card.component.html',
	styleUrls: ['./food-card.component.css']
})
export class FoodCardComponent implements OnInit {

	@Input() food: Food | null = null;
	@Input() foodPlan: FoodPlan | null = null;
	defaultImage: string = GlobalVariable.PLACEHOLDER_IMAGE_URL;

	constructor(private _snackBar: MatSnackBar, public dialog: MatDialog, public afs: Firestore) {
	}

	ngOnInit(): void {
	}

	editFood() {
		// Open the modal, passing in food item
		this.dialog.open(FoodEditDialogComponent, {
			width: '298px',
			data: this.food
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
				imagePath: foodToDelete.imagePath
			});
		});
	}

	async removeFood() {
		if (this.foodPlan && this.foodPlan.foods) {
			const foodPlanRef = doc(this.afs, 'foodPlans', this.foodPlan.id);
			if (this.foodPlan.foods.length <= 1) {
				await updateDoc(foodPlanRef, {
					foods: deleteField()
				});
			} else {
				let updatedFoods = this.foodPlan.foods.filter(food => food != this.food?.id);
				await updateDoc(foodPlanRef, {
					foods: updatedFoods
				});
			}
		}
	}
}
