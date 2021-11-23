import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from "@angular/fire/storage";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { WeekPlanComponent } from './week-plan/week-plan.component';
import { DayPlanComponent } from './day-plan/day-plan.component';
import { MatCardModule } from "@angular/material/card";
import { FoodsComponent } from './foods/foods.component';
import { FoodDetailComponent } from './food-detail/food-detail.component';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { FoodEditDialogComponent } from './food-edit-dialog/food-edit-dialog.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularFireModule } from "@angular/fire/compat";
import { MatMenuModule } from "@angular/material/menu";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { FoodPlanDetailComponent } from './food-plan-detail/food-plan-detail.component';
import { ChooseFoodDialogComponent } from './choose-food-dialog/choose-food-dialog.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MatGridListModule } from "@angular/material/grid-list";

@NgModule({
	declarations: [
		AppComponent,
		WeekPlanComponent,
		DayPlanComponent,
		FoodsComponent,
		FoodDetailComponent,
		FoodEditDialogComponent,
		FoodPlanDetailComponent,
		ChooseFoodDialogComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		provideFirebaseApp(() => initializeApp(environment.firebase)),
		provideAuth(() => getAuth()),
		provideFirestore(() => getFirestore()),
		provideStorage(() => getStorage()),
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
		AngularFireModule.initializeApp(environment.firebase),
		ReactiveFormsModule,
		MatMenuModule,
		MatSnackBarModule,
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production,
			// Register the ServiceWorker as soon as the app is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerWhenStable:30000'
		}),
		MatGridListModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {
}
