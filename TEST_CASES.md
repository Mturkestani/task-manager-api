# Test Cases — Task Manager API

| ID | Area | Scenario | Steps | Expected result | Type | Status |
|----|------|----------|-------|-----------------|------|--------|
| TC-01 | Create task | Valid title | POST /tasks with `{ "title": "Buy milk" }` | 201, task returned with id and `done: false` | API | Automated |
| TC-02 | Create task | Missing title | POST /tasks with `{}` | 400, error "title is required" | API | Automated |
| TC-03 | Get task | Task does not exist | GET /tasks/999 | 404 | API | Automated |
| TC-04 | UI | Add a task from the page | Type a title, click Add | Task appears in the list | E2E | Automated |
| TC-05 | Create task | Empty / whitespace title | POST /tasks with `{ "title": "   " }` | 400 | API | Automated |
| TC-06 | Create task | Title over 100 characters | POST /tasks with a 101-character title | 400 | API | Automated |
| TC-07 | Update task | Mark a task as done | PUT /tasks/:id with `{ "done": true }` | 200, `done: true` | API | Automated |
| TC-08 | Delete task | Delete an existing task | DELETE /tasks/:id | 204, task no longer in GET /tasks | API | Automated |
| TC-09 | UI | Add an empty task | Click Add with an empty input | Error message shown | E2E | Automated |
| TC-10 | Performance | Smoke load | k6, 5 users for 10 s on GET /tasks | < 1% errors, p95 < 300 ms | Load | Automated |
