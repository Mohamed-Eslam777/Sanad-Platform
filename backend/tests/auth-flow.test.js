const request = require('supertest');
const app = require('../app');
const sequelize = require('../src/config/db');

// Sync test DB with a clean slate before all tests in this suite
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// Close DB connection after all tests to prevent Jest from hanging
afterAll(async () => {
  await sequelize.close();
});

describe('Auth flow', () => {
  it('registers then logs in a user', async () => {
    const email = `test_${Date.now()}@example.com`;

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Test User',
        email,
        phone: '01000000000',
        password: 'Password123!',
        role: 'beneficiary',
      });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.data).toHaveProperty('token');
    expect(registerRes.body.data.user).toMatchObject({
      email,
      role: 'beneficiary',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password123!' });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.data).toHaveProperty('token');
  });
});

