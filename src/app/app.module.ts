import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectStorageEmulator, getStorage, provideStorage } from "@angular/fire/storage";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { WeekPlanComponent } from './week-plan/week-plan.component';
import { DayPlanComponent } from './day-plan/day-plan.component';
import { MatCardModule } from "@angular/material/card";
import { FoodsComponent } from './foods/foods.component';
import { FoodCardComponent } from './food-card/food-card.component';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { FoodEditDialogComponent } from './food-edit-dialog/food-edit-dialog.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatMenuModule } from "@angular/material/menu";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { FoodPlanDetailComponent } from './food-plan-detail/food-plan-detail.component';
import { ChooseFoodDialogComponent } from './choose-food-dialog/choose-food-dialog.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MatGridListModule } from "@angular/material/grid-list";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FoodCatalogueComponent } from './food-catalogue/food-catalogue.component';
import { CatalogueItemComponent } from './catalogue-item/catalogue-item.component';
import { CatalogueItemDetailsComponent } from './catalogue-item-details/catalogue-item-details.component';
import { UploadImageDialogComponent } from './upload-image-dialog/upload-image-dialog.component';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { PriceHistoryEditDialogComponent } from './price-history-edit-dialog/price-history-edit-dialog.component';
import { MatTableModule } from "@angular/material/table";
import { FoodDetailsComponent } from './food-details/food-details.component';
import { MatChipsModule } from "@angular/material/chips";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatRadioModule } from "@angular/material/radio";
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { SignupComponent } from './signup/signup.component';
import { MatExpansionModule } from "@angular/material/expansion";

@NgModule({
	declarations: [
		AppComponent,
		WeekPlanComponent,
		DayPlanComponent,
		FoodsComponent,
		FoodCardComponent,
		FoodEditDialogComponent,
		FoodPlanDetailComponent,
		ChooseFoodDialogComponent,
		FoodCatalogueComponent,
		CatalogueItemComponent,
		CatalogueItemDetailsComponent,
		UploadImageDialogComponent,
		PriceHistoryEditDialogComponent,
		FoodDetailsComponent,
		LoginComponent,
		ProfileComponent,
		SignupComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		provideFirebaseApp(() => initializeApp(environment.firebase)),
		provideAuth(() => {
			if (environment.useEmulators) {
				const auth = getAuth();
				connectAuthEmulator(auth, "http://localhost:9099");
				return auth;
			}
			return getAuth();
		}),
		provideFirestore(() => {
			if (environment.useEmulators) {
				const firestore = getFirestore();
				connectFirestoreEmulator(firestore, 'localhost', 8080);
				return firestore;
			}
			return getFirestore();
		}),
		provideStorage(() => {
			if (environment.useEmulators) {
				const storage = getStorage();
				connectStorageEmulator(storage, "localhost", 9199);
				return storage;
			}
			return getStorage();
		}),
		MatToolbarModule,
		MatIconModule,
		MatCardModule,
		MatSidenavModule,
		MatButtonModule,
		MatListModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatProgressBarModule,
		FormsModule,
		ReactiveFormsModule,
		MatMenuModule,
		MatSnackBarModule,
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production,
			// Register the ServiceWorker as soon as the app is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerWhenStable:30000'
		}),
		MatGridListModule,
		FlexLayoutModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatTableModule,
		MatChipsModule,
		MatAutocompleteModule,
		MatRadioModule,
		MatExpansionModule
	],
	providers: [
		{provide: MAT_DATE_LOCALE, useValue: 'en-GB'}
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
