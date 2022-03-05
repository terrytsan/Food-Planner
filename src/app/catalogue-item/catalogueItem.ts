import { Timestamp } from "firebase/firestore";

export interface CatalogueItem {
	id: string;
	name: string;
	description: string;
	imageUrl: string;
	imagePath: string;
	dateAdded: Timestamp;
	status: string;
	group: string;
}
