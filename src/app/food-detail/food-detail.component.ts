import { Component, Input, OnInit } from '@angular/core';
import { Food } from "./food";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { FoodPlan } from "../food-plan-detail/foodPlan";
import { deleteField, doc, Firestore, updateDoc } from "@angular/fire/firestore";

@Component({
	selector: 'app-food-detail',
	templateUrl: './food-detail.component.html',
	styleUrls: ['./food-detail.component.css']
})
export class FoodDetailComponent implements OnInit {

	@Input() food: Food | null = null;
	@Input() foodPlan: FoodPlan | null = null;
	defaultImage: string = "assets/images/placeholder.jpg";

	constructor(
		public firestore: AngularFirestore,
		private _snackBar: MatSnackBar,
		public dialog: MatDialog,
		public afs: Firestore
	) {
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

	deleteFood() {
		let foodToDelete = this.food;
		if (!foodToDelete) return;
		this.firestore.collection("foods").doc(foodToDelete.id).delete().then(() => {
			if (!foodToDelete) return;
			let snackBarRef = this._snackBar.open(`Deleted ${foodToDelete.name}.`, 'Undo', {duration: 3000});

			snackBarRef.onAction().subscribe(() => {
				if (!foodToDelete) return;
				this.firestore.collection('foods').doc(foodToDelete.id).set({
					name: foodToDelete.name,
					description: foodToDelete.description,
					image: foodToDelete.image,
					imagePath: foodToDelete.imagePath
				});
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
