import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMemberEditDialogComponent } from './group-member-edit-dialog.component';

describe('GroupMemberEditDialogComponent', () => {
	let component: GroupMemberEditDialogComponent;
	let fixture: ComponentFixture<GroupMemberEditDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GroupMemberEditDialogComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(GroupMemberEditDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
