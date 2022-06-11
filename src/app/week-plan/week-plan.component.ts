import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { FoodPlan } from "../food-plan-detail/foodPlan";
import { Timestamp } from "firebase/firestore";
import { catchError, map, switchMap } from "rxjs/operators";
import { AuthService, SimpleUser } from "../services/auth.service";
import { FoodPlanService } from "../services/food-plan.service";

@Component({
	selector: 'app-week-plan',
	templateUrl: './week-plan.component.html',
	styleUrls: ['./week-plan.component.css']
})
export class WeekPlanComponent implements OnInit {

	user$: Observable<SimpleUser | null> = this.authService.getSimpleUser();
	foodPlans$: Observable<FoodPlan[]>;
	foodPlansLoadingError$ = new BehaviorSubject<string>("");
	selectedWeek: Week;
	selectedWeek$: BehaviorSubject<Week>;
	startOfWeek = 'Sunday';
	earliestStartingWeek = Timestamp.fromDate(new Date("25 October 2021"));		// Prevent weeks earlier than this date from being generated

	constructor(private authService: AuthService, private foodPlanService: FoodPlanService) {
		this.selectedWeek = this.getCurrentWeek();
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
							let dummyFoodPlan: FoodPlan = {id: '', date: missingDay, group: user.selectedGroup};
							foodPlans.push(dummyFoodPlan);
						}
						i.setDate(i.getDate() + 1);
					}

					foodPlans.sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime());
					return foodPlans;
				}),
				catchError(() => {
					console.error("Error loading food plans");
					this.foodPlansLoadingError$.next("Error loading food plans. 😥");
					return of([]);
				})
			);
		}));
	}

	ngOnInit(): void {
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
		return JSON.stringify(item);
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
}

interface Week {
	// Date of Monday/Sunday	(depends on value of startOfWeek)
	startDate: Timestamp;
	// Date of Sunday/Saturday
	endDate: Timestamp;
}
