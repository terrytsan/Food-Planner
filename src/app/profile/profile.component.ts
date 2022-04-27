import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService, FoodPlannerUser, SimpleUser } from "../services/auth.service";
import { combineLatest, Observable, of, zip } from "rxjs";
import { collection, collectionData, CollectionReference, Firestore, query, where } from "@angular/fire/firestore";
import { Group } from "../groups/group";
import { map, skipWhile, switchMap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import {
	GroupMemberEditDialogComponent,
	GroupMemberEditDialogData
} from "../groups/group-member-edit-dialog/group-member-edit-dialog.component";
import { GroupService } from "../groups/group.service";
import {
	StringInputDialogComponent,
	StringInputDialogData
} from "../generic/string-input-dialog/string-input-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { animate, query as animationQuery, stagger, style, transition, trigger } from "@angular/animations";

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css'],
	animations: [
		trigger('fadeInStagger', [
			transition(':enter', [
				animationQuery(':enter', [
					style({transform: 'translateY(10px)', opacity: 0}),
					stagger('100ms', [
						animate('220ms cubic-bezier(0.250, 0.460, 0.450, 0.940)'),
						style({transform: 'translateY(0)', opacity: 1})
					])
				])
			])
		])
	]
})
export class ProfileComponent implements OnInit {

	user$: Observable<FoodPlannerUser | null>;
	groups$: Observable<Group[]> = new Observable<Group[]>();
	UserType = UserType;

	loadingGroups: boolean = false;

	constructor(
		private authService: AuthService,
		private router: Router,
		private afs: Firestore,
		private dialog: MatDialog,
		private groupService: GroupService,
		private _snackBar: MatSnackBar
	) {
		this.user$ = authService.getExtendedUser();

		this.user$.subscribe(user => {
			if (user == null) {
				return;
			}

			let ownerGroups$ = collectionData(query(collection(afs, 'groups') as CollectionReference, where("owner", "==", user.uid)), {idField: 'id'});
			let editorGroups$ = collectionData(query(collection(afs, 'groups') as CollectionReference, where("editors", "array-contains", user.uid)), {idField: 'id'});
			let viewerGroups$ = collectionData(query(collection(afs, 'groups') as CollectionReference, where("viewers", "array-contains", user.uid)), {idField: 'id'});

			this.loadingGroups = true;
			this.groups$ = combineLatest([
				ownerGroups$,
				editorGroups$,
				viewerGroups$
			]).pipe(
				// Collate all the groups this user belongs to
				map(([ownerGroups, editorGroups, viewerGroups]) => {
					let allGroups = ownerGroups.concat(editorGroups, viewerGroups);

					let uniqueGroupIds = new Set();
					// Get unique groups
					return allGroups.filter(group => {
						if (uniqueGroupIds.has(group.id)) {
							return false;
						}
						uniqueGroupIds.add(group.id);
						return true;
					});
				}),
				// Get all users belonging to those groups
				switchMap(groups => {
					let userIds = groups.flatMap(g => [g.owner, ...g.viewers, ...g.editors]);
					let uniqueUserIds = [...new Set(userIds)];
					// Query currently limited to 10 users
					let users$ = collectionData<SimpleUser>(query<SimpleUser>(collection(afs, 'users') as CollectionReference<SimpleUser>, where("__name__", "in", uniqueUserIds)), {idField: 'id'});

					return zip(
						users$.pipe(skipWhile(users => users.length != uniqueUserIds.length)),		// 1st emit is from cache (user collection queried in auth.service)
						of(groups)
					);
				}),
				// Map user objects to user ids
				switchMap(([users, groups]) => {
					let mappedGroups: Group[] = groups.map(g => {
						let mappedEditors: SimpleUser[] = g.editors.map((e: string) => {
							return users.find(u => u.id == e) || {} as SimpleUser;
						});
						let mappedViewers: SimpleUser[] = g.viewers.map((e: string) => {
							return users.find(u => u.id == e) || {} as SimpleUser;
						});
						let mappedGroup: Group = {
							id: g.id,
							name: g.name,
							owner: users.find(u => u.id == g.owner) || {} as SimpleUser,
							editors: mappedEditors,
							viewers: mappedViewers
						};
						return mappedGroup;
					});
					this.loadingGroups = false;

					return of(mappedGroups);
				}));
		});
	}

	ngOnInit(): void {
	}

	signOut() {
		this.authService.signOut().then(() => {
			this.router.navigate(['']);
		});
	}

	// Allows group expansion panels to stay open when observable is updated
	identify(index: number, item: { id: any; }) {
		return item.id;
	}

	mapUsersToIds(users: SimpleUser[]): string[] {
		return users.map(user => user.id);
	}

	addMember(group: Group) {
		this.openGroupMemberEditDialog("", 0, group);
	}

	async removeMember(group: Group, uid: string) {
		await this.groupService.removeMember(group, uid);
	}

	editMember(uid: string, userType: UserType, group: Group) {
		this.openGroupMemberEditDialog(uid, userType, group);
	}

	openGroupMemberEditDialog(uid: string, userType: UserType, group: Group) {
		this.dialog.open(GroupMemberEditDialogComponent, {
			width: '80%',
			maxWidth: '600px',
			autoFocus: false,
			data: {
				userId: uid,
				currentPermission: UserType[userType],
				group: group
			} as GroupMemberEditDialogData
		});
	}

	editName(group: Group) {
		let dialogData = new StringInputDialogData();
		dialogData.title = "Edit Group Name";
		dialogData.inputLabel = "Name";
		dialogData.initialValue = group.name;
		dialogData.confirmBtnText = "Save";

		let dialogRef = this.dialog.open(StringInputDialogComponent, {
			width: '80%',
			maxWidth: '600px',
			autoFocus: false,
			data: dialogData
		});

		dialogRef.afterClosed().subscribe(newName => {
			if (newName) {
				this.groupService.updateName(group, newName);
			}
		});
	}

	deleteGroup(group: Group, userId: string) {
		this.groupService.deleteGroup(group, userId).then(() => {
			this._snackBar.open("Successfully deleted", 'Dismiss', {duration: 3000});
		}, err => {
			this._snackBar.open(err, 'Dismiss', {duration: 3000});
			console.error(err);
		});
	}

	createGroup(userId: string) {
		let dialogData = new StringInputDialogData();
		dialogData.title = "New Group";
		dialogData.inputLabel = "Name";
		dialogData.confirmBtnText = "Create";

		let dialogRef = this.dialog.open(StringInputDialogComponent, {
			width: '80%',
			maxWidth: '600px',
			autoFocus: false,
			data: dialogData
		});

		dialogRef.afterClosed().subscribe(newGroupName => {
			if (newGroupName) {
				this.groupService.createGroup(newGroupName, userId);
			}
		});
	}

	selectGroup(uid: string, groupId: string) {
		this.groupService.setUsersSelectedGroup(uid, groupId).catch(e => {
			console.error(e);
		});
	}
}

export enum UserType {
	Owner,
	Editor,
	Viewer
}
