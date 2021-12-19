import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogueItemComponent } from './catalogue-item.component';

describe('CatalogueItemComponent', () => {
	let component: CatalogueItemComponent;
	let fixture: ComponentFixture<CatalogueItemComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CatalogueItemComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CatalogueItemComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
