import { Component, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavContent } from "@angular/material/sidenav";
import { MediaObserver } from "@angular/flex-layout";
import { Observable, Subscription } from "rxjs";
import { NavigationEnd, Router } from "@angular/router";
import { catchError, filter, take } from "rxjs/operators";
import { Location } from "@angular/common";
import { ScrollService } from "./services/scroll.service";
import { AuthService, SimpleUser } from "./services/auth.service";
import { UpdateService } from "./services/update.service";
import { GroupService } from "./groups/group.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'FoodPlanner';

	@ViewChild(MatSidenav)
	sidenav!: MatSidenav;

	@ViewChild('scrollingContainer')
	public scrollContainer: MatSidenavContent;

	mobileDisplay = this.media.isActive('xs');
	showBackBtn = false;
	loggedInUser$: Observable<SimpleUser | null>;
	private mediaSubscription: Subscription;
	private routerSubscription: Subscription;

	constructor(
		private media: MediaObserver,
		private router: Router,
		private location: Location,
		private scrollService: ScrollService,
		private authService: AuthService,
		private updateService: UpdateService,
		private groupService: GroupService,
		private _snackBar: MatSnackBar
	) {
		this.loggedInUser$ = authService.getSimpleUser();

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

		this.loggedInUser$.pipe(take(1)).subscribe(user => {
			if (user == null) {
				return;
			}
			this.groupService.getGroup(user.selectedGroup)
				.pipe(
					take(1),
					catchError(err => {
						throw err;
					})
				)
				.subscribe({
					error: err => {
						if (err.code == 'permission-denied') {
							console.error("Error loading user's selected group:", user.selectedGroup);
							let snackBarRef = _snackBar.open(`Error Loading Group`, 'Change Selected Group');
							snackBarRef.onAction().subscribe(async () => {
								this.router.navigate(['/profile']);
							});
						}
					}
				});
		});
	}

	ngAfterViewInit() {
		this.scrollService.setScrollingContainer(this.scrollContainer.getElementRef());
	}

	navigateBack() {
		this.location.back();
	}

	ngOnDestroy(): void {
		this.mediaSubscription.unsubscribe();
		this.routerSubscription.unsubscribe();
	}
}
