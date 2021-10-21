import { Component, Input, OnInit } from '@angular/core';
import { Food } from "./food";

@Component({
	selector: 'app-food-detail',
	templateUrl: './food-detail.component.html',
	styleUrls: ['./food-detail.component.css']
})
export class FoodDetailComponent implements OnInit {

	@Input() food: Food | null = null;
	defaultImage: string = "https://firebasestorage.googleapis.com/v0/b/food-planner-52896.appspot.com/o/placeholder.jpg?alt=media&token=c34989f3-08b0-45e0-aac3-2513e948e8e6";

	constructor() {
	}

	ngOnInit(): void {
	}

}
