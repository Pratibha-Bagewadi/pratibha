const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
app.use(express.json());

app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql@456', 
    database: 'task_managerDB'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// User Registration
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = 'INSERT INTO users6 (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'User registered successfully' });
    });
});

// User Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users6 WHERE email = ?';

    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    });
});

// Create Task
app.post('/api/tasks', (req, res) => {
    const { title, description, status, user_id } = req.body; // Make sure `status` is extracted

    if (!title ||!description ||!status || !user_id) {
        return res.status(400).json({ error: "Title, status, and user_id are required!" });
    }

    const sql = `INSERT INTO tasks6 (title, description, status, user_id) VALUES (?, ?, ?, ?)`;
    db.query(sql, [title, description, status, user_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Task added successfully!', taskId: result.insertId });
    });
});

app.post('/api/priority', (req, res) => {
    const { level, user_id } = req.body;  // Removed `id` from body

    if (!level || !user_id) {
        return res.status(400).json({ error: "level,user_id are required!" });
    }

    const sql = `INSERT INTO priority6 (level, user_id) VALUES (?,?)`;
    db.query(sql, [level, user_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Priority added successfully!', priorityId: result.insertId });
    });
});
 
//Sessions
app.post('/api/sessions', (req, res) => {
    const { user_id, token } = req.body;

    const sql = `INSERT INTO sessions6 (user_id, token) VALUES (?, ?)`;

    db.query(sql, [user_id, token], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err });
        }
        res.status(201).json({ 
            message: 'Session added successfully', 
            sessionId: result.insertId 
        });
    });
})

// Get All Tasks
app.get('/api/tasks', (req, res) => {
    const sql = 'SELECT * FROM tasks6';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
 

// Get sessions
app.get('/api/sessions', (req, res) => {
    const sql = `SELECT * FROM sessions6`;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err });
        }
        res.status(200).json(results);
    });
}); 

app.get('/api/priority', (req, res) => {
    const sql = 'SELECT * FROM priority6';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
