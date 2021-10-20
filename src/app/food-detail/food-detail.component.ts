import { Component, Input, OnInit } from '@angular/core';
import { Food } from "./food";

@Component({
	selector: 'app-food-detail',
	templateUrl: './food-detail.component.html',
	styleUrls: ['./food-detail.component.css']
})
export class FoodDetailComponent implements OnInit {

	@Input() food: Food | null = null;

	constructor() {
	}

	ngOnInit(): void {
	}

}
