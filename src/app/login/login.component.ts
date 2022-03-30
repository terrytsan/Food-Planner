import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "../auth.service";
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css'],
	animations: [
		trigger('flyIn', [
			state('in', style({transform: 'translateY(0)', opacity: 1})),
			transition('void => *', [
				style({transform: 'translateY(40%)', opacity: 0}),
				animate('250ms cubic-bezier(0.250, 0.460, 0.450, 0.940)')
			])
		])
	]
})
export class LoginComponent implements OnInit {

	email: string = '';
	password: string = '';
	loginError: string = '';

	constructor(private authService: AuthService, private router: Router) {
	}

	ngOnInit(): void {
	}

	onSubmit() {
		this.loginError = '';

		this.authService.signInWithEmailAndPassword(this.email, this.password)
			.then(() => this.router.navigate(['']))
			.catch((err) => {
				console.error(err);

				switch (err.code) {
					case "auth/user-not-found":
					case "auth/wrong-password":
						this.loginError = 'Email or password is incorrect.';
						break;
					default:
						this.loginError = 'An unexpected error has occurred.';
				}
			});
	}
}
