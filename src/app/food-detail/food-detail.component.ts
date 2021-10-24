import { Component, Input, OnInit } from '@angular/core';
import { Food } from "./food";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";

@Component({
	selector: 'app-food-detail',
	templateUrl: './food-detail.component.html',
	styleUrls: ['./food-detail.component.css']
})
export class FoodDetailComponent implements OnInit {

	@Input() food: Food | null = null;
	defaultImage: string = "https://firebasestorage.googleapis.com/v0/b/food-planner-52896.appspot.com/o/placeholder.jpg?alt=media&token=c34989f3-08b0-45e0-aac3-2513e948e8e6";

	constructor(public firestore: AngularFirestore, private _snackBar: MatSnackBar, public dialog: MatDialog) {
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
			let snackBarRef = this._snackBar.open(`Deleted ${foodToDelete.name}.`, 'Undo');

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
}
