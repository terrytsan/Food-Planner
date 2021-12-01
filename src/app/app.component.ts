import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from "@angular/material/sidenav";
import { MediaObserver } from "@angular/flex-layout";
import { Subscription } from "rxjs";

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'FoodPlanner';

	@ViewChild(MatSidenav)
	sidenav!: MatSidenav;

	mobileDisplay = this.media.isActive('xs');
	private mediaSubscription: Subscription;

	constructor(private media: MediaObserver) {
		this.mediaSubscription = this.media.asObservable().subscribe(() => {
			// Triggered when display size changes
			if (this.media.isActive('xs')) {
				this.sidenav.mode = 'over';
				this.mobileDisplay = true;
			} else {
				this.sidenav.mode = 'side';
				this.mobileDisplay = false;
			}
		});
	}

	ngOnDestroy(): void {
		this.mediaSubscription.unsubscribe();
	}
}
