const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const notesRoutes = require('./routes/notes');  // ← ADD THIS

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth'); 

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes); 

app.get('/', (req, res) => {
  res.json({ message: 'Notes API is running!' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});

app.use('/api/notes', notesRoutes);  // ← ADD THIS

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL, // we'll set this after deploying frontend
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));