import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodPlanDetailComponent } from './food-plan-detail.component';

describe('FoodPlanDetailComponent', () => {
	let component: FoodPlanDetailComponent;
	let fixture: ComponentFixture<FoodPlanDetailComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [FoodPlanDetailComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FoodPlanDetailComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
