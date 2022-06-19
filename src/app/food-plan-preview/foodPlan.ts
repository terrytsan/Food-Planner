import { Timestamp } from "firebase/firestore";
import { Food } from "../food-card/food";

export interface FoodPlan {
	id: string;
	foods?: string[];		// Temp variable for now. Will be phased out in the future
	date: Timestamp;
	group: string;
	dishes: Dish[];
}

export interface Dish {
	index: number;
	food: Food;
	ingredients: string[];
}

// Representation of firestore document
export interface FoodPlanDocument {
	id: string;
	foods?: string[];
	date: Timestamp;
	group: string;
	dishes: SimpleDish[];
}

export interface SimpleDish {
	index: number;
	foodId: string;
	ingredients: string[];
}
