import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('ChefSecretRecipe.db');


const userImageMap = {
  1: 'user1_profile.jpg',
  2: 'user2_profile.jpg',
  3: 'user3_profile.jpg'
};

const updateStmt = db.prepare(`
  UPDATE ht_users
  SET profile_picture = ?
  WHERE id = ?
`);

const users = db.prepare('SELECT * FROM ht_users').all();

users.forEach(user => {
  const imageName = userImageMap[user.id];

  if (imageName) {
    updateStmt.run(imageName, user.id);
    console.log(`Updated user ID ${user.id} with profile picture: ${imageName}`);
  } else {
    console.log(`No profile image mapping found for user ID ${user.id}.`);
  }
});

console.log('Profile pictures updated!');
