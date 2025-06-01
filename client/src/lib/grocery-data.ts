// Authentic grocery data from FC Köln grocery spreadsheet
export interface GroceryItem {
  name: string;
  price: number;
  category: string;
}

export const groceryCategories = [
  'household',
  'vegetables_fruits',
  'meat',
  'dairy',
  'carbohydrates',
  'drinks',
  'spices_sauces',
  'frozen'
] as const;

export type GroceryCategory = typeof groceryCategories[number];

export const groceryData: Record<GroceryCategory, GroceryItem[]> = {
  household: [
    { name: "Dish Soap", price: 0.95, category: "household" },
    { name: "Dishwasher pods", price: 5.99, category: "household" },
    { name: "Disinfectant spray", price: 3.99, category: "household" },
    { name: "Garbage Bags", price: 1.89, category: "household" },
    { name: "Hand Soap", price: 1.69, category: "household" },
    { name: "Laundry Detergent", price: 4.49, category: "household" },
    { name: "Paper Towels", price: 2.85, category: "household" },
    { name: "Sponges", price: 2.39, category: "household" },
    { name: "Swiffer Cloths", price: 6.79, category: "household" },
    { name: "Toilet Paper", price: 4.15, category: "household" },
    { name: "Toothpaste", price: 1.29, category: "household" },
    { name: "Body soap", price: 2.69, category: "household" },
    { name: "Vacuum bags", price: 5.99, category: "household" },
    { name: "Bandaids", price: 2.49, category: "household" }
  ],
  vegetables_fruits: [
    { name: "Apples", price: 1.89, category: "vegetables_fruits" },
    { name: "Arugula", price: 1.99, category: "vegetables_fruits" },
    { name: "Avocados", price: 1.59, category: "vegetables_fruits" },
    { name: "Bananas", price: 0.40, category: "vegetables_fruits" },
    { name: "Beans", price: 1.39, category: "vegetables_fruits" },
    { name: "Watermelon", price: 3.99, category: "vegetables_fruits" },
    { name: "Frozen Broccoli", price: 1.69, category: "vegetables_fruits" },
    { name: "Carrots", price: 1.19, category: "vegetables_fruits" },
    { name: "Cherry Tomatoes", price: 0.99, category: "vegetables_fruits" },
    { name: "Cucumber", price: 0.69, category: "vegetables_fruits" },
    { name: "Garlic", price: 1.49, category: "vegetables_fruits" },
    { name: "Sour Pickles", price: 0.99, category: "vegetables_fruits" },
    { name: "Red Grapes", price: 3.19, category: "vegetables_fruits" },
    { name: "Lemon Juice", price: 1.99, category: "vegetables_fruits" },
    { name: "Lemons", price: 1.89, category: "vegetables_fruits" },
    { name: "Lentils", price: 1.65, category: "vegetables_fruits" },
    { name: "Lettuce", price: 1.19, category: "vegetables_fruits" },
    { name: "Limes", price: 1.59, category: "vegetables_fruits" },
    { name: "Mushrooms", price: 1.99, category: "vegetables_fruits" },
    { name: "Onions", price: 1.19, category: "vegetables_fruits" },
    { name: "Oranges", price: 2.99, category: "vegetables_fruits" },
    { name: "Potatoes", price: 2.99, category: "vegetables_fruits" },
    { name: "Red Pepper", price: 1.79, category: "vegetables_fruits" },
    { name: "Tomato paste", price: 2.19, category: "vegetables_fruits" },
    { name: "Pomegranate", price: 2.99, category: "vegetables_fruits" },
    { name: "Mandarines", price: 2.49, category: "vegetables_fruits" },
    { name: "Blueberries 500g", price: 4.99, category: "vegetables_fruits" },
    { name: "Kiwis", price: 0.59, category: "vegetables_fruits" },
    { name: "Spinach", price: 2.00, category: "vegetables_fruits" },
    { name: "Berry mix", price: 4.49, category: "vegetables_fruits" },
    { name: "Dates", price: 2.49, category: "vegetables_fruits" },
    { name: "Green grapes", price: 2.99, category: "vegetables_fruits" },
    { name: "Baby carrots", price: 0.99, category: "vegetables_fruits" }
  ],
  meat: [
    { name: "Bacon", price: 1.39, category: "meat" },
    { name: "Bauchspeck", price: 4.29, category: "meat" },
    { name: "Canned Tuna", price: 1.39, category: "meat" },
    { name: "Chicken", price: 6.49, category: "meat" },
    { name: "Eggs", price: 1.99, category: "meat" },
    { name: "Ground beef", price: 3.49, category: "meat" },
    { name: "Ham", price: 2.49, category: "meat" },
    { name: "Pork Steak", price: 3.79, category: "meat" },
    { name: "Salami", price: 1.99, category: "meat" },
    { name: "Salmon Fillet", price: 3.99, category: "meat" },
    { name: "Steak", price: 6.50, category: "meat" },
    { name: "Seasoned chicken strips", price: 5.99, category: "meat" }
  ],
  dairy: [
    { name: "Blueberry Yogurt", price: 0.65, category: "dairy" },
    { name: "Butter", price: 2.19, category: "dairy" },
    { name: "Butterkäse", price: 2.99, category: "dairy" },
    { name: "Cheddar", price: 2.89, category: "dairy" },
    { name: "Cream Cheese", price: 1.69, category: "dairy" },
    { name: "Gouda", price: 1.89, category: "dairy" },
    { name: "Greek Vanilla Yogurt", price: 1.99, category: "dairy" },
    { name: "Heavy Cream", price: 2.69, category: "dairy" },
    { name: "Mozzarella", price: 1.29, category: "dairy" },
    { name: "Parmesan cheese", price: 1.89, category: "dairy" },
    { name: "Raspberry Yogurt", price: 0.65, category: "dairy" },
    { name: "Skyr", price: 1.89, category: "dairy" },
    { name: "Strawberry Yogurt", price: 0.65, category: "dairy" },
    { name: "Vanilla Yogurt", price: 0.65, category: "dairy" },
    { name: "High Protein Pudding", price: 2.00, category: "dairy" },
    { name: "High protein ice cream cookies and cream", price: 2.80, category: "dairy" }
  ],
  carbohydrates: [
    { name: "Bagels", price: 1.79, category: "carbohydrates" },
    { name: "Whole grain Bread", price: 2.29, category: "carbohydrates" },
    { name: "Fusilli", price: 1.39, category: "carbohydrates" },
    { name: "Gnocchi", price: 1.89, category: "carbohydrates" },
    { name: "Hamburger Buns", price: 1.19, category: "carbohydrates" },
    { name: "Maccaroni", price: 1.99, category: "carbohydrates" },
    { name: "Muesli", price: 2.49, category: "carbohydrates" },
    { name: "Oats", price: 0.85, category: "carbohydrates" },
    { name: "Rice", price: 2.99, category: "carbohydrates" },
    { name: "Spaghetti", price: 1.39, category: "carbohydrates" },
    { name: "Tagliatelle", price: 1.89, category: "carbohydrates" },
    { name: "Tortellini with meat", price: 3.49, category: "carbohydrates" },
    { name: "Tortiglioni", price: 1.39, category: "carbohydrates" },
    { name: "Tortilla", price: 1.29, category: "carbohydrates" },
    { name: "Waffles", price: 1.35, category: "carbohydrates" },
    { name: "White Bread", price: 1.69, category: "carbohydrates" },
    { name: "Buldak Spicy Ramen", price: 2.29, category: "carbohydrates" },
    { name: "Croissant", price: 1.99, category: "carbohydrates" },
    { name: "Pretzels", price: 1.11, category: "carbohydrates" },
    { name: "Dark chocolate", price: 1.99, category: "carbohydrates" },
    { name: "Croutons", price: 1.49, category: "carbohydrates" },
    { name: "Schwäbische Eierspätzle", price: 2.29, category: "carbohydrates" },
    { name: "Whole grain tortilla", price: 1.29, category: "carbohydrates" },
    { name: "Konjac root pasta", price: 3.00, category: "carbohydrates" },
    { name: "Shirataki rice", price: 2.39, category: "carbohydrates" },
    { name: "Power System High Protein", price: 1.09, category: "carbohydrates" },
    { name: "Barilla Collezione Orecchiette", price: 2.79, category: "carbohydrates" },
    { name: "Corny bars", price: 2.29, category: "carbohydrates" },
    { name: "Ritz crackers", price: 1.79, category: "carbohydrates" }
  ],
  drinks: [
    { name: "Apple Juice", price: 1.29, category: "drinks" },
    { name: "Chai Tea", price: 2.29, category: "drinks" },
    { name: "Chocolate milk", price: 3.29, category: "drinks" },
    { name: "Instant coffee", price: 2.69, category: "drinks" },
    { name: "Mango Juice", price: 1.69, category: "drinks" },
    { name: "Milk", price: 0.99, category: "drinks" },
    { name: "Orange Juice", price: 2.49, category: "drinks" },
    { name: "Pomegranate Juice", price: 2.69, category: "drinks" },
    { name: "Sparkling Water", price: 2.34, category: "drinks" },
    { name: "Coconut water", price: 1.99, category: "drinks" }
  ],
  spices_sauces: [
    { name: "Basil", price: 0.99, category: "spices_sauces" },
    { name: "Basilico Sauce", price: 1.59, category: "spices_sauces" },
    { name: "BBQ sauce", price: 1.69, category: "spices_sauces" },
    { name: "Buldak Hot sauce", price: 5.89, category: "spices_sauces" },
    { name: "Brown Sugar", price: 1.69, category: "spices_sauces" },
    { name: "Canned Tomatoes", price: 1.19, category: "spices_sauces" },
    { name: "Chicken Seasoning", price: 1.99, category: "spices_sauces" },
    { name: "Chili Flakes", price: 2.39, category: "spices_sauces" },
    { name: "Cinnamon", price: 2.19, category: "spices_sauces" },
    { name: "Dill", price: 2.29, category: "spices_sauces" },
    { name: "Dried Thyme", price: 2.19, category: "spices_sauces" },
    { name: "Flour", price: 0.99, category: "spices_sauces" },
    { name: "Garlic Powder", price: 2.29, category: "spices_sauces" },
    { name: "Green Pesto", price: 1.09, category: "spices_sauces" },
    { name: "Honey", price: 2.99, category: "spices_sauces" },
    { name: "Jam", price: 3.29, category: "spices_sauces" },
    { name: "Ketchup", price: 3.49, category: "spices_sauces" },
    { name: "Maple syrup", price: 4.99, category: "spices_sauces" },
    { name: "Mayo", price: 3.39, category: "spices_sauces" },
    { name: "Mustard", price: 1.79, category: "spices_sauces" },
    { name: "Nutella", price: 4.89, category: "spices_sauces" },
    { name: "Olive Oil", price: 10.99, category: "spices_sauces" },
    { name: "Onion Powder", price: 2.29, category: "spices_sauces" },
    { name: "Orange Pesto", price: 1.09, category: "spices_sauces" },
    { name: "Oregano", price: 1.99, category: "spices_sauces" },
    { name: "Paprika", price: 2.19, category: "spices_sauces" },
    { name: "Parsley", price: 2.29, category: "spices_sauces" },
    { name: "Peanut Butter", price: 2.99, category: "spices_sauces" },
    { name: "Pepper", price: 2.09, category: "spices_sauces" },
    { name: "Cayenne Pepper", price: 2.29, category: "spices_sauces" },
    { name: "Salt", price: 1.29, category: "spices_sauces" },
    { name: "Sriracha", price: 5.79, category: "spices_sauces" },
    { name: "Soy Sauce", price: 1.79, category: "spices_sauces" },
    { name: "Teriyaki sauce", price: 3.39, category: "spices_sauces" },
    { name: "White Sugar", price: 1.19, category: "spices_sauces" },
    { name: "Blueberry jam", price: 3.89, category: "spices_sauces" },
    { name: "Cajun", price: 4.99, category: "spices_sauces" },
    { name: "Vinegar salad dressing", price: 2.19, category: "spices_sauces" },
    { name: "Baking soda", price: 0.85, category: "spices_sauces" }
  ],
  frozen: [
    { name: "Frozen Blueberries", price: 2.99, category: "frozen" },
    { name: "Frozen Mango", price: 3.29, category: "frozen" },
    { name: "Frozen Raspberries", price: 3.69, category: "frozen" },
    { name: "Frozen Strawberries", price: 2.69, category: "frozen" },
    { name: "Ice (Not Crushed)", price: 1.50, category: "frozen" }
  ]
};

export const getCategoryDisplayName = (category: GroceryCategory): string => {
  const names: Record<GroceryCategory, string> = {
    household: "Household Items",
    vegetables_fruits: "Vegetables & Fruits",
    meat: "Meat & Protein",
    dairy: "Dairy Products",
    carbohydrates: "Carbohydrates",
    drinks: "Drinks & Beverages",
    spices_sauces: "Spices & Sauces",
    frozen: "Frozen Items"
  };
  return names[category];
};

export const getAllItems = (): GroceryItem[] => {
  return Object.values(groceryData).flat();
};

export const getItemsByCategory = (category: GroceryCategory): GroceryItem[] => {
  return groceryData[category] || [];
};

export const searchItems = (query: string): GroceryItem[] => {
  const allItems = getAllItems();
  return allItems.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  );
};