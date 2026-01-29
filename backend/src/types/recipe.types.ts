export interface RecipeFilters {
  cuisine?: string;
  cookingTime?: number;
  difficulty?: string;
}

export interface GeneratedRecipe {
  id: string;
  name: string;
  cuisine: string;
  ingredients: {
    available: string[];
    needed: string[];
  };
  steps: string[];
  cookingTime: number;
  difficulty: string;
  imageUrl: string;
}
