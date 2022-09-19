import { validationResponse } from '@/controllers/utils';
import { logger } from '@/utils';
import { buildRes } from 'test/builders';
import { StatusCodes } from 'http-status-codes';

jest.mock('@/utils');

describe('Controllers > Utils', () => {
  it('should call res.status and res.json with proper data', () => {
    const res = buildRes();
    const errors = {
      array: jest
        .fn()
        .mockReturnValueOnce(['error 1', 'Error 2'])
        .mockName('errors'),
    };

    validationResponse(res, errors);

    expect(logger.error).toHaveBeenCalledTimes(1);

    expect(logger.error).toHaveBeenCalledWith('Validation failure', {
      errors: ['error 1', 'Error 2'],
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNPROCESSABLE_ENTITY);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      errors: ['error 1', 'Error 2'],
    });

    expect(errors.array).toHaveBeenCalledTimes(1);
  });
});
