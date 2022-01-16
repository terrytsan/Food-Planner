import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;

export interface CatalogueItem {
	id: string;
	name: string;
	description: string;
	imageUrl: string;
	imagePath: string;
	dateAdded: Timestamp;
	status: string;
}
