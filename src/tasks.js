// Business logic for tasks. Data lives in memory — no database needed.

let tasks = [];
let nextId = 1;

function validateTask(input) {
  const errors = [];
  if (!input || typeof input.title !== 'string' || input.title.trim() === '') {
    errors.push('title is required');
  } else if (input.title.length > 100) {
    errors.push('title must be 100 characters or less');
  }
  return errors;
}

function listTasks() {
  return tasks;
}

function createTask(input) {
  const task = { id: nextId++, title: input.title.trim(), done: false };
  tasks.push(task);
  return task;
}

function getTask(id) {
  return tasks.find((t) => t.id === id);
}

function validateUpdate(changes) {
  const errors = [];
  if (!changes || typeof changes !== 'object') {
    return ['body must be an object'];
  }
  if ('title' in changes) {
    errors.push(...validateTask({ title: changes.title }));
  }
  if ('done' in changes && typeof changes.done !== 'boolean') {
    errors.push('done must be true or false');
  }
  return errors;
}

function updateTask(id, changes) {
  const task = getTask(id);
  if (!task) return undefined;
  if ('title' in changes) task.title = changes.title.trim();
  if ('done' in changes) task.done = changes.done;
  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

function reset() {
  tasks = [];
  nextId = 1;
}

module.exports = {
  validateTask,
  validateUpdate,
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  reset
};
