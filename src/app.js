const path = require('path');
const express = require('express');
const tasks = require('./tasks');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/tasks', (req, res) => {
  res.json(tasks.listTasks());
});

app.post('/tasks', (req, res) => {
  const errors = tasks.validateTask(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  res.status(201).json(tasks.createTask(req.body));
});

app.get('/tasks/:id', (req, res) => {
  const task = tasks.getTask(Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'task not found' });
  }
  res.json(task);
});

app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!tasks.getTask(id)) {
    return res.status(404).json({ error: 'task not found' });
  }
  const errors = tasks.validateUpdate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  res.json(tasks.updateTask(id, req.body));
});

app.delete('/tasks/:id', (req, res) => {
  if (!tasks.deleteTask(Number(req.params.id))) {
    return res.status(404).json({ error: 'task not found' });
  }
  res.status(204).end();
});

module.exports = app;
