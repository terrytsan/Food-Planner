import { TestBed } from '@angular/core/testing';

import { FoodPlanService } from './food-plan.service';

describe('FoodPlanService', () => {
	let service: FoodPlanService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(FoodPlanService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
