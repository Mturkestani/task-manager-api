// API tests: send real HTTP requests to the app with Supertest and check the responses —
// the status code, the body, and that the change really happened.
const request = require('supertest');
const app = require('../../src/app');
const tasks = require('../../src/tasks');

// Test isolation: every test starts with no tasks.
beforeEach(() => {
  tasks.reset();
});

// Helper: create a task through the API (used in the Arrange step of many tests).
async function createTask(title) {
  const res = await request(app).post('/tasks').send({ title });
  return res.body;
}

describe('GET /tasks', () => {
  test('returns 200 and an empty list at the start', async () => {
    const res = await request(app).get('/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns every task that was created', async () => {
    await createTask('A');
    await createTask('B');

    const res = await request(app).get('/tasks');

    expect(res.body.map((t) => t.title)).toEqual(['A', 'B']);
  });

  test('responds with JSON', async () => {
    const res = await request(app).get('/tasks');

    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('POST /tasks', () => {
  test('creates a task and returns 201', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Buy milk' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, title: 'Buy milk', done: false });
  });

  test('the new task appears in GET /tasks', async () => {
    await request(app).post('/tasks').send({ title: 'Buy milk' });

    const res = await request(app).get('/tasks');

    expect(res.body).toHaveLength(1);
  });

  test('returns 400 when the title is missing', async () => {
    const res = await request(app).post('/tasks').send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('title is required');
  });

  test('returns 400 when the title is too long', async () => {
    const res = await request(app).post('/tasks').send({ title: 'a'.repeat(101) });

    expect(res.status).toBe(400);
  });

  test('does not save an invalid task', async () => {
    await request(app).post('/tasks').send({ title: '' });

    const res = await request(app).get('/tasks');

    expect(res.body).toEqual([]);
  });
});

describe('GET /tasks/:id', () => {
  test('returns 200 and the task', async () => {
    const created = await createTask('Buy milk');

    const res = await request(app).get(`/tasks/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(created);
  });

  test('returns 404 for a task that does not exist', async () => {
    const res = await request(app).get('/tasks/999');

    expect(res.status).toBe(404);
  });

  test('returns 404 when the id is not a number', async () => {
    const res = await request(app).get('/tasks/abc');

    expect(res.status).toBe(404);
  });
});

describe('PUT /tasks/:id', () => {
  test('marks a task as done and returns 200', async () => {
    const created = await createTask('Buy milk');

    const res = await request(app).put(`/tasks/${created.id}`).send({ done: true });

    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  test('changes the title', async () => {
    const created = await createTask('Buy milk');

    const res = await request(app).put(`/tasks/${created.id}`).send({ title: 'Buy eggs' });

    expect(res.body.title).toBe('Buy eggs');
  });

  test('returns 400 when done is not a boolean', async () => {
    const created = await createTask('Buy milk');

    const res = await request(app).put(`/tasks/${created.id}`).send({ done: 'yes' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('done must be true or false');
  });

  test('returns 404 for a task that does not exist', async () => {
    const res = await request(app).put('/tasks/999').send({ done: true });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  test('deletes a task and returns 204', async () => {
    const created = await createTask('Buy milk');

    const res = await request(app).delete(`/tasks/${created.id}`);

    expect(res.status).toBe(204);
  });

  test('the deleted task is gone from GET /tasks', async () => {
    const created = await createTask('Buy milk');

    await request(app).delete(`/tasks/${created.id}`);
    const res = await request(app).get('/tasks');

    expect(res.body).toEqual([]);
  });

  test('returns 404 for a task that does not exist', async () => {
    const res = await request(app).delete('/tasks/999');

    expect(res.status).toBe(404);
  });

  test('returns 404 when deleting the same task twice', async () => {
    const created = await createTask('Buy milk');

    await request(app).delete(`/tasks/${created.id}`);
    const res = await request(app).delete(`/tasks/${created.id}`);

    expect(res.status).toBe(404);
  });
});
