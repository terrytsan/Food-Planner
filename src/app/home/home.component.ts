import { Component, Signal } from '@angular/core';
import { FoodPlanService } from "../services/food-plan.service";
import { Observable, switchMap } from "rxjs";
import { FoodPlan } from "../food-plan-preview/foodPlan";
import { Timestamp } from "firebase/firestore";
import { AuthService, SimpleUser } from "../services/auth.service";
import { filter } from "rxjs/operators";
import { isNonNullOrUndefined } from "../utils";
import { GlobalVariable } from "../global";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent {

	user$: Observable<SimpleUser | null> = this.authService.getSimpleUser();
	foodPlans$: Observable<FoodPlan[]> = new Observable<FoodPlan[]>();
	foodPlans: Signal<FoodPlan[]>;

	defaultImage: string = GlobalVariable.PLACEHOLDER_IMAGE_URL;

	constructor(private authService: AuthService, private foodPlanService: FoodPlanService) {
		let today = new Date();
		today.setHours(0, 0, 0, 0);
		let date = new Date();
		date.setDate(date.getDate() + 3);

		this.foodPlans$ = this.user$.pipe(
			filter(isNonNullOrUndefined),
			switchMap((user) => this.foodPlanService.getFoodPlansBetweenDates(Timestamp.fromDate(today), Timestamp.fromDate(date), user.selectedGroup)));

		this.foodPlans = toSignal(this.foodPlans$, { initialValue: [] });
	}
}
