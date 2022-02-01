import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService, FoodPlannerUser } from "../auth.service";
import { Observable } from "rxjs";

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	user$: Observable<FoodPlannerUser | null>;

	constructor(private authService: AuthService, private router: Router) {
		this.user$ = authService.getExtendedUser();
	}

	ngOnInit(): void {
	}

	signOut() {
		this.authService.signOut();
		this.router.navigate(['']);
	}
}
