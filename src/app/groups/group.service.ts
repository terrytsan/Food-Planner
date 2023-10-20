import { Injectable } from '@angular/core';
import { Group } from "./group";
import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	deleteDoc,
	doc,
	docData,
	DocumentReference,
	Firestore,
	getDoc,
	getDocs,
	query,
	updateDoc,
	where
} from "@angular/fire/firestore";
import { UserType } from "../profile/profile.component";
import { Observable } from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class GroupService {

	constructor(private afs: Firestore) {
	}

	async addMember(group: Group, userId: string, permission: string): Promise<any> {
		const groupRef = doc(this.afs, "groups", group.id);
		switch (permission) {
			case "viewer":
				return await updateDoc(groupRef, {
					viewers: arrayUnion(userId)
				});
			case "editor":
				return await updateDoc(groupRef, {
					editors: arrayUnion(userId)
				});
		}
	}

	async removeMember(group: Group, userId: string): Promise<any> {
		const groupRef = doc(this.afs, "groups", group.id);
		return await updateDoc(groupRef, {
			viewers: arrayRemove(userId),
			editors: arrayRemove(userId)
		});
	}

	async changePermission(group: Group, userId: string, newPermission: string) {
		await this.removeMember(group, userId);
		await this.addMember(group, userId, newPermission);
	}

	async updateName(group: Group, newName: string) {
		const groupRef = doc(this.afs, "groups", group.id);
		return await updateDoc(groupRef, {
			name: newName
		});
	}

	getGroup(id: string): Observable<Group> {
		let ref = doc(this.afs, 'groups', id) as DocumentReference<Group>;
		return docData<Group>(ref, { idField: 'id' });
	}

	async deleteGroup(group: Group, userId: string): Promise<any> {
		let userOwnedGroups: Group[] = [];
		// Get groups owned by user
		const q = query(collection(this.afs, 'groups'), where('owner', '==', userId));
		const querySnapshot = await getDocs(q);
		querySnapshot.forEach(g => {
			userOwnedGroups.push(g.data() as Group);
		});

		if (group.viewers.length != 0 || group.editors.length != 0) {
			return Promise.reject("Group still has members");
		} else if (userOwnedGroups.length <= 1) {
			return Promise.reject("Must own at least one group");
		}
		let groupRef = doc(this.afs, "groups", group.id);
		return await deleteDoc(groupRef);
	}

	async createGroup(name: string, ownerId: string): Promise<any> {
		return await addDoc(collection(this.afs, 'groups'), {
			name: name,
			owner: ownerId,
			editors: [],
			viewers: []
		});
	}

	async setUsersSelectedGroup(uid: string, groupId: string): Promise<any> {
		const userType = await this.getUserType(uid, groupId);
		let canEdit: boolean = userType === UserType.Owner || userType === UserType.Editor;

		const userRef = doc(this.afs, 'users', uid);
		return await updateDoc(userRef, {
			selectedGroup: groupId,
			canEdit: canEdit
		});
	}

	async getUserType(uid: string, groupId: string): Promise<UserType> {
		const groupRef = doc(this.afs, 'groups', groupId);
		const group = (await getDoc(groupRef)).data();

		if (group!.owner == uid) {
			return UserType.Owner;
		} else if (group!.editors.includes(uid)) {
			return UserType.Editor;
		} else if (group!.viewers.includes(uid)) {
			return UserType.Viewer;
		}
		return UserType.Viewer;
	}
}
