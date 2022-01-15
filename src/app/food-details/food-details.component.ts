import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { doc, Firestore, onSnapshot } from "@angular/fire/firestore";
import { Food } from "../food-card/food";
import { GlobalVariable } from "../global";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
	selector: 'app-food-details',
	templateUrl: './food-details.component.html',
	styleUrls: ['./food-details.component.css']
})
export class FoodDetailsComponent implements OnInit {

	id: string;
	food: Food;
	defaultImage: string = GlobalVariable.PLACEHOLDER_IMAGE_URL;

	constructor(private route: ActivatedRoute, private afs: Firestore, public dialog: MatDialog) {
		this.id = this.route.snapshot.params['id'];

		onSnapshot(doc(this.afs, "foods", this.id), (doc) => {
			this.food = doc.data() as Food;
			this.food.id = doc.id;
		});
	}

	ngOnInit(): void {
	}

	openEditFoodDialog() {
		this.dialog.open(FoodEditDialogComponent, {
			width: '298px',
			data: this.food
		});
	}
}
