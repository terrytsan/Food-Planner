import { Component, Signal } from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs/operators";
import { BreakpointObserver } from "@angular/cdk/layout";

@Component({
	selector: 'app-calendar',
	templateUrl: './calendar.component.html',
	styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
	days = Array.from(Array(30).keys());
	daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
	dayNames: Signal<string[]>;

	constructor(private breakpointObserver: BreakpointObserver) {
		this.dayNames = toSignal(this.breakpointObserver.observe(`(max-width: 600px)`).pipe(
			map(result => result.matches ? this.daysOfWeek.map(d => d.substring(0, 3)) : this.daysOfWeek)), { initialValue: this.daysOfWeek });
	}
}
