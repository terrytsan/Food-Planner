import { Timestamp } from "firebase/firestore";

// Representation of firestore document
export interface FoodPlanDocument {
	id: string;
	foods?: string[];
	date: Timestamp;
	group: string;
}
