import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
	selector: 'app-confirmation-dialog',
	templateUrl: './confirmation-dialog.component.html',
	styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData,
		private dialogRef: MatDialogRef<ConfirmationDialogComponent>
	) {
	}

	cancel() {
		this.dialogRef.close(false);
	}

	confirm() {
		this.dialogRef.close(true);
	}
}

export class ConfirmationDialogData {
	title: string = "Confirm Action";
	message: string = "";
	confirmBtnText: string = "Confirm";
	confirmBtnColor: string = "primary";
	cancelBtnText: string = "Cancel";


	constructor(init?: Partial<ConfirmationDialogData>) {
		Object.assign(this, init);
	}
}
