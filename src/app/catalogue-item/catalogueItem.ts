import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;

export interface CatalogueItem {
	id: string;
	name: string;
	description: string;
	storePurchased: string;
	image: string;
	dateAdded: Timestamp;
	status: string;
}
