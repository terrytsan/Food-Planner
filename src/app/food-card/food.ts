export interface Food {
	id: string;
	name: string;
	description: string;
	image: string;
	imagePath: string;
	labels: string[];
	group: string;
	coreIngredients: string[];
	optionalIngredients: string[];
}
