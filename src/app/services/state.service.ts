import { Injectable } from '@angular/core';
import { Week } from "../week-plan/week-plan.component";

@Injectable({
	providedIn: 'root'
})
export class StateService {

	weekPlanState: WeekPlanState = {} as WeekPlanState;

	constructor() {
	}


	// set weekPlanState(state:any){
	//
	// }
	// get weekPlanState(){
	//
	// }
}

export interface WeekPlanState {
	selectedWeek: Week;
}
