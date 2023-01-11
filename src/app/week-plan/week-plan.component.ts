import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { Dish, FoodPlan, SimpleDish } from "../food-plan-preview/foodPlan";
import { Timestamp } from "firebase/firestore";
import { catchError, map, switchMap, take } from "rxjs/operators";
import { AuthService, SimpleUser } from "../services/auth.service";
import { FoodPlanService } from "../services/food-plan.service";
import { MatDialog } from "@angular/material/dialog";
import { ShoppingListComponent } from "../shopping-list/shopping-list.component";
import { StateService } from "../services/state.service";
import { animateChild, query, stagger, transition, trigger } from "@angular/animations";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

@Component({
	selector: 'app-week-plan',
	templateUrl: './week-plan.component.html',
	styleUrls: ['./week-plan.component.css'],
	animations: [
		trigger('foodPlans', [
			transition(":enter", [query('@fade', stagger(50, animateChild()))])
		])
	]
})
export class WeekPlanComponent implements OnInit, OnDestroy {

	user$: Observable<SimpleUser | null> = this.authService.getSimpleUser();
	foodPlans$: Observable<FoodPlan[]>;
	foodPlansLoadingError$ = new BehaviorSubject<string>("");
	selectedWeek: Week;
	selectedWeek$: BehaviorSubject<Week>;
	startOfWeek = 'Sunday';
	earliestStartingWeek = Timestamp.fromDate(new Date("25 October 2021"));		// Prevent weeks earlier than this date from being generated

	constructor(
		private authService: AuthService,
		private foodPlanService: FoodPlanService,
		private dialog: MatDialog,
		private stateService: StateService
	) {
		let savedState = stateService.getWeekPlanState();
		if (savedState != null) {
			this.selectedWeek = savedState.selectedWeek;
		} else {
			this.selectedWeek = this.getCurrentWeek();
		}
		this.selectedWeek$ = new BehaviorSubject<Week>(this.selectedWeek);
		this.foodPlans$ = combineLatest([
			this.selectedWeek$,
			this.user$
		]).pipe(switchMap(([selectedWeek, user]) => {
			if (user == null) {
				return of([] as FoodPlan[]);
			}

			let foodPlans = foodPlanService.getFoodPlansBetweenDates(selectedWeek.startDate, selectedWeek.endDate, user.selectedGroup);

			return foodPlans.pipe(
				map((foodPlans) => {
					let existingDates = foodPlans.map(t => {
						return t.date.toDate().setHours(0, 0, 0, 0);
					});

					// Create dummy foodPlans (don't exist in firebase) for missing days.
					let i = selectedWeek.startDate.toDate();
					i.setHours(0, 0, 0, 0);
					for (; i <= selectedWeek.endDate.toDate();) {
						if (!existingDates.includes(i.getTime())) {
							let missingDay = Timestamp.fromDate(i);
							let dummyFoodPlan: FoodPlan = {
								id: '',
								date: missingDay,
								group: user.selectedGroup,
								dishes: []
							};
							foodPlans.push(dummyFoodPlan);
						}
						i.setDate(i.getDate() + 1);
					}

					foodPlans.sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime());
					return foodPlans;
				}),
				catchError((err) => {
					console.error("Error loading food plans.", err);
					this.foodPlansLoadingError$.next("Error loading food plans. 😥");
					return of([]);
				})
			);
		}));
	}

	ngOnInit(): void {
	}

	ngOnDestroy() {
		this.stateService.setWeekPlanState(this.selectedWeek);
	}

	getCurrentWeek(): Week {
		switch (this.startOfWeek) {
			case "Sunday":
				let current = new Date();
				let firstDay = current.getDate() - current.getDay();
				let startDate = new Date(current.setDate(firstDay));
				startDate.setHours(0, 0, 0, 0);
				let endDate = new Date(current.setDate(current.getDate() - current.getDay() + 6));
				endDate.setHours(0, 0, 0, 0);

				return {
					startDate: Timestamp.fromDate(startDate),
					endDate: Timestamp.fromDate(endDate)
				};
			default:
				let date = new Date();
				let day = date.getDay();
				let monDiff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
				let mondayDate = new Date(date.setDate(monDiff));
				mondayDate.setHours(0, 0, 0, 0);
				let sundayDate = new Date(date.setDate(date.getDate() - date.getDay() + 7));		// relies on 'date' being set to Monday's date above
				sundayDate.setHours(0, 0, 0, 0);

				return {
					startDate: Timestamp.fromDate(mondayDate),
					endDate: Timestamp.fromDate(sundayDate)
				};
		}
	}

	trackById(index: number, item: any) {
		return item.id;
	}

	advanceWeek(advanceDays: number) {
		let newStartDate: Date = this.selectedWeek.startDate.toDate();
		newStartDate.setDate(newStartDate.getDate() + advanceDays);

		let newEndDate: Date = this.selectedWeek.endDate.toDate();
		newEndDate.setDate(newEndDate.getDate() + advanceDays);

		this.selectedWeek.startDate = Timestamp.fromDate(newStartDate);
		this.selectedWeek.endDate = Timestamp.fromDate(newEndDate);
		this.selectedWeek$.next(this.selectedWeek);
	}

	openShoppingList(foodPlans: FoodPlan[]) {
		this.dialog.open(ShoppingListComponent, {
			maxWidth: '600px',
			width: '80%',
			data: {
				FoodPlans: foodPlans,
				startDate: this.selectedWeek.startDate,
				endDate: this.selectedWeek.endDate
			}
		});
	}

	/**
	 * Handle when a dish is dropped (could be in the same or different FoodPlan)
	 */
	dishDropped($event: CdkDragDrop<Dish[]>) {
		let prevFoodPlan = $event.previousContainer.id;
		let newFoodPlan = $event.container.id;
		console.log(`moving from ${prevFoodPlan} ${$event.previousIndex} to ${newFoodPlan} ${$event.currentIndex}`);

		if (prevFoodPlan === newFoodPlan) {
			this.foodPlans$.pipe(take(1)).subscribe(f => {
				let foodPlan = f.find(fp => fp.id === newFoodPlan);
				if (foodPlan === undefined) return;

				this.foodPlanService.moveDishWithinFoodPlan(foodPlan, $event.previousIndex, $event.currentIndex);
			});
			// Optimistically update local array before firestore - prevents flickering
			moveItemInArray($event.container.data, $event.previousIndex, $event.currentIndex);
		} else {
			let dish: Dish = $event.previousContainer.data[$event.previousIndex];
			let dishToMove: SimpleDish = this.foodPlanService.convertDishToSimpleDish(dish);

			this.foodPlans$.pipe(take(1)).subscribe(f => {
				// Search by id or date - might be moving to a dummy foodPlan
				let foodPlan = f.find(fp => fp.id === newFoodPlan || fp.date.toString() === newFoodPlan);
				let oldFoodPlan = f.find(fp => fp.id === prevFoodPlan);
				if (foodPlan === undefined || oldFoodPlan === undefined) return;

				this.foodPlanService.addDishToFoodPlan(dishToMove, this.foodPlanService.convertFoodPlanToFoodPlanDoc(foodPlan), $event.currentIndex);

				this.foodPlanService.removeDishFromFoodPlan(dishToMove, oldFoodPlan);
			});
			// transferArrayItem($event.previousContainer.data, $event.container.data, $event.previousIndex, $event.currentIndex)
		}
	}
}

export interface Week {
	// Date of Monday/Sunday	(depends on value of startOfWeek)
	startDate: Timestamp;
	// Date of Sunday/Saturday
	endDate: Timestamp;
}
