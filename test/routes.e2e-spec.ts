import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Routes (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.ROUTING_SERVICE_URL =
      process.env.ROUTING_SERVICE_URL ?? 'http://localhost:8083';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  function createRoute() {
    return request(app.getHttpServer())
      .post('/api/routes')
      .send({
        stops: [
          {
            orderId: '11111111-1111-4111-8111-111111111111',
            address: 'Congonhas',
            lat: -23.6266,
            lng: -46.6553,
          },
          {
            orderId: '22222222-2222-4222-8222-222222222222',
            address: 'Paulista',
            lat: -23.5613,
            lng: -46.6565,
          },
        ],
      });
  }

  it('creates an optimized route through the BFF', async () => {
    const response = await createRoute().expect(201);

    expect(response.body.status).toBe('PLANNED');
    expect(response.body.stops).toHaveLength(2);
    expect(response.body.totalDistanceKm).toBeGreaterThan(0);
  });

  it('gets a route by id', async () => {
    const created = await createRoute();

    const response = await request(app.getHttpServer())
      .get(`/api/routes/${created.body.id}`)
      .expect(200);

    expect(response.body.id).toBe(created.body.id);
  });

  it('returns 404 for an unknown route', () => {
    return request(app.getHttpServer())
      .get('/api/routes/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('rejects a route with no stops', () => {
    return request(app.getHttpServer())
      .post('/api/routes')
      .send({ stops: [] })
      .expect(400);
  });
});
