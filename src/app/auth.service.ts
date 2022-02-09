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
import { concatMap } from "rxjs/operators";
import { doc, Firestore, getDoc } from "@angular/fire/firestore";
import firebase from "firebase/compat";
import { Group } from "./groups/group";
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
			let selectedGroupId = additionalSettings.data()?.selectedGroup;

			let selectedGroup: Group = {} as Group;
			if (selectedGroupId) {
				selectedGroup = (await getDoc(doc(this.afs, "groups", selectedGroupId))).data() as Group;
				selectedGroup.id = selectedGroupId;
			}

			return {
				...user,
				selectedGroup: selectedGroup
			} as FoodPlannerUser;
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
