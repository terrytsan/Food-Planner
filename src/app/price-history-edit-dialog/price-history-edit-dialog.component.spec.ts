import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceHistoryEditDialogComponent } from './price-history-edit-dialog.component';

describe('PriceHistoryEditDialogComponent', () => {
	let component: PriceHistoryEditDialogComponent;
	let fixture: ComponentFixture<PriceHistoryEditDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PriceHistoryEditDialogComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PriceHistoryEditDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
