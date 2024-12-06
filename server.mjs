import express from 'express';
import expressSession from 'express-session';
import Database from 'better-sqlite3';
import betterSqlite3Session from 'express-session-better-sqlite3';
import ViteExpress from 'vite-express';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.static('public'));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const isAuthenticated = (req, res, next) => {
    if (!req.session.username) {
        return res.status(401).json({ error: 'Not logged in!' });
    }
    next();
};

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const stmt = db.prepare("SELECT * FROM ht_users WHERE email = ?");
        const user = stmt.get(email);

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.username = user.username;
            res.json({ message: 'Login successful!', username: user.username });
        } else {
            res.status(401).json({ error: 'Invalid email or password!' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, Email, and Password are required.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    try {
        const checkUserStmt = db.prepare("SELECT * FROM ht_users WHERE username = ? OR email = ?");
        const existingUser = checkUserStmt.get(username, email);

        if (existingUser) {
            return res.status(409).json({ error: 'Username or email is already taken.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertStmt = db.prepare(`
            INSERT INTO ht_users (username, email, password) 
            VALUES (?, ?, ?)
        `);
        insertStmt.run(username, email, hashedPassword);

        res.status(201).json({ message: 'Signup successful!' });
    } catch (error) {
        console.error('Error during signup:', error.message);
        res.status(500).json({ error: 'An error occurred. Please try again.' });
    }
});

app.post('/update-profile', isAuthenticated, async (req, res) => {
    try {
        const { username, darkMode, profilePic } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required.' });
        }

        const newProfilePic = profilePic ? profilePic : null;

        const updateStmt = db.prepare(`
            UPDATE ht_users
            SET username = ?, profile_picture = ?, dark_mode = ?
            WHERE username = ?
        `);

        updateStmt.run(username, newProfilePic, darkMode, req.session.username);

        res.json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ error: 'An error occurred. Please try again.' });
    }
});

app.post('/logout', (req, res) => {
    req.session.username = null;
    req.session.isadmin = null; 
    res.json({ success: 1 });
});

ViteExpress.listen(app, PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
});
