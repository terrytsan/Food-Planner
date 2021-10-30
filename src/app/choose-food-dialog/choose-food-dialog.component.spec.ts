import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseFoodDialogComponent } from './choose-food-dialog.component';

describe('ChooseFoodDialogComponent', () => {
	let component: ChooseFoodDialogComponent;
	let fixture: ComponentFixture<ChooseFoodDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ChooseFoodDialogComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ChooseFoodDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
