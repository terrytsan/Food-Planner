import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, user } from "@angular/fire/auth";
import { signOut } from 'firebase/auth';
import { concatMap } from "rxjs/operators";
import { doc, Firestore, getDoc } from "@angular/fire/firestore";
import firebase from "firebase/compat";
import User = firebase.User;

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	constructor(private auth: Auth, private afs: Firestore) {
	}

	getExtendedUser() {
		return user(this.auth).pipe(concatMap(async user => {
			if (user == null) {
				return user;
			}

			let additionalSettings = (await getDoc(doc(this.afs, "users", user.uid)));

			return {
				...user,
				selectedGroup: additionalSettings.data()?.selectedGroup
			} as FoodPlannerUser;
		}));
	}

	signInWithEmailAndPassword(email: string, password: string) {
		return signInWithEmailAndPassword(this.auth, email, password);
	}

	signOut() {
		return signOut(this.auth);
	}
}

export interface FoodPlannerUser extends User {
	selectedGroup: string;
}
