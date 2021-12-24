import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { doc, Firestore, onSnapshot, updateDoc } from "@angular/fire/firestore";
import { CatalogueItem } from "../catalogue-item/catalogueItem";

@Component({
	selector: 'app-catalogue-item-details',
	templateUrl: './catalogue-item-details.component.html',
	styleUrls: ['./catalogue-item-details.component.css']
})
export class CatalogueItemDetailsComponent implements OnInit {

	id: string;
	defaultImage: string = "assets/images/placeholder.jpg";
	catalogueItem: CatalogueItem;

	constructor(private route: ActivatedRoute, private afs: Firestore) {
		this.id = this.route.snapshot.params['id'];

		onSnapshot(doc(this.afs, "catalogueItems", this.id), (doc) => {
			this.catalogueItem = doc.data() as CatalogueItem;
		});
	}

	ngOnInit(): void {
	}

	async toggleLikeCatalogueItem() {
		const catalogueItemRef = doc(this.afs, 'catalogueItems', this.id);
		const newStatus = this.catalogueItem.status == "liked" ? "neutral" : "liked";
		await updateDoc(catalogueItemRef, {
			status: newStatus
		});
	}

	async toggleDislikeCatalogueItem() {
		const catalogueItemRef = doc(this.afs, 'catalogueItems', this.id);
		const newStatus = this.catalogueItem.status == "disliked" ? "neutral" : "disliked";
		await updateDoc(catalogueItemRef, {
			status: newStatus
		});
	}
}
