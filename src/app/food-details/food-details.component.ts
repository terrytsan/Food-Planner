import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Food } from "../food-card/food";
import { GlobalVariable } from "../global";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { FoodService } from "../services/food.service";
import { AuthService } from "../services/auth.service";

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
	canEdit: boolean = false;

	// Labels
	readonly separatorKeysCodes = [ENTER, COMMA] as const;
	addOnBlur: boolean = true;


	constructor(
		private route: ActivatedRoute,
		private dialog: MatDialog,
		private foodService: FoodService,
		private authService: AuthService
	) {
		this.id = this.route.snapshot.params['id'];

		this.food$ = this.foodService.getFood(this.id).subscribe(food => {
			this.food = food;
			if (this.food.labels) {
				this.food.labels.sort();
			}
		});

		authService.getSimpleUser().subscribe(u => {
			this.canEdit = u?.canEdit ?? false;
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

	async addCoreIngredient($event: Event) {
		let target = <HTMLInputElement>$event.target;
		let ingredient = (target.value || '').trim();

		if (ingredient) {
			(this.food.coreIngredients || (this.food.coreIngredients = [])).push(ingredient);
			target.value = '';
			await this.foodService.updateFood(this.id, {
				coreIngredients: this.food.coreIngredients
			});
		}
	}

	async removeCoreIngredient(ingredient: string) {
		let index = this.food.coreIngredients.indexOf(ingredient);

		if (index >= 0) {
			this.food.coreIngredients.splice(index, 1);
			await this.foodService.updateFood(this.id, {
				coreIngredients: this.food.coreIngredients
			});
		}
	}

	async addOptionalIngredient($event: Event) {
		let target = <HTMLInputElement>$event.target;
		let ingredient = (target.value || '').trim();

		if (ingredient) {
			(this.food.optionalIngredients || (this.food.optionalIngredients = [])).push(ingredient);
			target.value = '';
			await this.foodService.updateFood(this.id, {
				optionalIngredients: this.food.optionalIngredients
			});
		}
	}

	async removeOptionalIngredient(ingredient: string) {
		let index = this.food.optionalIngredients.indexOf(ingredient);

		if (index >= 0) {
			this.food.optionalIngredients.splice(index, 1);
			await this.foodService.updateFood(this.id, {
				optionalIngredients: this.food.optionalIngredients
			});
		}
	}
}
