import { Component, Inject, OnInit } from '@angular/core';
import { combineLatest, Observable, of, Subscription } from "rxjs";
import { Food } from "../food-card/food";
import {
	collection,
	collectionData,
	CollectionReference,
	Firestore,
	getDocs,
	orderBy,
	query,
	where
} from "@angular/fire/firestore";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { switchMap } from "rxjs/operators";
import { GlobalVariable } from "../global";
import { AuthService } from "../services/auth.service";
import { Timestamp } from "firebase/firestore";
import { FoodPlan } from "../food-plan-detail/foodPlan";

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

	// Random Food Configuration
	foodWeights: number[];
	recentTimeFrame: number = 14;				// Number of days in the past to be considered recent.
	recentFoodWeight: number = 1;
	recentLabelWeightPenalty: number = 5;		// Maximum reduced weighting (from normal). Achieved if all labels of a food matches recent labels.
	normalFoodWeight: number = 10;

	constructor(
		private dialogRef: MatDialogRef<FoodEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private selectedEndDate: Date,
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

		// Populate list of foods and set randomFood
		this.foodSubscription = combineLatest([
			this.foods$,
			this.authService.getSimpleUser()
		]).subscribe(async ([foods, user]) => {
			if (user == null) {
				return;
			}

			const endDate = new Date(selectedEndDate.getTime());		// Copy to new variable first - setDate() will overwrite
			const tempDate = new Date(selectedEndDate.getTime());
			const startDate: Date = new Date(tempDate.setDate(tempDate.getDate() - this.recentTimeFrame));
			const foodPlanQuery = await getDocs(
				query(
					collection(this.firestore, 'foodPlans'),
					where("date", ">=", Timestamp.fromDate(startDate)),
					where("date", "<=", Timestamp.fromDate(endDate)),
					where('group', '==', user.selectedGroup))
			);

			let recentFoodIds: string[] = [];
			foodPlanQuery.forEach(fp => {
				let foodPlan = fp.data() as FoodPlan;

				if (foodPlan.foods) {
					recentFoodIds.push(...foodPlan.foods);
				}
			});
			// Map foodIds to Food objects using existing foods array
			let recentFoods = recentFoodIds.map(fId => foods.find(f => f.id == fId)).filter(f => f != undefined) as Food[];

			let recentLabels = recentFoods.map(food => food.labels).filter(l => l != undefined).flat();
			recentLabels = [...new Set(recentLabels)];		// Keep unique labels only

			// Assign weights to each food
			let weights: number[] = [];
			for (const food of foods) {
				if (recentFoodIds.includes(food.id)) {
					weights.push(this.recentFoodWeight);
				} else {
					let foodLabels = (food.labels == undefined) ? [] : food.labels;
					const similarity = this.calculateSimilarity(foodLabels, recentLabels);

					if (similarity == 0) {
						weights.push(this.normalFoodWeight);
						continue;
					}

					let newWeight = this.normalFoodWeight - (similarity * this.recentLabelWeightPenalty);
					weights.push(newWeight);
				}
			}

			this.randomFood = this.getRandomFood(foods, weights);
			this.foods = foods;
			this.foodWeights = weights;
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
		let element = document.getElementById('searchInput') as HTMLInputElement;
		if (element == null) {
			return;
		}
		element.value = this.randomFood.name;
		element.dispatchEvent(new KeyboardEvent('keyup'));

		this.randomFood = this.getRandomFood(this.foods, this.foodWeights);
	}

	search($event: KeyboardEvent) {
		if (!$event) return;
		let searchTerm = (<HTMLInputElement>$event.target).value;
		this.filteredFoods = this.foods.filter(food => {
			return food.name.toLowerCase().includes(searchTerm.toLowerCase());
		});
	}

	/**
	 * Determine the similarity between two arrays.
	 * Returns a score between 0 and 1 based on number of elements in mainArray that are present in secondaryArray.
	 * 1 means all elements of mainArray appear in secondaryArray,
	 * @param mainArray
	 * @param secondaryArray
	 */
	calculateSimilarity(mainArray: any[], secondaryArray: any[]): number {
		if (mainArray.length == 0 || secondaryArray.length == 0) {
			return 0;
		}
		mainArray = mainArray.map(a => a.toLowerCase());
		secondaryArray = secondaryArray.map(a => a.toLowerCase());
		const result = mainArray.reduce((a, c) => a + secondaryArray.includes(c), 0);
		return (result / mainArray.length);
	}

	/**
	 * Return random food, taking weights into account.
	 * @param foods array of foods
	 * @param weights weights relative to each other ([1,5,1], [0.1,0.4,0.3] etc.). Weights can sum to any amount
	 */
	getRandomFood(foods: Food[], weights: number[]): Food {
		let i;
		let cumulativeWeights: number[] = new Array(weights.length);

		for (i = 0; i < weights.length; i++)
			cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);

		const random = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];

		for (i = 0; i < cumulativeWeights.length; i++)
			if (cumulativeWeights[i] > random)
				break;

		return foods[i];
	}
}
