import { Component, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage, uploadBytesResumable } from '@angular/fire/storage';
import { MatDialogRef } from "@angular/material/dialog";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Food } from "../food-detail/food";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
	selector: 'app-food-edit-dialog',
	templateUrl: './food-edit-dialog.component.html',
	styleUrls: ['./food-edit-dialog.component.css']
})
export class FoodEditDialogComponent implements OnInit {
	foodForm = this.fb.group({
		name: ['', Validators.required],
		description: ['', Validators.required],
		file: ['', Validators.required]
	});
	fileName: string = '';
	fileUpload: any;
	food: Food = {
		id: "",
		name: "",
		description: "",
		image: ""
	};

	constructor(
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<FoodEditDialogComponent>,
		private storage: Storage,
		public firestore: AngularFirestore
	) {
	}

	ngOnInit(): void {
	}

	async onFileSelected($event: Event) {
		const target = $event.target as HTMLInputElement;
		if (!target.files) return;

		const file: File = target.files[0];
		const fileName = file.name.split('.')[0];
		const ext = file.name.split('.').pop();
		const path = `foodImages/${fileName}-${new Date().toISOString().slice(0, 19)}.${ext}`;

		try {
			const storageRef = ref(this.storage, path);
			const task = uploadBytesResumable(storageRef, file);
			await task;
			this.food.image = await getDownloadURL(storageRef);
		} catch (e) {
			console.error(e);
		}
	}

	onCancelClick() {
		this.dialogRef.close();
	}

	onSaveClick() {
		this.firestore.collection('foods')
			.add({
				name: this.foodForm.value.name,
				description: this.foodForm.value.description,
				image: this.food.image
			})
			.then(() => this.dialogRef.close());
	}
}
