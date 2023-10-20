import { Component } from '@angular/core';
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { addDoc, collection, doc, Firestore, setDoc } from "@angular/fire/firestore";
import { MatDialog } from "@angular/material/dialog";
import { PrivacyPolicyDialogComponent } from "../privacy-policy-dialog/privacy-policy-dialog.component";
import { Analytics, logEvent } from "@angular/fire/analytics";

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
	displayName: string;
	email: string;
	password: string;
	termsAccepted: boolean;

	constructor(
		private authService: AuthService,
		private router: Router,
		private afs: Firestore,
		private dialog: MatDialog,
		private analytics: Analytics
	) {
	}

	onSubmit() {
		this.authService.createUserWithEmailAndPassword(this.email, this.password).then(async (userCredentials) => {
			this.authService.updateProfile({ displayName: this.displayName });
			// Create new group
			const groupRef = await addDoc(collection(this.afs, 'groups'), {
				name: this.displayName + "'s group",
				owner: userCredentials.user.uid,
				viewers: [],
				editors: []
			});

			await setDoc(doc(this.afs, 'users', userCredentials.user.uid), {
				name: this.displayName,
				selectedGroup: groupRef.id,
				canEdit: true
			});
			logEvent(this.analytics, "sign_up");

			this.router.navigate(['']);
		});

	}

	openPrivacyPolicyDialog() {
		this.dialog.open(PrivacyPolicyDialogComponent, {
			width: '80%',
			maxWidth: '600px'
		});
	}
}
