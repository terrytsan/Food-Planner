import { Component, Input, OnInit } from '@angular/core';
import { CatalogueItem } from "./catalogueItem";
import { GlobalVariable } from "../global";
import { PriceHistory } from "./priceHistory";
import { SimpleUser } from "../services/auth.service";
import { CatalogueItemService } from "../services/catalogue-item.service";

@Component({
	selector: 'app-catalogue-item',
	templateUrl: './catalogue-item.component.html',
	styleUrls: ['./catalogue-item.component.css']
})
export class CatalogueItemComponent implements OnInit {

	@Input() catalogueItem: CatalogueItem;
	@Input() lowestPrice: PriceHistory;
	@Input() user: SimpleUser;
	defaultImage = GlobalVariable.PLACEHOLDER_IMAGE_URL;

	constructor(private catalogueItemService: CatalogueItemService) {
	}

	ngOnInit(): void {
	}

	async toggleLikeCatalogueItem() {
		const newStatus = this.catalogueItem.status == "liked" ? "neutral" : "liked";
		await this.catalogueItemService.updateCatalogueItemStatus(this.catalogueItem.id, newStatus);
	}

	async toggleDislikeCatalogueItem() {
		const newStatus = this.catalogueItem.status == "disliked" ? "neutral" : "disliked";
		await this.catalogueItemService.updateCatalogueItemStatus(this.catalogueItem.id, newStatus);
	}
}
