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
import { Group } from "../groups/group";
import { Observable, of, zip } from "rxjs";
import User = firebase.User;

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	constructor(private auth: Auth, private afs: Firestore) {
	}

	getSimpleUser(): Observable<SimpleUser | null> {
		return user(this.auth).pipe(
			switchMap(user => {
				if (user == null) {
					return of(null);
				} else {
					return docData(doc(this.afs, 'users', user.uid) as DocumentReference<SimpleUser>);
				}
			})
		);
	}

	getExtendedUser(): Observable<FoodPlannerUser | null> {
		return this.getSimpleUser().pipe(
			switchMap(simpleUser => {
				if (simpleUser == null) {
					return of(null);
				} else {
					let selectedGroup$ = docData<Group>(doc(this.afs, 'groups', simpleUser.selectedGroup) as DocumentReference<Group>);
					return zip(of(simpleUser), selectedGroup$).pipe(
						switchMap(([simpleUser, selectedGroup]) => {
							let currentUser = this.auth.currentUser;
							selectedGroup.id = simpleUser.selectedGroup;		// Using docData doesn't return id field

							return of({
								...currentUser,
								selectedGroup: selectedGroup,
								canEdit: simpleUser.canEdit
							} as FoodPlannerUser);
						})
					);
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
	canEdit: boolean;
}

export interface SimpleUser {
	id: string;
	name: string;
	selectedGroup: string;
	canEdit: boolean;
}
