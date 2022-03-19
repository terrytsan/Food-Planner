import { Component, OnInit } from '@angular/core';
import { Observable, of, Subscription } from "rxjs";
import { Food } from "../food-card/food";
import {
	collection,
	collectionData,
	CollectionReference,
	Firestore,
	orderBy,
	query,
	where
} from "@angular/fire/firestore";
import { MatDialogRef } from "@angular/material/dialog";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { switchMap, take } from "rxjs/operators";
import { GlobalVariable } from "../global";
import { AuthService } from "../auth.service";

@Component({
	selector: 'app-choose-food-dialog',
	templateUrl: './choose-food-dialog.component.html',
	styleUrls: ['./choose-food-dialog.component.css']
})
export class ChooseFoodDialogComponent implements OnInit {

	defaultImage: string = GlobalVariable.PLACEHOLDER_IMAGE_URL;
	foods$: Observable<Food[]>;
	foods: Food[] = [];
	filteredFoods: Food[] = [];
	randomFood: Food;
	foodSubscription: Subscription;

	constructor(
		private dialogRef: MatDialogRef<FoodEditDialogComponent>,
		private firestore: Firestore,
		private authService: AuthService
	) {
		this.foods$ = this.authService.getSimpleUser().pipe(
			switchMap(user => {
				if (user == null) {
					return of([] as Food[]);
				}
				return collectionData<Food>(
					query<Food>(
						collection(firestore, 'foods') as CollectionReference<Food>,
						where("group", "==", user.selectedGroup),
						orderBy("name")
					), {idField: 'id'}
				);
			})
		);

		this.foodSubscription = this.foods$.pipe(take(2)).subscribe(foods => {
			this.randomFood = foods[Math.floor(Math.random() * foods.length)];
			this.foods = foods;
			this.filteredFoods = foods;
		});
	}

	ngOnInit(): void {
	}

	ngOnDestroy() {
		this.foodSubscription.unsubscribe();
	}

	chooseFood(food: Food) {
		this.dialogRef.close(food);
	}

	chooseRandomFood() {
		this.dialogRef.close(this.randomFood);
	}

	search($event: KeyboardEvent) {
		if (!$event) return;
		let searchTerm = (<HTMLInputElement>$event.target).value;
		this.filteredFoods = this.foods.filter(food => {
			return food.name.toLowerCase().includes(searchTerm.toLowerCase());
		});
	}
}
