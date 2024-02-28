import { AfterContentInit, AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavContent } from "@angular/material/sidenav";
import { Observable, Subscription } from "rxjs";
import { NavigationEnd, Router } from "@angular/router";
import { catchError, filter, take } from "rxjs/operators";
import { Location } from "@angular/common";
import { ScrollService } from "./services/scroll.service";
import { AuthService, SimpleUser } from "./services/auth.service";
import { GroupService } from "./groups/group.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BreakpointObserver } from "@angular/cdk/layout";

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, AfterContentInit, OnDestroy {
	title = 'FoodPlanner';

	@ViewChild(MatSidenav, { static: true })
	sidenav!: MatSidenav;

	@ViewChild('menuBtn', { static: false, read: ElementRef })
	menuBtn: ElementRef;

	@ViewChild('scrollingContainer')
	public scrollContainer: MatSidenavContent;

	mobileDisplay: boolean = false;
	// urls where back button is shown
	backButtonUrls = ['/catalogueItem/', '/foods/', '/profile', '/foodPlans/'];
	showBackBtn = false;
	loggedInUser$: Observable<SimpleUser | null>;
	private breakpointSubscription: Subscription;
	private routerSubscription: Subscription;

	constructor(
		private router: Router,
		private location: Location,
		private scrollService: ScrollService,
		private authService: AuthService,
		private groupService: GroupService,
		private _snackBar: MatSnackBar,
		private breakpointObserver: BreakpointObserver
	) {
		this.loggedInUser$ = authService.getSimpleUser();

		this.routerSubscription = this.router.events.pipe(
			filter((event): event is NavigationEnd => event instanceof NavigationEnd)
		).subscribe((event: NavigationEnd) => {
			this.showBackBtn = this.backButtonUrls.some(url => event.urlAfterRedirects.startsWith(url));
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

	ngAfterContentInit(): void {
		this.breakpointSubscription = this.breakpointObserver.observe(`(max-width: 600px)`).subscribe(result => {
			if (result.matches) {
				this.sidenav.mode = 'over';
				this.mobileDisplay = true;
			} else {
				this.sidenav.mode = 'side';
				this.mobileDisplay = false;
			}
		});

		this.sidenav.closedStart.subscribe(() => {
			this.menuBtn.nativeElement.blur();
		});
	}

	ngAfterViewInit() {
		this.scrollService.setScrollingContainer(this.scrollContainer.getElementRef());
	}

	navigateBack() {
		this.location.back();
	}

	ngOnDestroy(): void {
		this.breakpointSubscription.unsubscribe();
		this.routerSubscription.unsubscribe();
	}
}
