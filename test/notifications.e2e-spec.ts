import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Notifications (e2e)', () => {
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

  it('lists notifications for an order through the BFF', async () => {
    const created = await request(app.getHttpServer())
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

    const response = await request(app.getHttpServer())
      .get(`/api/orders/${created.body.id}/notifications`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
