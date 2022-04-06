import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodLabelsInputComponent } from './food-labels-input.component';

describe('FoodLabelsInputComponent', () => {
	let component: FoodLabelsInputComponent;
	let fixture: ComponentFixture<FoodLabelsInputComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [FoodLabelsInputComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FoodLabelsInputComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
