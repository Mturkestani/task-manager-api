# Task Manager API

A small task management app: a REST API for creating, updating and deleting tasks, with a simple web page on top. Every push runs the full test suite in a GitHub Actions CI pipeline.

- **Unit tests** — Jest
- **API tests** — Jest + Supertest
- **End-to-end tests** — Jest + Puppeteer (headless Chrome)
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
