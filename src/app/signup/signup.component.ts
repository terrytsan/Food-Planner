import { Component, OnInit } from '@angular/core';
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { addDoc, collection, doc, Firestore, setDoc } from "@angular/fire/firestore";

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
	displayName: string;
	email: string;
	password: string;

	constructor(private authService: AuthService, private router: Router, private afs: Firestore) {
	}

	ngOnInit(): void {
	}

	onSubmit() {
		this.authService.createUserWithEmailAndPassword(this.email, this.password).then(async (userCredentials) => {
			this.authService.updateProfile({displayName: this.displayName});
			// Create new group
			const groupRef = await addDoc(collection(this.afs, 'groups'), {
				name: this.displayName + "'s group",
				owner: userCredentials.user.uid,
				viewers: [],
				editors: []
			});

			await setDoc(doc(this.afs, 'users', userCredentials.user.uid), {
				selectedGroup: groupRef.id
			});

			this.router.navigate(['']);
		});

	}
}
