import { Injectable } from '@angular/core';
import { Week } from "../week-plan/week-plan.component";
import { BehaviorSubject } from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class StateService {

	private readonly _weekPlanState = new BehaviorSubject<WeekPlanState | null>(null);

	getWeekPlanState(): WeekPlanState | null {
		return this._weekPlanState.getValue();
	}

	setWeekPlanState(selectedWeek: Week): void {
		this._weekPlanState.next({ selectedWeek });
	}
}

export interface WeekPlanState {
	selectedWeek: Week;
}
