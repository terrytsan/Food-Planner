import { Component, Input, OnInit } from '@angular/core';
import { FoodPlan } from "./foodPlan";
import { Food } from "../food-detail/food";
import { Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/compat/firestore";

@Component({
	selector: 'app-food-plan-detail',
	templateUrl: './food-plan-detail.component.html',
	styleUrls: ['./food-plan-detail.component.css']
})
export class FoodPlanDetailComponent implements OnInit {

	@Input() foodPlan: FoodPlan = {} as FoodPlan;

	food$: Observable<Food>;

	constructor(public firestore: AngularFirestore) {
	}

	ngOnInit(): void {
		this.food$ = this.firestore.collection('foods').doc(this.foodPlan.foodId).valueChanges() as Observable<Food>;
	}
}
