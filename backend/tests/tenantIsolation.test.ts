import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import { BusinessType } from '../src/constants/enums';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Multi-Tenant Data Isolation Security Tests', () => {
  let orgAToken: string;
  let orgBToken: string;
  let orgAProductId: string;

  it('1. Register Organization A (Bakery)', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({
        name: 'Alice Owner',
        email: 'alice@bakery.com',
        password: 'Password123!',
        businessName: 'ABC Bakery',
        businessType: BusinessType.BAKERY
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    orgAToken = res.body.data.accessToken;
  });

  it('2. Register Organization B (Restaurant)', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({
        name: 'Bob Owner',
        email: 'bob@restaurant.com',
        password: 'Password123!',
        businessName: 'XYZ Restaurant',
        businessType: BusinessType.RESTAURANT
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    orgBToken = res.body.data.accessToken;
  });

  it('3. Organization A creates a Product', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${orgAToken}`)
      .send({
        name: 'Chocolate Muffin',
        sellingPrice: 4.5,
        costPrice: 1.5,
        currentStock: 50
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBeDefined();
    orgAProductId = res.body.data._id;
  });

  it('4. Organization B MUST NOT see Organization A product', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${orgBToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Org B should have 0 products
    const foundProduct = res.body.data.find((p: any) => p._id === orgAProductId);
    expect(foundProduct).toBeUndefined();
    expect(res.body.data.length).toBe(0);
  });

  it('5. Organization B CANNOT update Organization A product', async () => {
    const res = await request(app)
      .put(`/api/v1/products/${orgAProductId}`)
      .set('Authorization', `Bearer ${orgBToken}`)
      .send({
        name: 'Hacked Muffin',
        sellingPrice: 99.0
      });

    expect(res.status).toBe(404); // Should report not found or access denied
    expect(res.body.success).toBe(false);
  });

  it('6. Organization A CAN see its own product', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${orgAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0]._id).toBe(orgAProductId);
  });
});
