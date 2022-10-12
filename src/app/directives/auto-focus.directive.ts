import { Directive, ElementRef, OnInit } from '@angular/core';

/**
 * Focus the element when the host element appears on the DOM
 */
@Directive({
	selector: '[autoFocus]'
})
export class AutoFocusDirective implements OnInit {
	private inputElement: HTMLElement;

	constructor(private elementRef: ElementRef) {
		this.inputElement = this.elementRef.nativeElement;
	}

	ngOnInit(): void {
		this.inputElement.focus();
	}
}
