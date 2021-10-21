import { Component, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage, uploadBytesResumable } from '@angular/fire/storage';
import { MatDialogRef } from "@angular/material/dialog";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Food } from "../food-detail/food";

@Component({
	selector: 'app-food-edit-dialog',
	templateUrl: './food-edit-dialog.component.html',
	styleUrls: ['./food-edit-dialog.component.css']
})
export class FoodEditDialogComponent implements OnInit {
	fileName: string = '';
	fileUpload: any;
	food: Food = {
		id: "",
		name: "",
		description: "",
		image: ""
	};

	constructor(
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
			.add(this.food)
			.then(() => this.dialogRef.close());
	}
}
