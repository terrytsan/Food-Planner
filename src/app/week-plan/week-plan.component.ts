import { Component, OnInit } from '@angular/core';
import {
	collection,
	collectionData,
	CollectionReference,
	doc,
	Firestore,
	query,
	where,
	writeBatch
} from "@angular/fire/firestore";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { FoodPlan } from "../food-plan-detail/foodPlan";
import { Timestamp } from "firebase/firestore";
import { switchMap, take } from "rxjs/operators";
import { AuthService, SimpleUser } from "../auth.service";

@Component({
	selector: 'app-week-plan',
	templateUrl: './week-plan.component.html',
	styleUrls: ['./week-plan.component.css']
})
export class WeekPlanComponent implements OnInit {

	user$: Observable<SimpleUser | null> = this.authService.getSimpleUser();
	foodPlans$: Observable<FoodPlan[]>;
	selectedWeek: Week;
	selectedWeek$: BehaviorSubject<Week>;
	startOfWeek = 'Sunday';
	earliestStartingWeek = Timestamp.fromDate(new Date("25 October 2021"));		// Prevent weeks earlier than this date from being generated

	constructor(public afs: Firestore, private authService: AuthService) {
		this.selectedWeek = this.getCurrentWeek();
		this.selectedWeek$ = new BehaviorSubject<Week>(this.selectedWeek);
		this.foodPlans$ = combineLatest([
			this.selectedWeek$,
			this.user$
		]).pipe(switchMap(([selectedWeek, user]) => {
			if (user == null) {
				return of([] as FoodPlan[]);
			}
			return collectionData<FoodPlan>(
				query<FoodPlan>(
					collection(afs, 'foodPlans') as CollectionReference<FoodPlan>,
					where('date', '>=', selectedWeek.startDate),
					where('date', '<=', selectedWeek.endDate),
					where('group', '==', user.selectedGroup)
				), {idField: 'id'}
			);
		}));

		this.addMissingDays();
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
		this.addMissingDays();
	}

	private addMissingDays() {
		// Only need this to run once (user can't add/remove foodPlans)
		combineLatest([
			this.authService.getSimpleUser().pipe(take(1)),
			this.foodPlans$.pipe(take(1))
		]).subscribe(async ([user, foodPlans]) => {
			if (user == null || !user.canEdit || foodPlans.length >= 7) {
				return;
			}

			let existingDates = foodPlans.map(f => f.date.toDate().setHours(0, 0, 0, 0));		// Store as time so it can be compared. Discard hours component
			let datesToAdd: Timestamp[] = [];
			let i = this.selectedWeek.startDate.toDate();
			i.setHours(0, 0, 0, 0);
			for (; i <= this.selectedWeek.endDate.toDate();) {
				if (!existingDates.includes(i.getTime())) {
					datesToAdd.push(Timestamp.fromDate(i));
				}
				i.setDate(i.getDate() + 1);
			}

			// Batch add the missing days
			const batch = writeBatch(this.afs);
			datesToAdd.forEach(date => {
				const newPlanRef = doc(collection(this.afs, 'foodPlans'));
				batch.set(newPlanRef, {date: date, group: user.selectedGroup});
			});
			await batch.commit();
		});
	}
}

interface Week {
	// Date of Monday/Sunday	(depends on value of startOfWeek)
	startDate: Timestamp;
	// Date of Sunday/Saturday
	endDate: Timestamp;
}
