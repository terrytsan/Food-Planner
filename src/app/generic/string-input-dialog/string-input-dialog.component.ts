import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
	selector: 'app-string-input-dialog',
	templateUrl: './string-input-dialog.component.html',
	styleUrls: ['./string-input-dialog.component.css']
})
export class StringInputDialogComponent implements OnInit {

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: StringInputDialogData,
		private dialogRef: MatDialogRef<StringInputDialogComponent>
	) {
	}

	ngOnInit(): void {
	}

	cancel() {
		this.dialogRef.close();
	}
}

export class StringInputDialogData {
	title: string;
	inputLabel: string = "";
	initialValue: string = "";
	confirmBtnText: string = "Ok";
	cancelBtnText: string = "Cancel";
}
