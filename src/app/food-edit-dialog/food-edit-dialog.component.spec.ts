import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodEditDialogComponent } from './food-edit-dialog.component';

describe('FoodEditDialogComponent', () => {
	let component: FoodEditDialogComponent;
	let fixture: ComponentFixture<FoodEditDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [FoodEditDialogComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FoodEditDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
