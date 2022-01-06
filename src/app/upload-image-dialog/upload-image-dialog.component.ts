import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { getDownloadURL, ref, Storage, uploadBytesResumable, UploadTask } from "@angular/fire/storage";
import { ImageService } from "../../image.service";

@Component({
	selector: 'app-upload-image-dialog',
	templateUrl: './upload-image-dialog.component.html',
	styleUrls: ['./upload-image-dialog.component.css']
})
export class UploadImageDialogComponent implements OnInit {

	fileName: string = '';
	imgPreviewSrc: string;
	file: File;
	uploadingFile: boolean = false;
	fileUploadProgress: number = 0;
	firebaseStoragePath: string = '';

	constructor(
		public dialogRef: MatDialogRef<UploadImageDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: UploadImageDialogData,
		private storage: Storage,
		private imageService: ImageService
	) {
		this.firebaseStoragePath = data.FirebaseStorePath;
	}

	ngOnInit(): void {
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
		this.fileName = this.file.name;
	}

	onCancelClick() {
		this.dialogRef.close();
	}

	async onSaveClick() {
		this.uploadingFile = true;
		let response: UploadImageDialogResponse = new UploadImageDialogResponse();

		const fileName = this.file.name.split('.')[0];
		const ext = this.file.name.split('.').pop();
		const path = `${this.firebaseStoragePath}${fileName}-${new Date().toISOString().slice(0, 19)}.${ext}`;
		response.ImagePath = path;

		let compressedImage = await this.imageService.compressImage(this.file);

		try {
			const storageRef = ref(this.storage, path);
			let uploadTask: UploadTask = uploadBytesResumable(storageRef, compressedImage);
			uploadTask.on('state_changed',
				(snapshot) => {
					this.fileUploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				},
				(error) => {
					console.error("Error uploading image. ", +error);
				},
				() => {
					this.uploadingFile = false;
				}
			);
			await uploadTask;
			response.ImageUrl = await getDownloadURL(storageRef);
			this.uploadingFile = false;
			this.dialogRef.close(response);
		} catch (e) {
			console.error(e);
			this.uploadingFile = false;
		}
	}
}

export interface UploadImageDialogData {
	FirebaseStorePath: string;
}

export class UploadImageDialogResponse {
	ImagePath: string;
	ImageUrl: string;
}
