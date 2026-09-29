# Task Manager API

A small task management app: a REST API for creating, updating and deleting tasks, with a web page on top where you can add tasks, mark them as done, delete them and see how many are left. Every push runs the full test suite in a GitHub Actions CI pipeline.

- **Unit tests** (24) — Jest
- **API tests** (19) — Jest + Supertest
- **End-to-end tests** (15) — Jest + Puppeteer (headless Chrome)
- **Load / smoke test** — k6
- **CI pipeline** — GitHub Actions runs every test on each push and pull request

## Run it

```bash
npm install
npm start          # http://localhost:3000
```

## Run the tests

```bash
npm test           # all tests
npm run test:unit
npm run test:api
npm run test:e2e
npm run test:e2e:show  # E2E tests in a visible, slowed-down Chrome window
k6 run k6/smoke.js # needs the server running and k6 installed
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | /tasks | List all tasks |
| POST | /tasks | Create a task — body `{ "title": "..." }` |
| GET | /tasks/:id | Get one task |
| PUT | /tasks/:id | Update a task — body `{ "title": "...", "done": true }` |
| DELETE | /tasks/:id | Delete a task |

## Test cases

See [TEST_CASES.md](TEST_CASES.md).
