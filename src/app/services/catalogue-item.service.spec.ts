import { TestBed } from '@angular/core/testing';

import { CatalogueItemService } from './catalogue-item.service';

describe('CatalogueItemService', () => {
	let service: CatalogueItemService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(CatalogueItemService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
