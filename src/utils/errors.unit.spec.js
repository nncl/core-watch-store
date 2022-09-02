import { logger } from '@/utils/logger';
import { appError } from '@/utils/errors';
import createError from 'http-errors';
import { StatusCodes } from 'http-status-codes';

jest.mock('@/utils/logger');
jest.mock('http-errors');

describe('Utils > Errors', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should execute logger.error', () => {
    appError('Error message');

    expect(logger.error).toHaveBeenCalledTimes(1);

    expect(logger.error).toHaveBeenCalledWith('Error message');
  });

  it('should execute createError with message and default status code', () => {
    appError('Error message');

    expect(createError).toHaveBeenCalledTimes(1);
    expect(createError).toHaveBeenCalledWith(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error message',
    );
  });

  it('should execute createError with message and provided status code', () => {
    appError('Error message', StatusCodes.BAD_REQUEST);

    expect(createError).toHaveBeenCalledTimes(1);
    expect(createError).toHaveBeenCalledWith(
      StatusCodes.BAD_REQUEST,
      'Error message',
    );
  });
});
