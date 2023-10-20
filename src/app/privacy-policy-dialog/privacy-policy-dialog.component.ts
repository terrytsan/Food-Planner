import { Component } from '@angular/core';
import { Analytics, logEvent } from "@angular/fire/analytics";

@Component({
	selector: 'app-privacy-policy-dialog',
	templateUrl: './privacy-policy-dialog.component.html',
	styleUrls: ['./privacy-policy-dialog.component.scss']
})
export class PrivacyPolicyDialogComponent {

	constructor(private analytics: Analytics) {
		logEvent(this.analytics, "view_privacy_policy");
	}
}
