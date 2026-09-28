const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Task Manager API running on http://localhost:${port}`);
});
