import express from 'express';
import expressSession from 'express-session';
import Database from 'better-sqlite3';
import betterSqlite3Session from 'express-session-better-sqlite3';
import ViteExpress from 'vite-express';

const app = express();
app.use(express.static('public'));
app.use(express.json());

const sessDb = new Database("session.db");
const SqliteStore = betterSqlite3Session(expressSession, sessDb);

app.use(expressSession({
    store: new SqliteStore(),
    secret: 'ChefSecretRecipe',
    resave: true,
    saveUninitialized: false,
    rolling: true,
    unset: 'destroy',
    proxy: true,
    cookie: {
        maxAge: 600000,
        httpOnly: false
    }
}));

const PORT = 3000;
const db = new Database("ChefSecretRecipe.db");

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.username) {
        return res.status(401).json({ error: 'Not logged in!' });
    }
    next();
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    if (!req.session.isadmin) {
        return res.status(403).json({ error: 'Access denied!' });
    }
    next();
};

// User login endpoint
app.post('/login', (req, res) => {
    try {
        const stmt = db.prepare("SELECT * FROM ht_users WHERE username=? AND password=?");
        const result = stmt.get(req.body.username, req.body.password);
        if (result) {
            req.session.username = req.body.username;
            req.session.isadmin = result.isadmin ? true : false; // Store admin status
            res.json({ username: req.body.username, isadmin: req.session.isadmin });
        } else {
            res.status(401).json({ error: 'Invalid login!' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Endpoint to create a new recipe (accessible to all authenticated users)
app.post('/recipe/new', isAuthenticated, (req, res) => {
    try {
        const { title, ingredients, instructions } = req.body; // Assume these fields are included
        if (!title || !ingredients || !instructions) {
            return res.status(400).json({ error: 'Missing data' });
        }
        const stmt = db.prepare("INSERT INTO recipes(title, ingredients, instructions, user) VALUES (?, ?, ?, ?)");
        const info = stmt.run(title, ingredients, instructions, req.session.username); // Assuming you store the username
        res.json({ id: info.lastInsertRowid });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Endpoint to update a user's recipe (accessible to the user)
app.put('/recipe/:id', isAuthenticated, (req, res) => {
    try {
        const { title, ingredients, instructions } = req.body;
        if (!title || !ingredients || !instructions) {
            return res.status(400).json({ error: 'Missing data' });
        }
        
        // Check if the recipe belongs to the user
        const checkStmt = db.prepare("SELECT * FROM recipes WHERE id=? AND user=?");
        const recipe = checkStmt.get(req.params.id, req.session.username);
        
        if (!recipe) {
            return res.status(403).json({ error: 'You do not have permission to update this recipe.' });
        }

        const stmt = db.prepare("UPDATE recipes SET title=?, ingredients=?, instructions=? WHERE id=?");
        stmt.run(title, ingredients, instructions, req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin endpoint to delete a recipe
app.delete('/recipe/:id', isAdmin, (req, res) => {
    try {
        const stmt = db.prepare("DELETE FROM recipes WHERE id=?");
        const info = stmt.run(req.params.id);
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Recipe not found.' });
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin endpoint to block a user account
app.post('/admin/block/:username', isAdmin, (req, res) => {
    try {
        const { username } = req.params;

        // Check if user exists
        const user = db.prepare("SELECT * FROM ht_users WHERE username=?").get(username);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Block the user by setting is_blocked to true
        const stmt = db.prepare("UPDATE ht_users SET is_blocked=? WHERE username=?");
        stmt.run(1, username); // Assuming is_blocked is a boolean represented as 0 (false) or 1 (true)

        res.json({ success: true, message: `${username} has been blocked.` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.username = null;
    req.session.isadmin = null; // Clear admin session
    res.json({ success: 1 });
});

// Start the server
ViteExpress.listen(app, PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
});
