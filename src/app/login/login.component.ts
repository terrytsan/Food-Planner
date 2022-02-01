import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "../auth.service";

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
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
