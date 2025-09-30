export type Category = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  icon?: React.ReactNode;
};

export type CategoriesResponse = {
  categories: Category[];
  total: number;
};
