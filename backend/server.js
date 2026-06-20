require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Root & health check ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    app: 'BodyMetric API',
    status: 'running',
    endpoints: {
      health: '/api/health',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'BodyMetric API', timestamp: new Date() });
});

// ─── Routes (add as you build) ────────────────────────────────────────────────
// app.use('/api/auth',          require('./routes/auth'));
// app.use('/api/profile',       require('./routes/profile'));
// app.use('/api/history',       require('./routes/history'));
// app.use('/api/activities',    require('./routes/activities'));
// app.use('/api/notifications', require('./routes/notifications'));

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🟢 BodyMetric API running on http://localhost:${PORT}`);
});
