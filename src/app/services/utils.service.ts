export class UtilsService {

	public static combineArrays(a1: any[], a2: any[]): any[] {
		return [...a1 || [], ...a2 || []];
	}
}
