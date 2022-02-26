import { Injectable } from '@angular/core';
import {
	Auth,
	createUserWithEmailAndPassword,
	getAuth,
	signInWithEmailAndPassword,
	updateProfile
} from "@angular/fire/auth";
import { signOut } from 'firebase/auth';
import { switchMap } from "rxjs/operators";
import { doc, docData, DocumentReference, Firestore } from "@angular/fire/firestore";
import firebase from "firebase/compat";
import { Group } from "./groups/group";
import { Observable, of, zip } from "rxjs";
import User = firebase.User;

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	constructor(private auth: Auth, private afs: Firestore) {
	}

	getExtendedUser(): Observable<FoodPlannerUser | null> {
		if (this.auth.currentUser == null) {
			return of(null);
		}

		let user$: Observable<SimpleUser> = docData(doc(this.afs, 'users', this.auth.currentUser.uid) as DocumentReference<SimpleUser>);

		return user$.pipe(switchMap(user => {
			let selectedGroup$ = docData<Group>(doc(this.afs, 'groups', user.selectedGroup) as DocumentReference<Group>);
			return zip(of(user), selectedGroup$);
		}), switchMap(([simpleUser, selectedGroup]) => {
			let currentUser = this.auth.currentUser;
			selectedGroup.id = simpleUser.selectedGroup;		// Using docData doesn't return id field

			return of({
				...currentUser,
				selectedGroup: selectedGroup
			} as FoodPlannerUser);
		}));
	}

	signInWithEmailAndPassword(email: string, password: string) {
		return signInWithEmailAndPassword(this.auth, email, password);
	}

	createUserWithEmailAndPassword(email: string, password: string) {
		return createUserWithEmailAndPassword(this.auth, email, password);
	}

	updateProfile(properties: any) {
		const auth = getAuth();
		if (auth.currentUser != null) {
			updateProfile(auth.currentUser, properties);
		}
	}

	signOut() {
		return signOut(this.auth);
	}
}

export interface FoodPlannerUser extends User {
	selectedGroup: Group;
}

export interface SimpleUser {
	id: string;
	name: string;
	selectedGroup: string;
}
