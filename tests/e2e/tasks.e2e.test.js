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

// Helper: read the text of every task shown in the list.
async function visibleTasks() {
  return page.$$eval('#task-list li', (items) => items.map((li) => li.textContent));
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
