// API tests: send real HTTP requests to the app with Supertest and check the responses.
const request = require('supertest');
const app = require('../../src/app');
const tasks = require('../../src/tasks');

beforeEach(() => tasks.reset());

describe('POST /tasks', () => {
  test('creates a task and returns 201', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Buy milk');
  });

  test('returns 400 when the title is missing', async () => {
    const res = await request(app).post('/tasks').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /tasks/:id', () => {
  test('returns 404 for a task that does not exist', async () => {
    const res = await request(app).get('/tasks/999');
    expect(res.status).toBe(404);
  });

  test('returns 200 and the task after creating it', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Buy milk' });
    const res = await request(app).get(`/tasks/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(created.body);
  });
});

describe('GET /tasks', () => {
  test('returns an empty list at the start', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns every task that was created', async () => {
    await request(app).post('/tasks').send({ title: 'A' });
    await request(app).post('/tasks').send({ title: 'B' });
    const res = await request(app).get('/tasks');
    expect(res.body.map((t) => t.title)).toEqual(['A', 'B']);
  });
});

describe('PUT /tasks/:id', () => {
  test('marks a task as done and returns 200', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Buy milk' });
    const res = await request(app).put(`/tasks/${created.body.id}`).send({ done: true });
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  test('returns 400 when done is not a boolean', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Buy milk' });
    const res = await request(app).put(`/tasks/${created.body.id}`).send({ done: 'yes' });
    expect(res.status).toBe(400);
  });

  test('returns 404 for a task that does not exist', async () => {
    const res = await request(app).put('/tasks/999').send({ done: true });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  test('deletes a task and returns 204', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Buy milk' });
    const res = await request(app).delete(`/tasks/${created.body.id}`);
    expect(res.status).toBe(204);

    const list = await request(app).get('/tasks');
    expect(list.body).toEqual([]);
  });

  test('returns 404 for a task that does not exist', async () => {
    const res = await request(app).delete('/tasks/999');
    expect(res.status).toBe(404);
  });
});
