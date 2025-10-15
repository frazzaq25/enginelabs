import request from 'supertest';
import app from '../src/app';

describe('Healthcheck endpoint', () => {
  it('responds with application health metadata', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(typeof response.body.uptime).toBe('number');
    expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('omits the x-powered-by header for security', async () => {
    const response = await request(app).get('/health');

    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
