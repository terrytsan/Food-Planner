import { Injectable } from '@angular/core';
import { Group } from "./group";
import { arrayRemove, arrayUnion, doc, Firestore, updateDoc } from "@angular/fire/firestore";

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
}
