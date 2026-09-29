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
| TC-11 | UI | Mark a task as done | Tick the checkbox | Task is crossed out; saved as `done: true` | E2E | Automated |
| TC-12 | UI | Mark a task as not done | Untick the checkbox | Task is no longer crossed out; saved as `done: false` | E2E | Automated |
| TC-13 | UI | Done state survives a reload | Tick a task, reload the page | Checkbox is still ticked | E2E | Automated |
| TC-14 | UI | Tasks-left counter | Add 2 tasks, then tick one | Shows "2 tasks left", then "1 task left" | E2E | Automated |
| TC-15 | UI | Delete a task | Hover a task, click Delete | Task disappears from the page and from GET /tasks | E2E | Automated |
| TC-16 | UI | Delete only the chosen task | Add A, B, C; delete B | List shows A and C | E2E | Automated |
