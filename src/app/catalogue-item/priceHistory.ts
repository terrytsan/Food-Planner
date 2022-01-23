import { Timestamp } from "firebase/firestore";

export interface PriceHistory {
	id: string;
	date?: Timestamp;
	price?: number;
	store?: string;
}
