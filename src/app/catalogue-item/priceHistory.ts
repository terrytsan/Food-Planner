import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;

export interface PriceHistory {
	date?: Timestamp;
	price?: number;
	store?: string;
}
