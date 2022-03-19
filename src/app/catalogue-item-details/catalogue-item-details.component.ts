import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import {
	addDoc,
	collection,
	collectionData,
	CollectionReference,
	deleteDoc,
	doc,
	Firestore,
	onSnapshot,
	orderBy,
	query,
	updateDoc,
	where,
	writeBatch
} from "@angular/fire/firestore";
import { CatalogueItem } from "../catalogue-item/catalogueItem";
import { Timestamp } from "firebase/firestore";
import { MatDialog } from "@angular/material/dialog";
import { UploadImageDialogComponent } from "../upload-image-dialog/upload-image-dialog.component";
import { GlobalVariable } from "../global";
import { PriceHistory } from "../catalogue-item/priceHistory";
import { Observable, of } from "rxjs";
import { PriceHistoryEditDialogComponent } from "../price-history-edit-dialog/price-history-edit-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService, SimpleUser } from "../auth.service";
import { switchMap, take } from "rxjs/operators";
import { ScrollService } from "../scroll.service";

@Component({
	selector: 'app-catalogue-item-details',
	templateUrl: './catalogue-item-details.component.html',
	styleUrls: ['./catalogue-item-details.component.css']
})
export class CatalogueItemDetailsComponent implements OnInit {

	user: SimpleUser | null;

	// Catalogue Item
	_id: string = '';
	isEditing: boolean = false;
	isAdding: boolean = false;
	defaultImage: string = GlobalVariable.PLACEHOLDER_IMAGE_URL;
	catalogueItem: CatalogueItem;

	// Price History
	priceHistory$: Observable<PriceHistory[]>;
	isAddingPriceHistory: boolean = false;
	newPriceHistory: PriceHistory = {
		id: '',
		price: undefined,
		store: '',
		group: ''
	};
	newPriceHistoryDate: Date = new Date();
	displayedColumns: string[] = ["date", "price", "store"];

	@ViewChild('addPriceHistoryForm') set addPriceHistoryForm(element: ElementRef) {
		if (element) {
			// Scroll to bottom when this element is rendered
			this.scrollService.scrollToBottom();
		}
	}

	get id(): string {
		return this._id;
	}

	set id(newID: string) {
		this.priceHistory$ = this.authService.getSimpleUser().pipe(
			switchMap(user => {
				if (user == null) {
					return of([] as PriceHistory[]);
				}
				return collectionData<PriceHistory>(
					query<PriceHistory>(
						collection(this.afs, "catalogueItems", newID, "priceHistory") as CollectionReference<PriceHistory>,
						where('group', '==', user.selectedGroup),
						orderBy("date", "desc")
					), {idField: "id"});
			})
		);
		this._id = newID;
	}

	constructor(
		private route: ActivatedRoute,
		private afs: Firestore,
		private router: Router,
		private dialog: MatDialog,
		private _snackBar: MatSnackBar,
		private authService: AuthService,
		private scrollService: ScrollService
	) {
		authService.getSimpleUser().pipe(take(1)).subscribe(user => {
			if (user && user.canEdit) {
				this.displayedColumns.push('actions');
			}
			return this.user = user;
		});

		this.id = this.route.snapshot.params['id'];

		if (this.id === "new") {
			this.catalogueItem = <CatalogueItem>{
				name: '',
				description: '',
				imageUrl: '',
				imagePath: '',
				status: 'neutral'
			};
			this.isAdding = this.isEditing = true;
		} else {
			onSnapshot(doc(this.afs, "catalogueItems", this.id), (doc) => {
				this.catalogueItem = doc.data() as CatalogueItem;
			});
		}
	}

	ngOnInit(): void {
	}

	toggleEditing() {
		if (this.isAdding) {
			this.addCatalogueItem();
			this.isAdding = false;
		} else if (this.isEditing) {
			this.updateCatalogueItem();
		}
		this.isEditing = !this.isEditing;
	}

	async updateCatalogueItem() {
		const catalogueItemRef = doc(this.afs, 'catalogueItems', this.id);

		await updateDoc(catalogueItemRef, {
			name: this.catalogueItem.name,
			description: this.catalogueItem.description,
			imageUrl: this.catalogueItem.imageUrl,
			imagePath: this.catalogueItem.imagePath
		});
	}

	openUploadImageDialog() {
		const dialogRef = this.dialog.open(UploadImageDialogComponent, {
			width: '300px',
			data: {
				FirebaseStorePath: 'catalogueItemImages/'
			}
		});

		dialogRef.afterClosed().subscribe(uploadedImage => {
			if (uploadedImage) {
				this.catalogueItem.imageUrl = uploadedImage.ImageUrl;
				this.catalogueItem.imagePath = uploadedImage.ImagePath;
			}
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
		// Delete price history first
		this.priceHistory$.subscribe(async priceHistory => {
			const batch = writeBatch(this.afs);
			priceHistory.forEach(pH => {
				let pHRef = doc(this.afs, 'catalogueItems', this.id, 'priceHistory', pH.id);
				batch.delete(pHRef);
			});
			await batch.commit();
		});

		const catalogueItemRef = doc(this.afs, 'catalogueItems', this.id);
		await deleteDoc(catalogueItemRef);
		await this.router.navigate(['/foodCatalogue']);
	}

	async addCatalogueItem() {
		if (this.user == null) {
			return;
		}
		let newDocRef = await addDoc(collection(this.afs, 'catalogueItems'), {
			name: this.catalogueItem.name,
			description: this.catalogueItem.description,
			imageUrl: this.catalogueItem.imageUrl,
			imagePath: this.catalogueItem.imagePath,
			dateAdded: Timestamp.fromDate(new Date()),
			group: this.user.selectedGroup
		});
		this.id = newDocRef.id;
	}

	// Price History

	toggleNewPriceHistoryForm() {
		this.isAddingPriceHistory = !this.isAddingPriceHistory;
		this.resetNewPriceHistoryForm();
	}

	resetNewPriceHistoryForm() {
		this.newPriceHistory.price = undefined;
		this.newPriceHistory.store = '';
		this.newPriceHistoryDate = new Date();
	}

	async createPriceHistory() {
		if (this.user == null) {
			return;
		}
		await addDoc(collection(this.afs, 'catalogueItems', this.id, 'priceHistory'), {
			date: Timestamp.fromDate(this.newPriceHistoryDate),
			price: this.newPriceHistory.price,
			store: this.newPriceHistory.store,
			group: this.user.selectedGroup
		});
		this.isAddingPriceHistory = false;
		this.resetNewPriceHistoryForm();
	}

	openEditPriceHistoryDialog(priceHistory: PriceHistory) {
		this.dialog.open(PriceHistoryEditDialogComponent, {
			width: '300px',
			data: {
				CatalogueItemId: this.id,
				PriceHistory: priceHistory
			}
		});
	}

	async deletePriceHistory(history: PriceHistory) {
		let priceHistoryRef = doc(this.afs, 'catalogueItems', this.id, 'priceHistory', history.id);
		await deleteDoc(priceHistoryRef);

		let snackBarRef = this._snackBar.open(`Deleted ${(history.date?.toDate().toLocaleDateString())}.`, 'Undo', {duration: 3000});
		snackBarRef.onAction().subscribe(async () => {
			await addDoc(collection(this.afs, 'catalogueItems', this.id, 'priceHistory'), {
				date: history.date,
				price: history.price,
				store: history.store,
				group: history.group
			});
		});
	}

	// Allows mat-table elements to have the correct type
	assertItemType(element: PriceHistory): PriceHistory {
		return element;
	}
}
