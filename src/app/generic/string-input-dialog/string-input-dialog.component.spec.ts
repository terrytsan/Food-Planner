import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StringInputDialogComponent } from './string-input-dialog.component';

describe('StringInputDialogComponent', () => {
	let component: StringInputDialogComponent;
	let fixture: ComponentFixture<StringInputDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [StringInputDialogComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StringInputDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
