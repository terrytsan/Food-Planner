import { Component, Inject, OnInit } from '@angular/core';
import {
	deleteObject,
	getDownloadURL,
	getStorage,
	ref,
	Storage,
	uploadBytesResumable,
	UploadTask
} from '@angular/fire/storage';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Food } from "../food-card/food";
import { FormBuilder, Validators } from "@angular/forms";
import { ImageService } from "../../image.service";
import { addDoc, collection, doc, Firestore, updateDoc } from "@angular/fire/firestore";
import { AuthService } from "../auth.service";
import { take } from "rxjs/operators";

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
	file?: File;
	imgPreviewSrc: string;
	fileName: string = '';
	uploadTask: UploadTask;
	saving: boolean = false;
	fileUploadProgress: number;
	food: Food = {
		id: "",
		name: "",
		description: "",
		image: "",
		imagePath: "",
		labels: [],
		group: ""
	};
	foodImagesFolder: string = 'foodImages/';

	constructor(
		@Inject(MAT_DIALOG_DATA) public foodData: Food,
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<FoodEditDialogComponent>,
		private storage: Storage,
		private afs: Firestore,
		private imageService: ImageService,
		private authService: AuthService
	) {
	}

	ngOnInit(): void {
		this.authService.getSimpleUser().pipe(take(1)).subscribe(user => {
			if (user != null) {
				this.food.group = user.selectedGroup;
			}
		});
		// Presence of foodData means this is edit mode
		if (this.foodData) {
			this.food = this.foodData;
			this.foodForm.setValue({
				name: this.foodData.name,
				description: this.foodData.description
			});
			this.imgPreviewSrc = this.food.image;

			let fullFileName = this.foodData.imagePath.replace(`${this.foodImagesFolder}`, "");
			let fileName = fullFileName.split('-')[0];
			let ext = fullFileName.split('.').pop();

			// Don't re-add extension if file name didn't contain timestamp
			this.fileName = fullFileName.includes('-') ? `${fileName}.${ext}` : fileName;
		}
	}

	ngOnDestroy() {
		if (this.uploadTask) {
			this.uploadTask.cancel();
		}
	}

	onFileSelected($event: Event) {
		const target = $event.target as HTMLInputElement;
		if (!target.files) return;

		const reader = new FileReader();
		this.file = target.files[0];
		reader.readAsDataURL(this.file);
		reader.onload = () => {
			this.imgPreviewSrc = reader.result as string;
		};
	}

	async uploadFileToFirebase(file: File) {
		const fileName = file.name.split('.')[0];
		this.fileName = file.name;
		const ext = file.name.split('.').pop();
		const path = `${this.foodImagesFolder}${fileName}-${new Date().toISOString().slice(0, 19)}.${ext}`;
		this.food.imagePath = path;

		try {
			const storageRef = ref(this.storage, path);
			this.uploadTask = uploadBytesResumable(storageRef, file);
			this.uploadTask.on('state_changed',
				(snapshot) => {
					// Observe state change events such as progress, pause, and resume
					this.fileUploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				},
				(error) => {
					console.error("Error uploading image. ", +error);
				}
			);
			await this.uploadTask;
			this.food.image = await getDownloadURL(storageRef);
		} catch (e) {
			console.error(e);
		}
	}

	onCancelClick() {
		this.dialogRef.close();
	}

	async onSaveClick() {
		if (this.saving) {
			return;
		}
		this.saving = true;

		if (this.file) {
			let compressedImage = await this.imageService.compressImage(this.file);
			await this.uploadFileToFirebase(compressedImage);
		}

		if (this.foodData) {
			let foodRef = doc(this.afs, 'foods', this.food.id);
			updateDoc(foodRef, {
				name: this.foodForm.value.name,
				description: this.foodForm.value.description,
				image: this.food.image,
				imagePath: this.food.imagePath
			}).then(() => {
				this.saving = false;
				this.dialogRef.close();
			});
		} else {
			addDoc(collection(this.afs, 'foods'), {
				name: this.foodForm.value.name,
				description: this.foodForm.value.description,
				image: this.food.image,
				imagePath: this.food.imagePath,
				group: this.food.group
			}).then(() => {
				this.saving = false;
				this.dialogRef.close();
			});
		}
	}

	removeImage() {
		if (this.file) {
			this.file = undefined;
		}

		if (this.food.imagePath) {
			let imageRef = ref(getStorage(), this.food.imagePath);

			deleteObject(imageRef).then(() => {
			}).catch(error => {
				console.error(`Error deleting image at: ${this.food.imagePath}. ${error}`);
			});
		}

		this.imgPreviewSrc = '';
		this.fileName = '';
		this.food.image = '';
		this.food.imagePath = '';
	}
}
