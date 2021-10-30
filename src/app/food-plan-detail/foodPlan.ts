import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;

export interface FoodPlan {
	id: string,
	foodId?: string,
	date: Timestamp
}
