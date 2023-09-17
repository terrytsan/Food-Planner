import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from "rxjs";
import { Food } from "../food-card/food";
import { MatDialog } from "@angular/material/dialog";
import { FoodEditDialogComponent } from "../food-edit-dialog/food-edit-dialog.component";
import { first, map, startWith, switchMap, takeUntil } from "rxjs/operators";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material/chips";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { AuthService, FoodPlannerUser } from "../services/auth.service";
import { FoodService } from "../services/food.service";
import { Router } from "@angular/router";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
	selector: 'app-foods',
	templateUrl: './foods.component.html',
	styleUrls: ['./foods.component.scss'],
	animations: [
		trigger('searchButtonAnimation', [
			transition(':enter', [
				style({ opacity: 0, transform: 'translateX(50px)' }),
				animate('250ms ease-in-out', style({ opacity: 1, transform: 'translateX(0px)' }))
			]),
			transition(':leave', [
				style({ opacity: 1, transform: 'translateX(0)' }),
				animate('250ms ease-in-out', style({ opacity: 0, transform: 'translateX(50px)' }))
			])
		]),
		trigger('searchBoxAnimation', [
			transition(':enter', [
				style({ opacity: 0, width: 0 }),
				animate('300ms ease-in-out', style({ opacity: 1, width: '*' }))
			]),
			transition(':leave', [
				style({ opacity: 1, width: '*' }),
				animate('200ms ease-in-out', style({ opacity: 0, width: 0 }))
			])
		])
	]
})
export class FoodsComponent implements OnInit {

	user$: Observable<FoodPlannerUser | null>;
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

	// Food search box
	@ViewChild('searchBox') searchBox: ElementRef<HTMLInputElement>;
	isSearchBoxVisible: boolean = false;
	private _foodSearchInput$ = new BehaviorSubject<string>('');

	get lblFilterOp(): Operator {
		return this._lblFilterOp;
	}

	set lblFilterOp(value: Operator) {
		this._lblFilterOp = value;
		this._lblFilterOp$.next(this._lblFilterOp);
	}

	ngUnsubscribe = new Subject<void>();					// Used for unsubscribing from observables

	constructor(
		private dialog: MatDialog,
		private authService: AuthService,
		private foodService: FoodService,
		private router: Router
	) {
		this.user$ = authService.getExtendedUser().pipe(takeUntil(this.ngUnsubscribe));

		this.foods$ = this.user$.pipe(switchMap(user => {
				if (user != null) {
					if (user.selectedGroup) {
						return foodService.getFoodsByGroupOrderByName(user.selectedGroup.id);
					}
				}
				return of([] as Food[]);
			}),
			takeUntil(this.ngUnsubscribe));

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
			this._lblFilterOp$.pipe(startWith(Operator.OR), takeUntil(this.ngUnsubscribe)),
			this._foodSearchInput$.pipe(startWith(''), takeUntil(this.ngUnsubscribe))
		]).pipe(map(([foods, filterLabels, filterOp, foodSearch]) => {
				filterLabels = filterLabels.map(label => label.toLowerCase());
				let filtered: Food[] = foods;

				// Filter by label
				if (filterLabels.length > 0 && foods) {
					filtered = foods.filter(food => {
						if (!food.labels) {
							return false;
						}

						switch (filterOp) {
							case Operator.OR:
								return food.labels.some(l => filterLabels.includes(l.toLowerCase()));
							case Operator.AND:
								food.labels = food.labels.map(l => l.toLowerCase());
								return filterLabels.every(l => food.labels.includes(l));
						}
					});
				}

				// Filter by search input
				const foodSearchPopulated = !!foodSearch.trim();
				if (foodSearchPopulated) {
					filtered = filtered.filter(food => {
						return food.name.toLowerCase().includes(foodSearch.toLowerCase());
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
		let dialogRef = this.dialog.open(FoodEditDialogComponent, {
			maxWidth: '600px',
			width: '80%',
			data: { AllLabels: this.allLabels }
		});

		dialogRef.afterClosed().subscribe(newFoodId => {
			this.router.navigateByUrl(`/foods/${newFoodId}`);
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

	// Food search box
	showSearchBox() {
		this.isSearchBoxVisible = true;
	}

	/**
	 * Update search observable everytime text is entered
	 * @param $event KeyboardEvent
	 */
	onSearchBoxKeyUp($event: KeyboardEvent) {
		const value = ((<HTMLInputElement>$event.target).value || '').trim();
		this._foodSearchInput$.next(value);
	}

	clearSearchBox() {
		this.searchBox.nativeElement.value = '';
		this._foodSearchInput$.next('');
	}

	/**
	 * Clicking out of the search box when it is blank will hide the search box and reveal the search button
	 * @param $event FocusEvent
	 */
	unFocusSearchBox($event: FocusEvent) {
		const value = (<HTMLInputElement>$event.target).value || '';
		if (value == '') {
			this.isSearchBoxVisible = false;
		}
	}

	// End Food search box
}

enum Operator {
	OR,
	AND
}
