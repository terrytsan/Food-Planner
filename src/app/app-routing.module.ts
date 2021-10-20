import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeekPlanComponent } from "./week-plan/week-plan.component";
import { FoodsComponent } from "./foods/foods.component";

const routes: Routes = [
	{path: '', component: WeekPlanComponent},
	{path: 'foods', component: FoodsComponent}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
