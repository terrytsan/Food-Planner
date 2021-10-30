import { Component, OnInit } from '@angular/core';
import { collection, collectionData, CollectionReference, Firestore, query, where } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { FoodPlan } from "../food-plan-detail/foodPlan";
import { Timestamp } from "firebase/firestore";

@Component({
	selector: 'app-week-plan',
	templateUrl: './week-plan.component.html',
	styleUrls: ['./week-plan.component.css']
})
export class WeekPlanComponent implements OnInit {

	foodPlans$: Observable<FoodPlan[]>;

	constructor(firestore: Firestore) {
		let week = this.getCurrentWeek();
		this.foodPlans$ = collectionData<FoodPlan>(
			query<FoodPlan>(
				collection(firestore, 'foodPlans') as CollectionReference<FoodPlan>,
				where('date', '>=', week.startDate),
				where('date', '<=', week.endDate)
			), {idField: 'id'}
		);
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
