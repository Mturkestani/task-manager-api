// End-to-end tests: open the real page in a headless browser with Puppeteer
// and use it like a user would.
const puppeteer = require('puppeteer');
const app = require('../../src/app');
const tasks = require('../../src/tasks');

let server;
let browser;
let page;
let baseUrl;

beforeAll(async () => {
  server = app.listen(0); // port 0 = pick any free port
  baseUrl = `http://localhost:${server.address().port}`;
  browser = await puppeteer.launch({ args: ['--no-sandbox'] });
});

afterAll(async () => {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(async () => {
  tasks.reset();
  page = await browser.newPage();
  await page.goto(baseUrl);
});

afterEach(async () => {
  await page.close();
});

test('user can add a task and see it in the list', async () => {
  await page.type('#task-title', 'Buy milk');
  await page.click('#add-task');
  await page.waitForSelector('#task-list li');

  const items = await page.$$eval('#task-list li', (lis) => lis.map((li) => li.textContent));
  expect(items).toEqual(['Buy milk']);
});

test('user sees an error message when adding an empty task', async () => {
  await page.click('#add-task');
  await page.waitForFunction(() => document.querySelector('#error').textContent !== '');

  const message = await page.$eval('#error', (el) => el.textContent);
  expect(message).toBe('title is required');

  const items = await page.$$('#task-list li');
  expect(items).toHaveLength(0);
});
