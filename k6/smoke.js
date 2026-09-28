// k6 smoke test: a few virtual users hit the API for a short time.
// Run locally:  k6 run k6/smoke.js   (with the server running on port 3000)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '10s',
  thresholds: {
    http_req_failed: ['rate<0.01'],   // less than 1% of requests may fail
    http_req_duration: ['p(95)<300'] // 95% of requests under 300 ms
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/tasks`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
