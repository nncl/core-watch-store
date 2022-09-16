import { findOrSave, listUsers, saveUser } from '@/database/service';
import { buildError, buildUser, buildUsers } from 'test/builders';
import { User } from '@/database/models/user.model';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@/utils';

jest.mock('@/database/models/user.model');
jest.mock('@/utils/logger');

JSON.parse = jest.fn();

describe('Service > Users', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a user when findOrSave is executed', async () => {
    const user = buildUser();

    jest.spyOn(User, 'findOrCreate').mockResolvedValueOnce(user);

    const savedUser = await findOrSave(user.email);
    const where = { email: user.email };

    expect(savedUser).toEqual(user);
    expect(User.findOrCreate).toHaveBeenCalledTimes(1);
    expect(User.findOrCreate).toHaveBeenCalledWith({ where });
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      `User located or created with email: ${user.email}`,
    );
  });

  it('should reject with an error when User.findOrCreate() fails',async () => {
    const user = buildUser();

    const error = buildError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to retrieve or save user with email: ${user.email}`,
    );

    jest.spyOn(User, 'findOrCreate').mockRejectedValueOnce(user);

    await expect(findOrSave(user.email)).rejects.toEqual(error);
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('should return a list of users', async () => {
    const users = buildUsers();

    jest.spyOn(User, 'findAll').mockResolvedValueOnce(users);

    const returnedUsers = await listUsers();

    expect(returnedUsers).toEqual(users);
    expect(User.findAll).toHaveBeenCalledTimes(1);
    expect(User.findAll).toHaveBeenCalledWith();
  });

  it('should reject with an error when User.findAll fails', async () => {
    const error = buildError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to retrieve users`,
    );

    jest.spyOn(User, 'findAll').mockRejectedValue(error);

    await expect(listUsers()).rejects.toEqual(error);
  });

  it('should save and return user', async () => {
    const data = {
      email: 'caue@gmail.com',
    };

    const user = {
      ...data,
      id: 1,
    };

    jest.spyOn(User, 'create').mockResolvedValueOnce(user);

    await expect(saveUser(data)).resolves.toEqual(user);
  });

  it('should reject with an error when saveUser is executed without any data', async () => {
    const error = buildError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to save user`,
    );

    await expect(saveUser()).rejects.toEqual(error);
    await expect(saveUser()).rejects.toThrowError(error);
  });
});
