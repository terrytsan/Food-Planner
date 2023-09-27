import { AfterViewInit, Component, ElementRef, Input, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { Dish } from "../food-plan-preview/foodPlan";
import { GlobalVariable } from "../global";
import { debounce, fromEvent, timer, withLatestFrom } from "rxjs";
import { filter, map } from "rxjs/operators";

@Component({
	selector: 'app-dish-carousel',
	templateUrl: './dish-carousel.component.html',
	styleUrls: ['./dish-carousel.component.scss']
})
export class DishCarouselComponent implements AfterViewInit {
	defaultImage: string = GlobalVariable.PLACEHOLDER_IMAGE_URL;

	@Input() dishes: Dish[];
	@ViewChild('carouselContainer') carouselContainer: ElementRef<HTMLDivElement>;
	@ViewChildren('dish') dishDivs: QueryList<ElementRef<HTMLDivElement>>;

	/** Index of currently selected item*/
	selectedIndex = signal(0);

	ngAfterViewInit() {
		let dishDivs$ = this.dishDivs.changes.pipe(
			filter((list: QueryList<ElementRef<HTMLDivElement>>) => list.length > 0),
			map((list: QueryList<ElementRef<HTMLDivElement>>) => list.toArray().map(e => e.nativeElement))
		);

		let currentIndex$ = fromEvent<Event>(this.carouselContainer.nativeElement, 'scroll').pipe(
			debounce(() => timer(50)),		// many scroll events occur
			withLatestFrom(dishDivs$),
			map(([_, dishElements]) => this.getIndexOfDishInView(this.carouselContainer.nativeElement, dishElements))
		);

		currentIndex$.subscribe((index) => {
			this.selectedIndex.set(index);
		});
	}

	/**
	 * Returns the index of the dish currently in view within the carousel.
	 * Finds the div with the largest overlap
	 *
	 * @param {HTMLDivElement} carousel - The div element representing the carousel container.
	 * @param {HTMLDivElement[]} dishElements - The array of dish elements.
	 * @returns {number} The index of the dish currently in view, or -1 if none of the dishes are in view
	 */
	private getIndexOfDishInView(carousel: HTMLDivElement, dishElements: HTMLDivElement[]): number {
		let containerRect = carousel.getBoundingClientRect();
		let maxElementIndex = -1;
		let maxElementCoverage = 0;

		dishElements.forEach((element, index) => {
			const elementRect = element.getBoundingClientRect();

			// Calculate the portion of the dish element that is in view
			const leftOverlap = Math.max(0, Math.min(elementRect.right, containerRect.right) - Math.max(elementRect.left, containerRect.left));
			const rightOverlap = Math.max(0, Math.min(containerRect.right, elementRect.right) - Math.max(containerRect.left, elementRect.left));
			const elementCoverage = Math.max(leftOverlap, rightOverlap);

			if (elementCoverage > maxElementCoverage) {
				maxElementCoverage = elementCoverage;
				maxElementIndex = index;
			}
		});

		return maxElementIndex;
	}

	prevItem() {
		this.scrollToIndex(this.selectedIndex() - 1);
	}

	nextItem() {
		this.scrollToIndex(this.selectedIndex() + 1);
	}

	navigateToIndex(index: number) {
		this.scrollToIndex(index);
	}

	private scrollToIndex(index: number) {
		let scrollTo = this.dishDivs
			.toArray()
			.map(d => d.nativeElement)
			.find(e => e.id === `dish-${index}`);

		if (scrollTo) {
			scrollTo.scrollIntoView({ behavior: 'smooth' });
		}
	}
}
