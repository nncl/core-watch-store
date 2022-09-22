import { buildError, buildNext, buildOrders, buildReq, buildRes } from 'test/builders';
import { index } from '@/controllers/orders.controller';
import { StatusCodes } from 'http-status-codes';

describe('Controllers > Orders', () => {
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
});
