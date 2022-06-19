import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodPlanDetailsComponent } from './food-plan-details.component';

describe('FoodPlanDetailsComponent', () => {
	let component: FoodPlanDetailsComponent;
	let fixture: ComponentFixture<FoodPlanDetailsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [FoodPlanDetailsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(FoodPlanDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
