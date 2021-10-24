import { Component, Inject, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage, uploadBytesResumable } from '@angular/fire/storage';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
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
		description: ['']
	});
	fileName: string = '';
	food: Food = {
		id: "",
		name: "",
		description: "",
		image: "",
		imagePath: ""
	};
	foodImagesFolder: string = 'foodImages/';

	constructor(
		@Inject(MAT_DIALOG_DATA) public foodData: Food,
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<FoodEditDialogComponent>,
		private storage: Storage,
		public firestore: AngularFirestore
	) {
	}

	ngOnInit(): void {
		// Presence of foodData means this is edit mode
		if (this.foodData) {
			this.food = this.foodData;
			this.foodForm.setValue({
				name: this.foodData.name,
				description: this.foodData.description
			});

			let fullFileName = this.foodData.imagePath.replace(`${this.foodImagesFolder}`, "");
			let fileName = fullFileName.split('-')[0];
			let ext = fullFileName.split('.').pop();

			// Don't re-add extension if file name didn't contain timestamp
			this.fileName = fullFileName.includes('-') ? `${fileName}.${ext}` : fileName;
		}
	}

	async onFileSelected($event: Event) {
		const target = $event.target as HTMLInputElement;
		if (!target.files) return;

		const file: File = target.files[0];
		const fileName = file.name.split('.')[0];
		this.fileName = file.name;
		const ext = file.name.split('.').pop();
		const path = `${this.foodImagesFolder}${fileName}-${new Date().toISOString().slice(0, 19)}.${ext}`;
		this.food.imagePath = path;

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
		if (this.foodData) {
			this.firestore.collection('foods').doc(this.food.id).update({
				name: this.foodForm.value.name,
				description: this.foodForm.value.description,
				image: this.food.image,
				imagePath: this.food.imagePath
			}).then(() => this.dialogRef.close());
		} else {
			this.firestore.collection('foods')
				.add({
					name: this.foodForm.value.name,
					description: this.foodForm.value.description,
					image: this.food.image,
					imagePath: this.food.imagePath
				}).then(() => this.dialogRef.close());
		}
	}
}
