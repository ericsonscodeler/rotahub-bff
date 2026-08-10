import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Orders (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.ORDERS_SERVICE_URL =
      process.env.ORDERS_SERVICE_URL ?? 'http://localhost:8081';

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

  it('creates and fetches an order through the BFF', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        sender: { name: 'Loja Central', address: 'Av. Paulista, 1000' },
        recipient: { name: 'Joao Silva', address: 'Rua das Flores, 45' },
      })
      .expect(201);

    const orderId = createResponse.body.id;

    const getResponse = await request(app.getHttpServer())
      .get(`/api/orders/${orderId}`)
      .expect(200);

    expect(getResponse.body.id).toBe(orderId);
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
