import {
  buildError,
  buildNext,
  buildOrders,
  buildReq,
  buildRes,
} from 'test/builders';
import { create, index, validate } from '@/controllers/orders.controller';
import { StatusCodes } from 'http-status-codes';

import * as validator from 'express-validator';
import { validationResponse } from '@/controllers/utils';

jest.mock('express-validator');
jest.mock('@/controllers/utils');

JSON.stringify = jest.fn();

describe('Controllers > Orders', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return status 200 with a list or orders', async () => {
    const req = buildReq();
    const res = buildRes();
    const next = buildNext();
    const orders = buildOrders();

    jest.spyOn(req.service, 'listOrders').mockResolvedValueOnce(orders);

    await index(req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ orders });

    expect(req.service.listOrders).toHaveBeenCalledTimes(1);
    expect(req.service.listOrders).toHaveBeenCalledWith(req.user.id);
  });

  it('should forward an error when service.listOrder fails', async () => {
    const req = buildReq();
    const res = buildRes();
    const next = buildNext();
    const error = buildError(StatusCodes.INTERNAL_SERVER_ERROR, 'puts');

    jest.spyOn(req.service, 'listOrders').mockRejectedValueOnce(error);

    await index(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();

    expect(next).toBeCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should build a list of errors', () => {
    const method = 'create';
    const existsFn = jest
      .fn()
      .mockReturnValueOnce('Please provide a list of products');

    jest.spyOn(validator, 'body').mockReturnValueOnce({
      exists: existsFn,
    });

    const errors = validate(method);

    expect(errors).toHaveLength(1);
    expect(errors).toEqual(['Please provide a list of products']);

    expect(validator.body).toHaveBeenCalledTimes(1);
    expect(validator.body).toHaveBeenCalledWith(
      'products',
      `Please provide a list of products`,
    );
  });

  it('should throw an error when an unknown method is provided', () => {
    expect(() => {
      validate('unknown method name');
    }).toThrowError(`Please provide a valid method name`);
  });

  it('should return status 200 and the created order', async () => {
    const products = buildOrders();
    const req = buildReq({
      body: {
        products,
      },
    });
    const res = buildRes();
    const next = buildNext();

    const isEmpty = jest.fn().mockReturnValueOnce(true);

    jest.spyOn(validator, 'validationResult').mockReturnValueOnce({ isEmpty });

    jest.spyOn(req.service, 'saveOrder').mockReturnValueOnce({
      id: 123456,
    });

    await create(req, res, next);

    expect(isEmpty).toHaveBeenCalledTimes(1);

    expect(JSON.stringify).toHaveBeenCalledTimes(1);
    expect(JSON.stringify).toHaveBeenCalledWith(products);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ order: { id: 123456 } });

    expect(req.service.saveOrder).toHaveBeenCalledTimes(1);
    expect(req.service.saveOrder).toHaveBeenCalledWith({
      userid: req.user.id,
      products: JSON.stringify(products),
    });
  });

  it('should forward error when service.saveOrder fails', async () => {
    const products = buildOrders();
    const req = buildReq({
      body: {
        products,
      },
    });
    const res = buildRes();
    const next = buildNext();
    const error = buildError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Some error here',
    );

    const isEmpty = jest.fn().mockReturnValueOnce(true);

    jest.spyOn(validator, 'validationResult').mockReturnValueOnce({ isEmpty });

    jest.spyOn(req.service, 'saveOrder').mockRejectedValueOnce(error);

    await create(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return validation response when error bag is not empty', async () => {
    const req = buildReq();
    const res = buildRes();
    const next = buildNext();

    const errorBag = {
      isEmpty: jest.fn().mockReturnValueOnce(false),
    };

    jest.spyOn(validator, 'validationResult').mockReturnValueOnce(errorBag);

    expect(await create(req, res, next)).toBeUndefined();

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();

    expect(validationResponse).toHaveBeenCalledTimes(1);
    expect(validationResponse).toHaveBeenCalledWith(res, errorBag);
  });
});
