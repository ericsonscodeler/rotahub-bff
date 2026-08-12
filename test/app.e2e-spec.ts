import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Orders (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.ORDERS_SERVICE_URL =
      process.env.ORDERS_SERVICE_URL ?? 'http://localhost:8081';
    process.env.TRACKING_SERVICE_URL =
      process.env.TRACKING_SERVICE_URL ?? 'http://localhost:8082';
    process.env.NOTIFICATION_SERVICE_URL =
      process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:8084';

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

  function createOrder() {
    return request(app.getHttpServer())
      .post('/api/orders')
      .send({
        sender: {
          name: 'Loja Central',
          address: 'Av. Paulista, 1000',
          email: 'loja@example.com',
        },
        recipient: {
          name: 'Joao Silva',
          address: 'Rua das Flores, 45',
          email: 'joao@example.com',
        },
      });
  }

  it('creates an order and initializes tracking through the BFF', async () => {
    const response = await createOrder().expect(201);

    expect(response.body.status).toBe('CREATED');
    expect(response.body.tracking).toMatchObject({ status: 'AWAITING_PICKUP' });
  });

  it('combines order and tracking on GET', async () => {
    const created = await createOrder();
    const orderId = created.body.id;

    const response = await request(app.getHttpServer())
      .get(`/api/orders/${orderId}`)
      .expect(200);

    expect(response.body.id).toBe(orderId);
    expect(response.body.tracking).toMatchObject({ status: 'AWAITING_PICKUP' });
  });

  it('finds an order by tracking code', async () => {
    const created = await createOrder();

    const response = await request(app.getHttpServer())
      .get(`/api/orders/by-tracking-code/${created.body.trackingCode}`)
      .expect(200);

    expect(response.body.id).toBe(created.body.id);
    expect(response.body.tracking).toMatchObject({ status: 'AWAITING_PICKUP' });
  });

  it('returns 404 for an unknown tracking code', () => {
    return request(app.getHttpServer())
      .get('/api/orders/by-tracking-code/RH-DOESNOTEXIST')
      .expect(404);
  });

  it('adds a tracking event through the BFF', async () => {
    const created = await createOrder();
    const orderId = created.body.id;

    const response = await request(app.getHttpServer())
      .post(`/api/orders/${orderId}/tracking-events`)
      .send({ status: 'PICKED_UP', timestamp: new Date().toISOString() })
      .expect(200);

    expect(response.body.status).toBe('PICKED_UP');
  });

  it('returns 404 when order does not exist', () => {
    return request(app.getHttpServer())
      .get('/api/orders/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('rejects invalid payloads with 400', () => {
    return request(app.getHttpServer())
      .post('/api/orders')
      .send({})
      .expect(400);
  });
});
