import { Component, Input, OnInit } from '@angular/core';
import { CatalogueItem } from "./catalogueItem";
import { doc, Firestore, updateDoc } from "@angular/fire/firestore";

@Component({
	selector: 'app-catalogue-item',
	templateUrl: './catalogue-item.component.html',
	styleUrls: ['./catalogue-item.component.css']
})
export class CatalogueItemComponent implements OnInit {

	@Input() catalogueItem: CatalogueItem;

	constructor(public afs: Firestore) {
	}

	ngOnInit(): void {
	}

	async toggleLikeCatalogueItem() {
		const catalogueItemRef = doc(this.afs, 'catalogueItems', this.catalogueItem.id);
		const newStatus = this.catalogueItem.status == "liked" ? "neutral" : "liked";
		await updateDoc(catalogueItemRef, {
			status: newStatus
		});
	}

	async toggleDislikeCatalogueItem() {
		const catalogueItemRef = doc(this.afs, 'catalogueItems', this.catalogueItem.id);
		const newStatus = this.catalogueItem.status == "disliked" ? "neutral" : "disliked";
		await updateDoc(catalogueItemRef, {
			status: newStatus
		});
	}
}
