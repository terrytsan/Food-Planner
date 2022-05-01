import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { doc, Firestore, onSnapshot, updateDoc } from "@angular/fire/firestore";
import { Food } from "../food-card/food";
import { GlobalVariable } from "../global";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { COMMA, ENTER } from "@angular/cdk/keycodes";

@Component({
	selector: 'app-food-details',
	templateUrl: './food-details.component.html',
	styleUrls: ['./food-details.component.css']
})
export class FoodDetailsComponent implements OnInit {

	id: string;
	food: Food;
	defaultImage: string = GlobalVariable.PLACEHOLDER_IMAGE_URL;
	foodUnsubscribe: any;

	// Labels
	readonly separatorKeysCodes = [ENTER, COMMA] as const;
	addOnBlur: boolean = true;


	constructor(private route: ActivatedRoute, private afs: Firestore, public dialog: MatDialog) {
		this.id = this.route.snapshot.params['id'];

		this.foodUnsubscribe = onSnapshot(doc(this.afs, "foods", this.id), (doc) => {
			this.food = doc.data() as Food;
			if (this.food.labels) {
				this.food.labels.sort();
			}
			this.food.id = doc.id;
		});
	}

	ngOnInit(): void {
	}

	ngOnDestroy() {
		this.foodUnsubscribe();
	}

	openEditFoodDialog() {
		this.dialog.open(FoodEditDialogComponent, {
			maxWidth: '600px',
			width: '80%',
			data: {FoodData: this.food}
		});
	}

	async labelChanged(labels: string[]) {
		await updateDoc(doc(this.afs, "foods", this.id), {
			labels: labels
		});
	}
}
