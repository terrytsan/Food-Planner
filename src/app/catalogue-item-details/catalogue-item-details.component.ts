import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { deleteDoc, doc, Firestore, onSnapshot, updateDoc } from "@angular/fire/firestore";
import { CatalogueItem } from "../catalogue-item/catalogueItem";

@Component({
	selector: 'app-catalogue-item-details',
	templateUrl: './catalogue-item-details.component.html',
	styleUrls: ['./catalogue-item-details.component.css']
})
export class CatalogueItemDetailsComponent implements OnInit {

	id: string;
	isEditing: boolean = false;
	defaultImage: string = "assets/images/placeholder.jpg";
	catalogueItem: CatalogueItem;

	constructor(private route: ActivatedRoute, private afs: Firestore, private router: Router) {
		this.id = this.route.snapshot.params['id'];

		onSnapshot(doc(this.afs, "catalogueItems", this.id), (doc) => {
			this.catalogueItem = doc.data() as CatalogueItem;
		});
	}

	ngOnInit(): void {
	}

	toggleEditing() {
		if (this.isEditing) {
			this.updateCatalogueItem();
		}
		this.isEditing = !this.isEditing;
	}

	async updateCatalogueItem() {
		const catalogueItemRef = doc(this.afs, 'catalogueItems', this.id);

		await updateDoc(catalogueItemRef, {
			name: this.catalogueItem.name,
			description: this.catalogueItem.description,
			storePurchased: this.catalogueItem.storePurchased,
			image: this.catalogueItem.image
		});
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

	async deleteCatalogueItem() {
		const catalogueItemRef = doc(this.afs, 'catalogueItems', this.id);
		await deleteDoc(catalogueItemRef);
		await this.router.navigate(['/foodCatalogue']);
	}
}
