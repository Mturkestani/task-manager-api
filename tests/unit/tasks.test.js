// Unit tests: call the functions in src/tasks.js directly — no server, no HTTP.
// Every test follows the same pattern: Arrange (prepare) → Act (call) → Assert (expect).
const tasks = require('../../src/tasks');

// Test isolation: start every test with an empty task list and nextId = 1.
beforeEach(() => {
  tasks.reset();
});

describe('validateTask', () => {
  // Happy path — valid titles (equivalence partitioning: English, Arabic)
  test('accepts a valid title', () => {
    expect(tasks.validateTask({ title: 'Buy milk' })).toEqual([]);
  });

  test('accepts an Arabic title', () => {
    expect(tasks.validateTask({ title: 'اشتري حليب' })).toEqual([]);
  });

  // Empty titles — all should be rejected
  test('rejects an empty title', () => {
    expect(tasks.validateTask({ title: '' })).toContain('title is required');
  });

  test('rejects a whitespace-only title', () => {
    expect(tasks.validateTask({ title: '   ' })).toContain('title is required');
  });

  test('rejects a missing title', () => {
    expect(tasks.validateTask({})).toContain('title is required');
  });

  test('rejects a title that is not a string', () => {
    expect(tasks.validateTask({ title: 123 })).toContain('title is required');
  });

  // Boundary value analysis — the limit is 100 characters
  test('accepts a title of exactly 100 characters', () => {
    expect(tasks.validateTask({ title: 'a'.repeat(100) })).toEqual([]);
  });

  test('rejects a title of 101 characters', () => {
    expect(tasks.validateTask({ title: 'a'.repeat(101) })).toContain(
      'title must be 100 characters or less'
    );
  });
});

describe('createTask', () => {
  test('creates a task with an id and done = false', () => {
    const task = tasks.createTask({ title: 'Buy milk' });
    expect(task).toEqual({ id: 1, title: 'Buy milk', done: false });
  });

  test('trims spaces from the title', () => {
    const task = tasks.createTask({ title: '  Buy milk  ' });
    expect(task.title).toBe('Buy milk');
  });

  test('gives each new task a different id', () => {
    const a = tasks.createTask({ title: 'A' });
    const b = tasks.createTask({ title: 'B' });
    expect(a.id).not.toBe(b.id);
  });

  test('adds the task to the list', () => {
    tasks.createTask({ title: 'Buy milk' });
    expect(tasks.listTasks()).toHaveLength(1);
  });
});

describe('getTask', () => {
  test('returns the task with the given id', () => {
    const created = tasks.createTask({ title: 'Buy milk' });
    expect(tasks.getTask(created.id)).toEqual(created);
  });

  test('returns undefined for a task that does not exist', () => {
    expect(tasks.getTask(999)).toBeUndefined();
  });
});

describe('validateUpdate', () => {
  test('accepts done = true', () => {
    expect(tasks.validateUpdate({ done: true })).toEqual([]);
  });

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

  test('changes the title', () => {
    const task = tasks.createTask({ title: 'Buy milk' });
    expect(tasks.updateTask(task.id, { title: 'Buy eggs' }).title).toBe('Buy eggs');
  });

  test('returns undefined for a task that does not exist', () => {
    expect(tasks.updateTask(999, { done: true })).toBeUndefined();
  });
});

describe('deleteTask', () => {
  test('deletes an existing task and returns true', () => {
    const task = tasks.createTask({ title: 'Buy milk' });
    expect(tasks.deleteTask(task.id)).toBe(true);
    expect(tasks.getTask(task.id)).toBeUndefined(); // make sure it is really gone
  });

  test('returns false for a task that does not exist', () => {
    expect(tasks.deleteTask(999)).toBe(false);
  });

  test('returns false when deleting the same task twice', () => {
    const task = tasks.createTask({ title: 'Buy milk' });
    tasks.deleteTask(task.id);
    expect(tasks.deleteTask(task.id)).toBe(false);
  });

  test('deletes only the chosen task', () => {
    tasks.createTask({ title: 'A' });
    const b = tasks.createTask({ title: 'B' });
    tasks.createTask({ title: 'C' });

    tasks.deleteTask(b.id);

    expect(tasks.listTasks().map((t) => t.title)).toEqual(['A', 'C']);
  });
});
