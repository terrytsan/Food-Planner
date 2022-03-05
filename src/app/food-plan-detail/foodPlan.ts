import { Timestamp } from "firebase/firestore";

export interface FoodPlan {
	id: string,
	foods?: string[],
	date: Timestamp,
	group: string
}
