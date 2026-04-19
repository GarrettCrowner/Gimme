// server/app.js
const express      = require('express');
const cors         = require('cors');
const usersRoutes  = require('./routes/users');
const roundsRoutes = require('./routes/rounds');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', usersRoutes);   // auth, friends, push
app.use('/api/rounds', roundsRoutes); // rounds + all sub-resources

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use(errorHandler);

module.exports = app;
