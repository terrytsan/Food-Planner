import { ElementRef, Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ScrollService {
	private scrollingContainer: ElementRef;

	/**
	 * Scrolling is handled by mat-sidenav-content. This allows programmatic scrolling from child components.
	 */
	constructor() {
	}

	public setScrollingContainer(element: ElementRef) {
		this.scrollingContainer = element;
	}

	public scrollToBottom(): void {
		try {
			this.scrollingContainer.nativeElement.scrollTop = this.scrollingContainer.nativeElement.scrollHeight;
		} catch (e) {
			console.error("Failed to scroll to bottom.", e);
		}
	}
}
