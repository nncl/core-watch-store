import { get } from '@/middleware/service.middleware';

describe('Middlewares > Service', () => {
  it('should add service to the request', () => {
    const req = {};
    const next = jest.fn().mockName('next');

    get(req, null, next);

    expect(req.service).toBeDefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(/* nothing */);
  });
});
