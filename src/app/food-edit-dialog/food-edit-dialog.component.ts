import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
	deleteObject,
	getDownloadURL,
	getStorage,
	ref,
	Storage,
	uploadBytesResumable,
	UploadTask
} from '@angular/fire/storage';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Food } from "../food-card/food";
import { FormBuilder, Validators } from "@angular/forms";
import { ImageService } from "../services/image.service";
import { AuthService } from "../services/auth.service";
import { take } from "rxjs/operators";
import {
	ConfirmationDialogComponent,
	ConfirmationDialogData
} from "../generic/confirmation-dialog/confirmation-dialog.component";
import { FoodService } from "../services/food.service";

@Component({
	selector: 'app-food-edit-dialog',
	templateUrl: './food-edit-dialog.component.html',
	styleUrls: ['./food-edit-dialog.component.scss']
})
export class FoodEditDialogComponent implements OnInit, OnDestroy {
	foodForm = this.fb.group({
		name: ['', Validators.required],
		description: ['']
	});
	file?: File;
	fileDeleted: boolean = false;
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
		group: "",
		coreIngredients: [],
		optionalIngredients: []
	};
	foodImagesFolder: string = 'foodImages/';

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: FoodEditDialogData,
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<FoodEditDialogComponent>,
		private storage: Storage,
		private imageService: ImageService,
		private authService: AuthService,
		private foodService: FoodService,
		private dialog: MatDialog
	) {
	}

	ngOnInit(): void {
		this.authService.getSimpleUser().pipe(take(1)).subscribe(user => {
			if (user != null) {
				this.food.group = user.selectedGroup;
			}
		});
		// Presence of foodData means this is edit mode
		if (this.data.FoodData) {
			this.food = this.data.FoodData;
			this.foodForm.setValue({
				name: this.data.FoodData.name,
				description: this.data.FoodData.description
			});
			this.imgPreviewSrc = this.food.image;

			let fullFileName = this.data.FoodData.imagePath.replace(`${this.foodImagesFolder}`, "");
			let timestampRegex = /-\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;		// Remove ISOString appended on upload
			this.fileName = fullFileName.replace(timestampRegex, '');
		}
		this.dialogRef.disableClose = true;

		this.dialogRef.backdropClick().subscribe(() => {
			if (this.foodForm.pristine) {
				this.dialogRef.close();
			} else {
				this.confirmDiscardBeforeClose();
			}
		});
	}

	/**
	 * Confirm user wants to discard changes before closing this modal.
	 */
	private confirmDiscardBeforeClose() {
		let dialogData = new ConfirmationDialogData({
			title: "Unsaved Changes",
			message: "You have unsaved changes. Do you want to discard them?",
			confirmBtnText: "Discard",
			confirmBtnColor: "warn"
		});
		let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
			width: '60%',
			maxWidth: '550px',
			autoFocus: false,
			data: dialogData
		});
		dialogRef.afterClosed().subscribe(discardChanges => {
			if (discardChanges) {
				this.dialogRef.close();
			}
		});
	}

	ngOnDestroy() {
		if (this.uploadTask) {
			this.uploadTask.cancel();
		}
	}

	onFileSelected($event: Event) {
		const target = $event.target as HTMLInputElement;
		if (!target.files) return;

		this.foodForm.markAsDirty();
		const reader = new FileReader();
		this.file = target.files[0];
		this.fileName = this.file.name;
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
			// Delete previous image if exists
			if (this.food.imagePath) {
				this.deleteFirestoreFile(this.food.imagePath);
			}

			let compressedImage = await this.imageService.compressImage(this.file);
			await this.uploadFileToFirebase(compressedImage);
		} else {
			// No file - this could mean no change or image was deleted
			if (this.fileDeleted) {
				if (this.food.imagePath) {
					this.deleteFirestoreFile(this.food.imagePath);
				}
				this.food.image = "";
				this.food.imagePath = "";
			}
		}

		if (this.data.FoodData) {
			this.foodService.updateFood(this.food.id, {
				name: this.foodForm.value.name,
				description: this.foodForm.value.description,
				image: this.food.image,
				imagePath: this.food.imagePath
			}).then(() => {
				this.saving = false;
				this.dialogRef.close();
			});
		} else {
			this.foodService.addFood({
				name: this.foodForm.value.name,
				description: this.foodForm.value.description,
				image: this.food.image,
				imagePath: this.food.imagePath,
				group: this.food.group,
				labels: this.food.labels
			}).then((addedFood) => {
				this.saving = false;
				this.dialogRef.close(addedFood.id);
			});
		}
	}

	removeImage() {
		this.fileDeleted = true;
		if (this.file) {
			this.file = undefined;
		}

		this.imgPreviewSrc = '';
		this.fileName = '';
	}

	deleteFirestoreFile(path: string) {
		let fileRef = ref(getStorage(), path);

		deleteObject(fileRef).then(() => {
		}).catch(error => {
			console.error(`Error deleting image at: ${this.food.imagePath}. ${error}`);
		});
	}
}

export interface FoodEditDialogData {
	FoodData: Food;
	AllLabels: string[];
}
