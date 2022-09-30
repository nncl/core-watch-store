import supertest from 'supertest';
import app from '@/app';
import * as service from '@/database/service';
import { buildUser } from 'test/builders';

jest.mock('@/database/service');

export function buildCall(endpoint, method = 'get', body = null) {
  const user = buildUser();
  const request = supertest(app);

  jest.spyOn(service, 'findOrSave').mockReturnValue([user]);

  return request[method](endpoint).send(body).set('email', user.email);
}
