import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { collection, collectionData, CollectionReference, Firestore, orderBy, query } from "@angular/fire/firestore";
import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import { Food } from "../food-card/food";
import { MatDialog } from "@angular/material/dialog";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { first, map, startWith, takeUntil } from "rxjs/operators";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material/chips";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

@Component({
	selector: 'app-foods',
	templateUrl: './foods.component.html',
	styleUrls: ['./foods.component.css']
})
export class FoodsComponent implements OnInit {

	foods$: Observable<Food[]>;
	filteredFoods$: Observable<Food[]>;

	// Filter Labels box
	@ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;
	labelCtrl = new FormControl();
	separatorKeysCodes: number[] = [ENTER, COMMA];
	allLabels$: Observable<string[]>;				// All the labels - derived from foods$
	allLabels: string[] = [];						// Normal form of all labels
	selectedLabels$ = new BehaviorSubject<string[]>([]);		// Subject that will be updated as labels are selected. Need observable so it can be combined with firebase observable and filtered
	selectedLabels: string[] = [];					// Normal form of selected labels
	unusedLabels: string[];							// Autocomplete for input box. Shows only the labels that haven't been selected and input box can filter these.
	private _lblFilterOp: Operator = Operator.OR;
	private _lblFilterOp$ = new BehaviorSubject<Operator>(this._lblFilterOp);	// Allows food filtering when changing operator

	get lblFilterOp(): Operator {
		return this._lblFilterOp;
	}

	set lblFilterOp(value: Operator) {
		this._lblFilterOp = value;
		this._lblFilterOp$.next(this._lblFilterOp);
	}

	ngUnsubscribe = new Subject();					// Used for unsubscribing from observables

	constructor(firestore: Firestore, public dialog: MatDialog) {
		this.foods$ = collectionData<Food>(
			query<Food>(
				collection(firestore, 'foods') as CollectionReference<Food>,
				orderBy('name')
			), {idField: 'id'}
		);

		// Get list of all possible labels
		this.allLabels$ = this.foods$.pipe(map((foods: Food[]) => {
				let allLabels: string[][] = foods.map((food: Food) => {
					return food.labels;
				});

				let flattened: string[] = ([] as string[]).concat(...allLabels);
				let uniqueLabels = [...new Set(flattened)];
				return uniqueLabels.filter(label => !!label);
			}),
			takeUntil(this.ngUnsubscribe));

		this.allLabels$.subscribe(labels => {
			this.allLabels = labels;
		});

		// Initial set-up of autofill
		this.allLabels$.pipe(first()).subscribe(labels => {
			this.unusedLabels = labels.sort();
		});

		/**
		 * Label input box autocomplete options
		 * 1. Remove from unusedLabels if already selected
		 * 2. Filter unused labels if input box changes (typing)
		 */
		combineLatest([
			this.labelCtrl.valueChanges.pipe(startWith(null), takeUntil(this.ngUnsubscribe)),
			this.selectedLabels$.pipe(startWith(<string[]>[]), takeUntil(this.ngUnsubscribe))
		]).subscribe(([filterValue, selectedLabels]) => {
			selectedLabels = selectedLabels.map(label => label.toLowerCase());

			// Remove already selected labels
			let notSelected = this.allLabels.filter(label => !selectedLabels.includes(label.toLowerCase()));

			// Filter using input box value
			if (filterValue) {
				this.unusedLabels = notSelected.filter(label => label.toLowerCase().includes(filterValue.toLowerCase()));
			} else {
				this.unusedLabels = notSelected;
			}

			this.unusedLabels.sort();
		});

		/**
		 * Food Filtering
		 * Want to emit all foods if no selected labels, or filter foods containing at least one of the selected labels
		 */
		this.filteredFoods$ = combineLatest([
			// startWith required as combineLatest requires both sources to emit before emitting itself
			this.foods$.pipe(startWith(<Food[]>[]), takeUntil(this.ngUnsubscribe)),
			this.selectedLabels$.pipe(startWith(<string[]>[]), takeUntil(this.ngUnsubscribe)),
			this._lblFilterOp$.pipe(startWith(Operator.OR))
		]).pipe(map(([foods, filterLabels]) => {
				filterLabels = filterLabels.map(label => label.toLowerCase());
				let filtered = <Food[]>[];
				if (!filterLabels || filterLabels.length == 0) {
					return foods;
				} else if (filterLabels && foods) {
					filtered = foods.filter(food => {
						if (!food.labels) {
							return false;
						}

						switch (this._lblFilterOp) {
							case Operator.OR:
								return food.labels.some(l => filterLabels.includes(l.toLowerCase()));
							case Operator.AND:
								food.labels = food.labels.map(l => l.toLowerCase());
								return filterLabels.every(l => food.labels.includes(l));
						}
					});
				}
				return filtered;
			}),
			takeUntil(this.ngUnsubscribe));
	}

	ngOnInit(): void {
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	openAddFoodDialog() {
		this.dialog.open(FoodEditDialogComponent, {
			width: '298px'
		});
	}

	removeLabel(label: string) {
		const index = this.selectedLabels.indexOf(label);

		if (index >= 0) {
			this.selectedLabels.splice(index, 1);
			this.selectedLabels$.next(this.selectedLabels);
		}
	}

	addLabel($event: MatChipInputEvent) {
		const value = ($event.value || '').trim();

		if (value) {
			this.selectedLabels.push(value);
			this.selectedLabels$.next(this.selectedLabels);	// Update subject
		}

		// Clear the input value
		$event.chipInput!.clear();

		this.labelCtrl.setValue(null);
	}

	autocompleteItemSelected($event: MatAutocompleteSelectedEvent) {
		let value = $event.option.viewValue;
		this.selectedLabels.push(value);
		this.selectedLabels$.next(this.selectedLabels);
		this.labelInput.nativeElement.value = '';
		this.labelCtrl.setValue(null);
	}
}

enum Operator {
	OR,
	AND
}
