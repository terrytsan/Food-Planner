import { SimpleUser } from "../services/auth.service";

export interface Group {
	id: string;
	name: string;
	owner: SimpleUser;
	viewers: SimpleUser[];
	editors: SimpleUser[];
}
