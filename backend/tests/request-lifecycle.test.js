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

describe('Request lifecycle', () => {
  let beneficiaryToken;
  let volunteerToken;
  let requestId;

  beforeAll(async () => {
    const ts = Date.now();

    const benRes = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Beneficiary User',
        email: `beneficiary_${ts}@example.com`,
        phone: '01000000001',
        password: 'Password123!',
        role: 'beneficiary',
      });
    beneficiaryToken = benRes.body.data.token;

    const volRes = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Volunteer User',
        email: `volunteer_${ts}@example.com`,
        phone: '01000000002',
        password: 'Password123!',
        role: 'volunteer',
      });
    volunteerToken = volRes.body.data.token;
  });

  it('creates, accepts, and completes a request', async () => {
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${beneficiaryToken}`)
      .send({
        type: 'transportation',
        description: 'Need assistance for appointment',
        location_lat: 30.0444,
        location_lng: 31.2357,
        location_address: 'Cairo',
      });

    expect(createRes.statusCode).toBe(201);
    requestId = createRes.body.data.id;

    const nearbyRes = await request(app)
      .get('/api/requests/nearby')
      .set('Authorization', `Bearer ${volunteerToken}`);

    expect(nearbyRes.statusCode).toBe(200);

    const acceptRes = await request(app)
      .patch(`/api/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${volunteerToken}`);

    expect(acceptRes.statusCode).toBe(200);

    const completeRes = await request(app)
      .patch(`/api/requests/${requestId}/complete`)
      .set('Authorization', `Bearer ${beneficiaryToken}`);

    expect(completeRes.statusCode).toBe(200);
  });
});

