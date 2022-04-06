import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
	styleUrls: ['./food-labels-input.component.css']
})
export class FoodLabelsInputComponent implements OnInit {

	readonly separatorKeysCodes = [ENTER, COMMA] as const;

	@Input() labels: string[] = [];
	@Output() labelsChange = new EventEmitter<string[]>();
	@Input() labelSuggestions: string[] = [];
	@Input() addOnBlur: boolean = false;		// Clicking out of input triggers add
	@Input() appearance: MatFormFieldAppearance = 'fill';

	labelCtrl = new FormControl();
	filteredLabelSuggestions: Observable<string[]>;

	@ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;

	constructor() {
		this.filteredLabelSuggestions = this.labelCtrl.valueChanges.pipe(
			startWith(null),
			map((label: string | null) => {
				return label ? this.filter(label) : this.labelSuggestions.slice();
			})
		);
	}

	ngOnInit(): void {
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
	}

	selected($event: MatAutocompleteSelectedEvent) {
		this.labels.push($event.option.viewValue);
		this.labelInput.nativeElement.value = '';
		this.labelCtrl.setValue(null);
	}

	private filter(value: string): string[] {
		const filterValue = value.toLowerCase();
		return this.labelSuggestions.filter(label => label.toLowerCase().includes(filterValue));
	}
}
