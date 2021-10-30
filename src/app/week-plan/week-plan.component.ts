import { Component, OnInit } from '@angular/core';
import { collection, collectionData, CollectionReference, Firestore, query, where } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { FoodPlan } from "../food-plan-detail/foodPlan";
import { Timestamp } from "firebase/firestore";
import { AngularFirestore } from "@angular/fire/compat/firestore";

@Component({
	selector: 'app-week-plan',
	templateUrl: './week-plan.component.html',
	styleUrls: ['./week-plan.component.css']
})
export class WeekPlanComponent implements OnInit {

	foodPlans$: Observable<FoodPlan[]>;

	constructor(afs: Firestore, public firestore: AngularFirestore) {
		let week = this.getCurrentWeek();
		this.foodPlans$ = collectionData<FoodPlan>(
			query<FoodPlan>(
				collection(afs, 'foodPlans') as CollectionReference<FoodPlan>,
				where('date', '>=', week.startDate),
				where('date', '<=', week.endDate)
			), {idField: 'id'}
		);

		this.foodPlans$.subscribe(foodPlans => {
			if (foodPlans.length === 7) {
				return;
			}

			let existingDates = foodPlans.map(f => f.date.toDate().getTime());		// Store as time so it can be compared
			let datesToAdd: Timestamp[] = [];
			let i = week.startDate.toDate();
			for (; i <= week.endDate.toDate();) {
				if (!existingDates.includes(i.getTime())) {
					datesToAdd.push(Timestamp.fromDate(i));
				}
				i.setDate(i.getDate() + 1);
			}

			// Batch add the missing days
			const batch = this.firestore.firestore.batch();
			datesToAdd.forEach(date => {
				const newPlanRef = this.firestore.firestore.collection('foodPlans').doc();
				batch.set(newPlanRef, {date: date});
			});
			batch.commit();
		});

	}

	ngOnInit(): void {
	}

	getCurrentWeek(): Week {
		let date = new Date();
		let day = date.getDay();
		let monDiff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
		let sunDiff = monDiff + 6;
		let mondayDate = new Date(date.setDate(monDiff));
		mondayDate.setHours(0, 0, 0, 0);
		let sundayDate = new Date(date.setDate(sunDiff));
		sundayDate.setHours(0, 0, 0, 0);

		return {
			startDate: Timestamp.fromDate(mondayDate),
			endDate: Timestamp.fromDate(sundayDate)
		};
	}
}

interface Week {
	// Date of Monday
	startDate: Timestamp;
	// Date of Sunday
	endDate: Timestamp;
}
