import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Food } from "../food-card/food";
import { GlobalVariable } from "../global";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { FoodService } from "../services/food.service";

@Component({
	selector: 'app-food-details',
	templateUrl: './food-details.component.html',
	styleUrls: ['./food-details.component.css']
})
export class FoodDetailsComponent implements OnInit {

	id: string;
	food: Food;
	defaultImage: string = GlobalVariable.PLACEHOLDER_IMAGE_URL;
	food$: any;

	// Labels
	readonly separatorKeysCodes = [ENTER, COMMA] as const;
	addOnBlur: boolean = true;


	constructor(private route: ActivatedRoute, private dialog: MatDialog, private foodService: FoodService) {
		this.id = this.route.snapshot.params['id'];

		this.food$ = this.foodService.getFood(this.id).subscribe(food => {
			this.food = food;
			if (this.food.labels) {
				this.food.labels.sort();
			}
		});
	}

	ngOnInit(): void {
	}

	ngOnDestroy() {
		this.food$.unsubscribe();
	}

	openEditFoodDialog() {
		this.dialog.open(FoodEditDialogComponent, {
			maxWidth: '600px',
			width: '80%',
			data: {FoodData: this.food}
		});
	}

	async labelChanged(labels: string[]) {
		await this.foodService.updateFood(this.id, {
			labels: labels
		});
	}
}
