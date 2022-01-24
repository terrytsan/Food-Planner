import { Component, OnInit } from '@angular/core';
import {
	collection,
	collectionData,
	CollectionReference,
	deleteDoc,
	doc,
	Firestore,
	orderBy,
	query
} from "@angular/fire/firestore";
import { FoodPlan } from "../food-plan-preview/foodPlan";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

	duplicateFoodPlans$: Observable<FoodPlan[]>;
	emptyDuplicateFoodPlans$: Observable<FoodPlan[]>;

	constructor(private afs: Firestore) {
		this.initDuplicateFoodPlan();
	}

	ngOnInit(): void {
	}

	initDuplicateFoodPlan() {
		this.duplicateFoodPlans$ = collectionData<FoodPlan>(
			query<FoodPlan>(
				collection(this.afs, 'foodPlans') as CollectionReference<FoodPlan>,
				orderBy('date')
			), {idField: 'id'}
		).pipe(map(foodPlans => {
			const lookup = foodPlans.reduce((a, e) => {
				a.set(e.date.seconds, (a.get(e.date.seconds) ?? 0) + 1);
				return a;
			}, new Map());

			return foodPlans.filter(e => lookup.get(e.date.seconds) > 1);
		}));

		this.emptyDuplicateFoodPlans$ = this.duplicateFoodPlans$.pipe(map(foodPlans => {
			return foodPlans.filter(e => !e.foods);
		}));
	}

	async deleteFoodPlan(id: string) {
		const foodPlanRef = doc(this.afs, 'foodPlans', id);
		await deleteDoc(foodPlanRef);
	}
}
