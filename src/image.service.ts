import { Injectable } from '@angular/core';
import { NgxImageCompressService } from "ngx-image-compress";
import { BufferShim } from "buffer-esm";

@Injectable({
	providedIn: 'root'
})
export class ImageService {

	constructor(private imageCompress: NgxImageCompressService) {
	}

	// Compress image. Pass in image File, return compressed image File. Can call with await to synchronously receive file.
	compressImage(file: File): Promise<File> {
		const reader = new FileReader();

		return new Promise((resolve, reject) => {
			reader.onload = async (event: any) => {
				let result = await this.imageCompress.compressFile(event.target.result, -1, 50, 50);
				let compressedFile = this.dataUrlToFile(result, file.name);

				if (compressedFile) {
					resolve(compressedFile);
				} else {
					reject("Failed to convert dataUrl to File.");
				}
			};
			reader.readAsDataURL(file);
		});
	}

	dataUrlToFile(dataUrl: string, filename: string): File | undefined {
		const arr = dataUrl.split(',');
		if (arr.length < 2) {
			return undefined;
		}
		const mimeArr = arr[0].match(/:(.*?);/);
		if (!mimeArr || mimeArr.length < 2) {
			return undefined;
		}
		const mime = mimeArr[1];
		const buff = BufferShim.from(arr[1], 'base64');
		return new File([buff], filename, {type: mime});
	}
}
