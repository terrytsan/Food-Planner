import { Injectable } from '@angular/core';
import {
	Auth,
	createUserWithEmailAndPassword,
	getAuth,
	signInWithEmailAndPassword,
	updateProfile,
	user
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
		return user(this.auth).pipe(
			switchMap(user => {
				if (user == null) {
					return of(null);
				} else {
					let user$: Observable<SimpleUser> = docData(doc(this.afs, 'users', user.uid) as DocumentReference<SimpleUser>);
					return user$.pipe(
						switchMap(simpleUser => {
							let selectedGroup$ = docData<Group>(doc(this.afs, 'groups', simpleUser.selectedGroup) as DocumentReference<Group>);
							return zip(of(simpleUser), selectedGroup$);
						}),
						switchMap(([simpleUser, selectedGroup]) => {
							selectedGroup.id = simpleUser.selectedGroup;		// Using docData doesn't return id field

							return of({
								...user,
								selectedGroup: selectedGroup
							} as FoodPlannerUser);
						}));
				}
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
