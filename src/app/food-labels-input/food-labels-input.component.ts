import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material/chips";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { Observable } from "rxjs";
import { FormControl } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { MatFormFieldAppearance } from "@angular/material/form-field";

@Component({
	selector: 'app-food-labels-input',
	templateUrl: './food-labels-input.component.html',
	styleUrls: ['./food-labels-input.component.scss']
})
export class FoodLabelsInputComponent {

	readonly separatorKeysCodes = [ENTER, COMMA] as const;

	@Input() labels: string[] = [];
	@Output() labelsChange = new EventEmitter<string[]>();
	@Input() labelSuggestions: string[] = [];
	@Input() addOnBlur: boolean = false;		// Clicking out of input triggers add
	@Input() appearance: MatFormFieldAppearance = 'fill';
	@Input() editable: boolean = true;

	labelCtrl = new FormControl();
	filteredLabelSuggestions: Observable<string[]>;

	@ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;

	constructor() {
		this.filteredLabelSuggestions = this.labelCtrl.valueChanges.pipe(
			startWith(null),
			map((label: string | null) => {
				return this.filter(label);
			})
		);
	}

	add($event: MatChipInputEvent) {
		const value = ($event.value || '').trim();

		if (value) {
			this.labels.push(value);
		}

		// Clear the input
		$event.chipInput!.clear();
		this.labelCtrl.setValue(null);
		this.labelsChange.emit(this.labels);
	}

	remove(label: string) {
		const index = this.labels.indexOf(label);

		if (index >= 0) {
			this.labels.splice(index, 1);
		}
		this.labelsChange.emit(this.labels);
		this.labelCtrl.setValue(null);
	}

	selected($event: MatAutocompleteSelectedEvent) {
		this.labels.push($event.option.viewValue);
		this.labelInput.nativeElement.value = '';
		this.labelCtrl.setValue(null);
	}

	/**
	 * Filter to only include labels which haven't already been selected (present in this.labels), then filter by search term
	 * @param value search term to filter labels
	 */
	private filter(value: string | null): string[] {
		let usedLabels = this.labels.map(l => l.toLowerCase());
		let unusedLabels = this.labelSuggestions.filter(label => !usedLabels.includes(label.toLowerCase()));

		if (value == null) {
			return unusedLabels;
		}

		const filterValue = value.toLowerCase();
		return unusedLabels.filter(label => label.toLowerCase().includes(filterValue));
	}
}
