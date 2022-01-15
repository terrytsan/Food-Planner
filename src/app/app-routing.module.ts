import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeekPlanComponent } from "./week-plan/week-plan.component";
import { FoodsComponent } from "./foods/foods.component";
import { FoodCatalogueComponent } from "./food-catalogue/food-catalogue.component";
import { CatalogueItemDetailsComponent } from "./catalogue-item-details/catalogue-item-details.component";
import { FoodDetailsComponent } from "./food-details/food-details.component";

const routes: Routes = [
	{path: '', component: WeekPlanComponent},
	{path: 'foods', component: FoodsComponent},
	{path: 'foods/:id', component: FoodDetailsComponent},
	{path: 'foodCatalogue', component: FoodCatalogueComponent},
	{path: 'catalogueItem/:id', component: CatalogueItemDetailsComponent}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
