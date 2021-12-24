import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogueItemDetailsComponent } from './catalogue-item-details.component';

describe('CatalogueItemDetailsComponent', () => {
	let component: CatalogueItemDetailsComponent;
	let fixture: ComponentFixture<CatalogueItemDetailsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CatalogueItemDetailsComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CatalogueItemDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
