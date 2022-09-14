import { get } from '@/middleware/user.middleware';
import { appError } from '@/utils';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

import * as service from '@/database/service';
import { buildError, buildNext, buildReq } from 'test/builders';

jest.mock('@/database/service');

describe('Middlewares > User', () => {
  const error = buildError(
    `${ReasonPhrases.UNPROCESSABLE_ENTITY}: header should contain a valid email`,
    StatusCodes.UNPROCESSABLE_ENTITY,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should forward an error when an email is NOT provided in the headers', () => {
    const req = { headers: {} };
    const next = buildNext();

    get(req, null, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should forward an error when an email is provided in the headers but is invalid', () => {
    const req = {
      headers: {
        email: 'hello world@gmail.com',
      },
    };
    const next = buildNext();

    get(req, null, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return a user object given a valid email is provided', async () => {
    const email = 'hello@world.com';

    const req = buildReq({
      headers: {
        email,
      },
    });

    const next = buildNext();
    const resolved = {
      id: 1,
      email,
    };

    jest.spyOn(service, 'findOrSave').mockResolvedValueOnce([resolved]);

    await get(req, null, next);

    expect(req.user).toBeDefined();
    expect(req.user).toEqual(resolved);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(/* nothing */);
  });

  it('should return an error when service.findOrSave fails', async () => {
    const email = 'hello@world.com';

    const req = buildReq({
      headers: {
        email,
      },
    });

    delete req.user;

    const next = buildNext();

    jest.spyOn(service, 'findOrSave').mockRejectedValue(`An error occurred`);

    await get(req, null, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(`An error occurred`);
  });
});
