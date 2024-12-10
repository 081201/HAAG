import express from 'express';
import expressSession from 'express-session';
import Database from 'better-sqlite3';
import betterSqlite3Session from 'express-session-better-sqlite3';
import ViteExpress from 'vite-express';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const app = express();
app.use(express.static('public'));
app.use(express.json());

// To resolve __dirname in ES modules
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

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);  // Specify the directory to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Generate a unique filename
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });


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
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));


// Endpoint to fetch homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

// Serve the profile settings page
app.get('/profile-settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile-settings.html'));
});

// API to check user status
app.get('/api/user-status', (req, res) => {
    if (req.session.username) {
        const stmt = db.prepare(`
            SELECT username, profile_picture
            FROM ht_users
            WHERE username = ?
        `);
        const user = stmt.get(req.session.username);

        if (user) {
            return res.json({ loggedIn: true, username: user.username, profilePicture: user.profile_picture });
        }
    }
    res.json({ loggedIn: false });
});

// Endpoint to update user profile information
app.post('/api/update-profile', isAuthenticated, async (req, res) => {
    const { newUsername, newProfilePicture } = req.body;

    if (!newUsername) {
        return res.status(400).json({ error: 'Username is required.' });
    }

    try {
        const stmt = db.prepare('UPDATE ht_users SET username = ?, profile_picture = ? WHERE username = ?');
        const result = stmt.run(newUsername, newProfilePicture || null, req.session.username);

        if (result.changes > 0) {
            req.session.username = newUsername;  
            res.json({ success: true, newUsername, newProfilePicture });
        } else {
            res.status(400).json({ error: 'Failed to update profile.' });
        }
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ error: 'An error occurred while updating your profile.' });
    }
});

// Endpoint for uploading profile picture
app.post('/api/upload-profile-picture', isAuthenticated, upload.single('profilePicture'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = `/uploads/${req.file.filename}`;

    // Optionally: Update the user's profile picture in the database
    const stmt = db.prepare('UPDATE ht_users SET profile_picture = ? WHERE username = ?');
    const result = stmt.run(filePath, req.session.username);

    if (result.changes > 0) {
        res.json({ success: true, profilePicture: filePath });
    } else {
        res.status(400).json({ error: 'Failed to update profile picture.' });
    }
});

// User login endpoint
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

// User signup
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, Email and Password are required.' });
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

// Endpoint to fetch recipe categories
app.get('/categories', (req, res) => {
    try {
        const stmt = db.prepare("SELECT * FROM categories");
        const categories = stmt.all();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Endpoint to fetch recipes based on categories and ht_users
app.get('/recipes', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT r.id, r.title, r.ingredients, r.instructions, c.name AS category, u.username AS author
            FROM recipes r
            JOIN categories c ON r.category_id = c.id
            JOIN ht_users u ON r.user_id = u.id
        `);
        const recipes = stmt.all();
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error.message);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

app.get('/recipes/:id', (req, res) => { 
    res.sendFile(path.join(__dirname, 'public', 'recipe.html'));
});

app.get('/api/recipes/:id', (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare("SELECT * FROM recipes WHERE id = ?");
        const recipe = stmt.get(id);
        if (recipe) {
            res.json(recipe);
        } else {
            res.status(404).json({ error: 'Recipe not found' });
        }
    } catch (error) {
        console.error('Error fetching recipe:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.username = null;
    req.session.isadmin = null; 
    res.json({ success: 1 });
});

// Start the server
ViteExpress.listen(app, PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
});
