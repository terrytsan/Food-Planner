import { Component, Inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
	AbstractControl,
	AsyncValidator,
	FormControl,
	FormGroup,
	ValidationErrors,
	ValidatorFn,
	Validators
} from "@angular/forms";
import { doc, Firestore, getDoc } from "@angular/fire/firestore";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Group } from "../group";
import { GroupService } from "../group.service";

@Component({
	selector: 'app-group-member-edit-dialog',
	templateUrl: './group-member-edit-dialog.component.html',
	styleUrls: ['./group-member-edit-dialog.component.scss']
})
export class GroupMemberEditDialogComponent {
	member = new FormGroup({
		userId: new FormControl('', {
			validators: [Validators.required, existingMemberValidator(this.data.group)],
			asyncValidators: [this.userExistsValidator.validate.bind(this.userExistsValidator)],
			updateOn: "blur"
		}),
		permission: new FormControl('viewer', [Validators.required])
	});
	isAdding: boolean = true;


	constructor(
		@Inject(MAT_DIALOG_DATA) public data: GroupMemberEditDialogData,
		private dialogRef: MatDialogRef<GroupMemberEditDialogComponent>,
		private afs: Firestore,
		private userExistsValidator: UserExistsValidator,
		private groupService: GroupService
	) {
		if (data.userId) {
			this.isAdding = false;
			this.member.controls['userId'].disable();
			this.member.controls['userId'].setValue(data.userId);
			this.member.controls['permission'].setValue(data.currentPermission.toLowerCase());
		}
	}

	onCancelClick() {
		this.dialogRef.close();
	}

	onSubmit() {
		if (!this.member.valid) {
			return;
		}
		if (this.isAdding) {
			this.groupService.addMember(this.data.group, this.member.value.userId!, this.member.value.permission!).then(() => this.dialogRef.close());
		} else {
			// Get raw value as form control will be disabled
			this.groupService.changePermission(this.data.group, this.member.getRawValue().userId!, this.member.value.permission!).then(() => this.dialogRef.close());
		}
	}

	removeMember() {
		this.groupService.removeMember(this.data.group, this.data.userId).then(() => this.dialogRef.close());
	}
}

@Injectable({ providedIn: 'root' })
export class UserExistsValidator implements AsyncValidator {
	constructor(private afs: Firestore) {
	}

	validate(control: AbstractControl): Observable<ValidationErrors | null> {
		const userRef = doc(this.afs, "users", control.value);

		return from(getDoc(userRef)).pipe(map(u => {
			if (!u.exists()) {
				return { invalidUser: true };
			} else {
				return null;
			}
		}));
	}
}

export function existingMemberValidator(group: Group): ValidatorFn {
	let existingIds = [group.owner, ...group.viewers, ...group.editors].map(t => t.id);

	return (control: AbstractControl): ValidationErrors | null => {
		if (existingIds.includes(control.value)) {
			return { userExistsInGroup: true };
		} else {
			return null;
		}
	};
}

export interface GroupMemberEditDialogData {
	userId: string;
	currentPermission: string;
	group: Group;
}
