// Unit tests: test the business logic directly, without HTTP.
const tasks = require('../../src/tasks');

beforeEach(() => tasks.reset());

describe('validateTask', () => {
  test('accepts a valid title', () => {
    expect(tasks.validateTask({ title: 'Buy milk' })).toEqual([]);
  });

  test('rejects a missing title', () => {
    expect(tasks.validateTask({})).toContain('title is required');
  });

  test('rejects a whitespace-only title', () => {
    expect(tasks.validateTask({ title: '   ' })).toContain('title is required');
  });

  test('accepts a title of exactly 100 characters', () => {
    expect(tasks.validateTask({ title: 'a'.repeat(100) })).toEqual([]);
  });

  test('rejects a title longer than 100 characters', () => {
    expect(tasks.validateTask({ title: 'a'.repeat(101) })).toContain('title must be 100 characters or less');
  });
});

describe('createTask', () => {
  test('creates a task with an id and done = false', () => {
    const task = tasks.createTask({ title: 'Buy milk' });
    expect(task).toEqual({ id: 1, title: 'Buy milk', done: false });
  });

  test('trims spaces from the title', () => {
    expect(tasks.createTask({ title: '  Buy milk  ' }).title).toBe('Buy milk');
  });

  test('gives each new task a different id', () => {
    const a = tasks.createTask({ title: 'A' });
    const b = tasks.createTask({ title: 'B' });
    expect(a.id).not.toBe(b.id);
  });
});

describe('validateUpdate', () => {
  test('rejects done when it is not a boolean', () => {
    expect(tasks.validateUpdate({ done: 'yes' })).toContain('done must be true or false');
  });

  test('rejects an empty title', () => {
    expect(tasks.validateUpdate({ title: '' })).toContain('title is required');
  });
});

describe('updateTask', () => {
  test('marks a task as done', () => {
    const task = tasks.createTask({ title: 'Buy milk' });
    expect(tasks.updateTask(task.id, { done: true }).done).toBe(true);
  });

  test('returns undefined for a task that does not exist', () => {
    expect(tasks.updateTask(999, { done: true })).toBeUndefined();
  });
});

describe('deleteTask', () => {
  test('removes the task from the list', () => {
    const task = tasks.createTask({ title: 'Buy milk' });
    expect(tasks.deleteTask(task.id)).toBe(true);
    expect(tasks.listTasks()).toEqual([]);
  });

  test('returns false for a task that does not exist', () => {
    expect(tasks.deleteTask(999)).toBe(false);
  });
});
