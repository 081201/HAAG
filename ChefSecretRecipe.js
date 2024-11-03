import Database from 'better-sqlite3';

// Open (or create) the database
const db = new Database('ChefSecretRecipe.db');

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS ht_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    isadmin BOOLEAN NOT NULL DEFAULT 0,
    is_blocked BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    user TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user) REFERENCES ht_users(username)
);
`);

console.log("Tables created successfully!");
