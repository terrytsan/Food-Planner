import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService, FoodPlannerUser, SimpleUser } from "../auth.service";
import { combineLatest, Observable, of, zip } from "rxjs";
import { collection, collectionData, CollectionReference, Firestore, query, where } from "@angular/fire/firestore";
import { Group } from "../groups/group";
import { map, switchMap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import {
	GroupMemberEditDialogComponent,
	GroupMemberEditDialogData
} from "../groups/group-member-edit-dialog/group-member-edit-dialog.component";
import { GroupService } from "../groups/group.service";

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

	user$: Observable<FoodPlannerUser | null>;
	groups$: Observable<Group[]> = new Observable<Group[]>();
	UserType = UserType;

	constructor(
		private authService: AuthService,
		private router: Router,
		private afs: Firestore,
		private dialog: MatDialog,
		private groupService: GroupService
	) {
		this.user$ = authService.getExtendedUser();

		this.user$.subscribe(user => {
			if (user == null) {
				return;
			}

			let ownerGroups$ = collectionData(query(collection(afs, 'groups') as CollectionReference, where("owner", "==", user.uid)), {idField: 'id'});
			let editorGroups$ = collectionData(query(collection(afs, 'groups') as CollectionReference, where("editors", "array-contains", user.uid)), {idField: 'id'});
			let viewerGroups$ = collectionData(query(collection(afs, 'groups') as CollectionReference, where("viewers", "array-contains", user.uid)), {idField: 'id'});

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
					let users$ = collectionData<SimpleUser>(query<SimpleUser>(collection(afs, 'users') as CollectionReference<SimpleUser>, where("__name__", "in", userIds)), {idField: 'id'});

					return zip(
						users$,
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

					return of(mappedGroups);
				}));
		});
	}

	ngOnInit(): void {
	}

	signOut() {
		this.authService.signOut();
		this.router.navigate(['']);
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
}

export enum UserType {
	Owner,
	Editor,
	Viewer
}
