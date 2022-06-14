import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodPlanPreviewComponent } from './food-plan-preview.component';

describe('FoodPlanDetailComponent', () => {
	let component: FoodPlanPreviewComponent;
	let fixture: ComponentFixture<FoodPlanPreviewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [FoodPlanPreviewComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FoodPlanPreviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
