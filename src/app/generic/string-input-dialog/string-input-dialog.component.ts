import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormControl, Validators } from "@angular/forms";

@Component({
	selector: 'app-string-input-dialog',
	templateUrl: './string-input-dialog.component.html',
	styleUrls: ['./string-input-dialog.component.scss']
})
export class StringInputDialogComponent implements OnInit {
	stringInput = new FormControl('', [Validators.required]);

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: StringInputDialogData,
		private dialogRef: MatDialogRef<StringInputDialogComponent>
	) {
		this.stringInput.setValue(data.initialValue);
	}

	ngOnInit(): void {
	}

	cancel() {
		this.dialogRef.close();
	}

	close() {
		if (!this.stringInput.invalid) {
			this.dialogRef.close(this.stringInput.value);
		}
	}
}

export class StringInputDialogData {
	title: string;
	inputLabel: string = "";
	initialValue: string = "";
	confirmBtnText: string = "Ok";
	cancelBtnText: string = "Cancel";
}
