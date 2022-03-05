import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeekPlanComponent } from "./week-plan/week-plan.component";
import { FoodsComponent } from "./foods/foods.component";
import { FoodCatalogueComponent } from "./food-catalogue/food-catalogue.component";
import { CatalogueItemDetailsComponent } from "./catalogue-item-details/catalogue-item-details.component";
import { FoodDetailsComponent } from "./food-details/food-details.component";
import { LoginComponent } from "./login/login.component";
import { AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from "@angular/fire/auth-guard";
import { ProfileComponent } from "./profile/profile.component";
import { SignupComponent } from "./signup/signup.component";

let redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
let redirectLoggedInToHome = () => redirectLoggedInTo(['']);

const routes: Routes = [
	{
		path: '',
		component: WeekPlanComponent,
		canActivate: [AuthGuard],
		data: {authGuardPipe: redirectUnauthorizedToLogin}
	},
	{
		path: 'signup',
		component: SignupComponent,
		canActivate: [AuthGuard],
		data: {authGuardPipe: redirectLoggedInToHome}
	},
	{path: 'login', component: LoginComponent, canActivate: [AuthGuard], data: {authGuardPipe: redirectLoggedInToHome}},
	{
		path: 'profile',
		component: ProfileComponent,
		canActivate: [AuthGuard],
		data: {authGuardPipe: redirectUnauthorizedToLogin}
	},
	{
		path: 'foods',
		component: FoodsComponent,
		canActivate: [AuthGuard],
		data: {authGuardPipe: redirectUnauthorizedToLogin}
	},
	{
		path: 'foods/:id',
		component: FoodDetailsComponent,
		canActivate: [AuthGuard],
		data: {authGuardPipe: redirectUnauthorizedToLogin}
	},
	{
		path: 'foodCatalogue',
		component: FoodCatalogueComponent,
		canActivate: [AuthGuard],
		data: {authGuardPipe: redirectUnauthorizedToLogin}
	},
	{
		path: 'catalogueItem/:id',
		component: CatalogueItemDetailsComponent,
		canActivate: [AuthGuard],
		data: {authGuardPipe: redirectUnauthorizedToLogin}
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
