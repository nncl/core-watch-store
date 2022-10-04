import * as service from '@/database/service';
import { buildError, buildOrder, buildOrders } from 'test/builders';
import { buildCall } from 'test/builders.integration';
import { StatusCodes } from 'http-status-codes';

jest.mock('@/database/service');

describe('Router > Integration > Orders', () => {
  it('should return status 200 and a list of orders', async done => {
    const orders = buildOrders();
    jest.spyOn(service, 'listOrders').mockReturnValueOnce(orders);

    const res = await buildCall('/api/order');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ orders });

    done();
  });

  it('should return status 500 and an error message when listOrder rejects', async done => {
    const error = buildError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Ops, something went wrong!`,
    );

    jest.spyOn(service, 'listOrders').mockRejectedValueOnce(error);

    const res = await buildCall('/api/order');

    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body).toEqual({ message: `Ops, something went wrong!` });

    done();
  });

  it('should return status code 200 and the newly created product', async done => {
    jest.spyOn(service, 'saveOrder').mockResolvedValueOnce({
      id: 1234,
    });

    const res = await buildCall('/api/order', 'post', {
      products: buildOrder(),
    });

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body).toEqual({ order: { id: 1234 } });

    done();
  });

  it('should return status code 500 and an error message when service.saveOrder() fails', async done => {
    const error = buildError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Ops, server went down!`,
    );

    jest.spyOn(service, 'saveOrder').mockRejectedValueOnce(error);

    const res = await buildCall('/api/order', 'post', {
      products: buildOrder(),
    });

    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.body).toEqual({ message: 'Ops, server went down!' });

    done();
  });

  it('should return status code 422 and an error message when validation errors are returned', async done => {
    const res = await buildCall('/api/order', 'post');

    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(res.body).toEqual({
      errors: [
        {
          location: 'body',
          msg: 'Please provide a list of products',
          param: 'products',
        },
      ],
    });

    done();
  });
});
