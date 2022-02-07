import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AbstractControl, AsyncValidator, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { arrayUnion, doc, Firestore, getDoc, updateDoc } from "@angular/fire/firestore";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Group } from "../group";

@Component({
	selector: 'app-group-member-edit-dialog',
	templateUrl: './group-member-edit-dialog.component.html',
	styleUrls: ['./group-member-edit-dialog.component.css']
})
export class GroupMemberEditDialogComponent implements OnInit {
	member = new FormGroup({
		userId: new FormControl('', {
			validators: [Validators.required],
			asyncValidators: [this.userExistsValidator.validate.bind(this.userExistsValidator)],
			updateOn: "blur"
		}),
		permission: new FormControl('viewer', [Validators.required])
	});


	constructor(
		@Inject(MAT_DIALOG_DATA) public group: Group,
		private dialogRef: MatDialogRef<GroupMemberEditDialogComponent>,
		private afs: Firestore,
		private userExistsValidator: UserExistsValidator
	) {
	}

	ngOnInit(): void {
	}

	onCancelClick() {
		this.dialogRef.close();
	}

	async onSubmit() {
		if (!this.member.valid) {
			return;
		}

		const groupRef = doc(this.afs, "groups", this.group.id);

		switch (this.member.value.permission) {
			case "viewer":
				await updateDoc(groupRef, {
					viewers: arrayUnion(this.member.value.userId)
				});
				break;
			case "editor":
				await updateDoc(groupRef, {
					editors: arrayUnion(this.member.value.userId)
				});
				break;
		}
		this.dialogRef.close();
	}
}

@Injectable({providedIn: 'root'})
export class UserExistsValidator implements AsyncValidator {
	constructor(private afs: Firestore) {
	}

	validate(control: AbstractControl): Observable<ValidationErrors | null> {
		const userRef = doc(this.afs, "users", control.value);

		return from(getDoc(userRef)).pipe(map(u => {
			if (!u.exists()) {
				return {invalidUser: true};
			} else {
				return null;
			}
		}));
	}
}
