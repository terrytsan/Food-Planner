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
import { Observable } from "rxjs";
import { FoodPlan } from "../food-plan-detail/foodPlan";
import { Timestamp } from "firebase/firestore";
import { take } from "rxjs/operators";

@Component({
	selector: 'app-week-plan',
	templateUrl: './week-plan.component.html',
	styleUrls: ['./week-plan.component.css']
})
export class WeekPlanComponent implements OnInit {

	foodPlans$: Observable<FoodPlan[]>;
	selectedWeek: Week;
	startOfWeek = 'Sunday';
	earliestStartingWeek = Timestamp.fromDate(new Date("25 October 2021"));		// Prevent weeks earlier than this date from being generated

	constructor(public afs: Firestore) {
		this.selectedWeek = this.getCurrentWeek();
		this.foodPlans$ = collectionData<FoodPlan>(
			query<FoodPlan>(
				collection(afs, 'foodPlans') as CollectionReference<FoodPlan>,
				where('date', '>=', this.selectedWeek.startDate),
				where('date', '<=', this.selectedWeek.endDate)
			), {idField: 'id'}
		);

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

		this.foodPlans$ = collectionData<FoodPlan>(
			query<FoodPlan>(
				collection(this.afs, 'foodPlans') as CollectionReference<FoodPlan>,
				where('date', '>=', this.selectedWeek.startDate),
				where('date', '<=', this.selectedWeek.endDate)
			), {idField: 'id'}
		);
		this.addMissingDays();
	}

	private addMissingDays() {
		// Only need this to run once (user can't add/remove foodPlans)
		this.foodPlans$.pipe(take(1)).subscribe(async foodPlans => {
			if (foodPlans.length >= 7) {
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
				batch.set(newPlanRef, {date: date});
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
