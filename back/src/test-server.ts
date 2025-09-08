import express from 'express';

const app = express();
app.use(express.json());

// Test très simple
app.get('/test-simple', (req, res) => {
  res.json({ message: 'Simple test works!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 7001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
});
