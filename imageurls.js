import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

// Get the current directory using fileURLToPath and import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('ChefSecretRecipe.db');
const imageDirectory = path.join(__dirname, 'public', 'images');

// Create the 'recipes' table if it doesn't exist
const createTableStmt = `
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    ingredients TEXT,
    instructions TEXT,
    image_url TEXT
  );
`;

db.prepare(createTableStmt).run();

// Explicit mapping between recipe IDs and image filenames
const recipeImageMap = {
  1: 'depth-7-frame-0@2x.png',
  2: 'depth-7-frame-0-1@2x.png',
  3: 'depth-7-frame-0-2@2x.png',
  4: 'depth-7-frame-0-3@2x.png',
  // Add all other mappings here
};

// Prepare a statement to update the image_url for a recipe
const updateStmt = db.prepare(`
  UPDATE recipes 
  SET image_url = ? 
  WHERE id = ?
`);

// Retrieve all recipes from the database
const recipes = db.prepare('SELECT * FROM recipes').all();

recipes.forEach(recipe => {
  // Get the corresponding image filename from the mapping
  const imageName = recipeImageMap[recipe.id];

  if (imageName) {
    const imageUrl = `/images/${imageName}`;

    // Update the image_url with the mapped image filename
    updateStmt.run(imageUrl, recipe.id);
    console.log(`Updated recipe ID ${recipe.id} with image URL: ${imageUrl}`);
  } else {
    console.log(`No image mapping found for recipe ID ${recipe.id}.`);
  }
});

console.log('Image URLs updated!');
