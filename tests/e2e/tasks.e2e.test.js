// End-to-end tests: open the real page in a headless Chrome with Puppeteer
// and use it like a user would — type, click, and check what appears on screen.
const puppeteer = require('puppeteer');
const app = require('../../src/app');
const tasks = require('../../src/tasks');

let server;
let browser;
let page;
let baseUrl;

// Once, before all tests: start the app and open the browser.
beforeAll(async () => {
  server = app.listen(0); // port 0 = pick any free port
  baseUrl = `http://localhost:${server.address().port}`;
  // SHOW_BROWSER=true opens a visible Chrome window and slows every action down,
  // so you can watch the test. Normally (and in CI) Chrome runs headless.
  const showBrowser = process.env.SHOW_BROWSER === 'true';
  browser = await puppeteer.launch({
    headless: !showBrowser,
    slowMo: showBrowser ? 100 : 0,
    args: ['--no-sandbox']
  });
});

// Once, after all tests: close the browser and stop the app.
afterAll(async () => {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
});

// Before every test: empty task list + a fresh tab on the page.
beforeEach(async () => {
  tasks.reset();
  page = await browser.newPage();
  await page.goto(baseUrl);
});

// After every test: close the tab.
afterEach(async () => {
  await page.close();
});

// Helper: type a title and click Add, like a user.
async function addTask(title) {
  await page.type('#task-title', title);
  await page.click('#add-task');
}

// Helper: read the title of every task shown in the list.
// Reads only .task-title, so other text in the row (like the Delete button) is ignored.
async function visibleTasks() {
  return page.$$eval('#task-list .task-title', (items) => items.map((el) => el.textContent));
}

// Helper: wait until the list shows exactly `n` tasks.
async function waitForTaskCount(n) {
  await page.waitForFunction(
    (expected) => document.querySelectorAll('#task-list li').length === expected,
    {},
    n
  );
}

// Helper: read the tasks straight from the API (to check the change was really saved).
async function savedTasks() {
  const res = await fetch(`${baseUrl}/tasks`);
  return res.json();
}

test('page shows the title "Task Manager"', async () => {
  const heading = await page.$eval('h1', (el) => el.textContent);
  expect(heading).toBe('Task Manager');
});

test('list is empty when there are no tasks', async () => {
  expect(await visibleTasks()).toEqual([]);
});

test('user can add a task and see it in the list', async () => {
  await addTask('Buy milk');
  await page.waitForSelector('#task-list li');

  expect(await visibleTasks()).toEqual(['Buy milk']);
});

test('tasks appear in the order they were added', async () => {
  await addTask('Buy milk');
  await page.waitForFunction(() => document.querySelectorAll('#task-list li').length === 1);
  await addTask('Finish CV');
  await page.waitForFunction(() => document.querySelectorAll('#task-list li').length === 2);

  expect(await visibleTasks()).toEqual(['Buy milk', 'Finish CV']);
});

test('input is cleared after adding a task', async () => {
  await addTask('Buy milk');
  await page.waitForSelector('#task-list li');

  const value = await page.$eval('#task-title', (el) => el.value);
  expect(value).toBe('');
});

test('user sees an error message when adding an empty task', async () => {
  await page.click('#add-task');
  await page.waitForFunction(() => document.querySelector('#error').textContent !== '');

  const message = await page.$eval('#error', (el) => el.textContent);
  expect(message).toBe('title is required');
  expect(await visibleTasks()).toEqual([]);
});

test('error message disappears after adding a valid task', async () => {
  await page.click('#add-task');
  await page.waitForFunction(() => document.querySelector('#error').textContent !== '');

  await addTask('Buy milk');
  await page.waitForSelector('#task-list li');

  const message = await page.$eval('#error', (el) => el.textContent);
  expect(message).toBe('');
});

test('tasks are still there after reloading the page', async () => {
  await addTask('Buy milk');
  await page.waitForSelector('#task-list li');

  await page.reload();
  await page.waitForSelector('#task-list li');

  expect(await visibleTasks()).toEqual(['Buy milk']);
});

describe('mark as done', () => {
  test('ticking the checkbox marks the task as done', async () => {
    await addTask('Buy milk');
    await waitForTaskCount(1);

    await page.click('#task-list li .task-toggle');
    await page.waitForSelector('#task-list li.done');

    const saved = await savedTasks();
    expect(saved[0].done).toBe(true);
  });

  test('unticking the checkbox marks the task as not done', async () => {
    await addTask('Buy milk');
    await waitForTaskCount(1);

    await page.click('#task-list li .task-toggle');
    await page.waitForSelector('#task-list li.done');
    await page.click('#task-list li .task-toggle');
    await page.waitForSelector('#task-list li:not(.done)');

    const saved = await savedTasks();
    expect(saved[0].done).toBe(false);
  });

  test('a done task stays done after reloading the page', async () => {
    await addTask('Buy milk');
    await waitForTaskCount(1);
    await page.click('#task-list li .task-toggle');
    await page.waitForSelector('#task-list li.done');

    await page.reload();
    await page.waitForSelector('#task-list li.done');

    const checked = await page.$eval('#task-list li .task-toggle', (el) => el.checked);
    expect(checked).toBe(true);
  });
});

describe('tasks-left counter', () => {
  test('shows how many tasks are not done yet', async () => {
    await addTask('Buy milk');
    await waitForTaskCount(1);
    await addTask('Finish CV');
    await waitForTaskCount(2);

    const text = await page.$eval('#task-count', (el) => el.textContent);
    expect(text).toBe('2 tasks left');
  });

  test('goes down when a task is marked as done', async () => {
    await addTask('Buy milk');
    await waitForTaskCount(1);
    await addTask('Finish CV');
    await waitForTaskCount(2);

    await page.click('#task-list li:first-child .task-toggle');
    await page.waitForFunction(
      () => document.querySelector('#task-count').textContent === '1 task left'
    );
  });
});

describe('delete', () => {
  test('clicking Delete removes the task from the page and the server', async () => {
    await addTask('Buy milk');
    await waitForTaskCount(1);

    await page.hover('#task-list li');
    await page.click('#task-list li .task-delete');
    await waitForTaskCount(0);

    expect(await visibleTasks()).toEqual([]);
    expect(await savedTasks()).toEqual([]);
  });

  test('deletes only the chosen task', async () => {
    await addTask('A');
    await waitForTaskCount(1);
    await addTask('B');
    await waitForTaskCount(2);
    await addTask('C');
    await waitForTaskCount(3);

    await page.hover('#task-list li:nth-child(2)');
    await page.click('#task-list li:nth-child(2) .task-delete');
    await waitForTaskCount(2);

    expect(await visibleTasks()).toEqual(['A', 'C']);
  });
});
