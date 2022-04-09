import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from "@angular/service-worker";
import { filter } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
	providedIn: 'root'
})
export class UpdateService {

	constructor(private swUpdate: SwUpdate, _snackBar: MatSnackBar) {
		swUpdate.versionUpdates
			.pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
			.subscribe(() => {
				let snackBarRef = _snackBar.open(`New Version Available`, 'Update');
				snackBarRef.onAction().subscribe(async () => {
					this.swUpdate.activateUpdate().then(() => {
						window.location.reload();
					});
				});
			});
	}
}
