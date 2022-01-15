import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from "@angular/material/sidenav";
import { MediaObserver } from "@angular/flex-layout";
import { Subscription } from "rxjs";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";
import { Location } from "@angular/common";

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
	showBackBtn = false;
	private mediaSubscription: Subscription;
	private routerSubscription: Subscription;

	constructor(private media: MediaObserver, private router: Router, private location: Location) {
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

		this.routerSubscription = this.router.events.pipe(
			filter((event): event is NavigationEnd => event instanceof NavigationEnd)
		).subscribe((event: NavigationEnd) => {
			this.showBackBtn = event.urlAfterRedirects.startsWith('/catalogueItem') || event.urlAfterRedirects.startsWith('/foods/');
		});
	}

	navigateBack() {
		this.location.back();
	}

	ngOnDestroy(): void {
		this.mediaSubscription.unsubscribe();
		this.routerSubscription.unsubscribe();
	}
}
