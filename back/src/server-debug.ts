import app from './app-debug';

const PORT = Number(process.env.PORT) || 7002;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Debug server is running on port ${PORT}`);
});
