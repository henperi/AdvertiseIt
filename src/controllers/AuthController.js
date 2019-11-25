// Repos
import UserRepo from '../repositories/UserRepo';

// Helpers
import { hashPassword, comparePassword } from '../helpers/passwordHelpers';
import generateUniqueId from '../helpers/generateUniqueId';
import { generateUserAuthToken } from '../helpers/generateAuthToken';
import { setupTokenData, verifyToken } from '../helpers/tokenHelper';
import { AppResponse } from '../helpers/AppResponse';
import { trimify } from '../utils/objectHelper';

/**
 * Controller that handles everything relating to auth
 */
class AuthController {
  /**
   * @description controller method to create a new user
   * @param {*} req re
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async createUser(req, res) {
    const reqBody = trimify(req.body);
    const {
      email,
      password,
      phone,
      firstName,
      lastName = '',
      accountType,
      fcmToken,
    } = reqBody;

    try {
      const user = await UserRepo.getByEmailOrPhone({
        email: email.toLowerCase(),
        phone,
      });

      if (user) {
        return AppResponse.conflict(res, {
          message: 'This email or phone has been taken',
        });
      }

      const hashedPassword = hashPassword(password);
      const newUser = await UserRepo.create({
        email: email.toLowerCase(),
        phone,
        uniqueId: generateUniqueId(),
        password: hashedPassword,
        secretKey: `${generateUniqueId()}-${email.toLowerCase()}`,
        fcmToken,
        accountType,
        userProfile: { firstName, lastName },
      });

      const token = generateUserAuthToken(setupTokenData(newUser));

      return AppResponse.created(res, { data: { token } });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to authenticate a user
   * @param {*} req re
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async authenticateUser(req, res) {
    const reqBody = trimify(req.body);
    const { email, password, fcmToken } = reqBody;

    try {
      const user = await UserRepo.getByEmail(email.toLowerCase());

      if (!user) {
        return AppResponse.notFound(res, {
          message: 'Invalid login credentials',
        });
      }

      const isPasswordValid = comparePassword(password, user.password);

      if (!isPasswordValid) {
        return AppResponse.conflict(res, {
          message: 'Invalid login credentials',
        });
      }
      const token = generateUserAuthToken(setupTokenData(user));

      if (fcmToken) {
        user.update({
          fcmToken,
        });
      }

      return AppResponse.success(res, {
        message: 'Authenticated successfully',
        data: { token },
      });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to reset a user's password
   * @param {*} req re
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async resetUserPassword(req, res) {
    const reqBody = trimify(req.body);
    const { oldPassword, newPassword } = reqBody;
    const { resetId } = req.params;

    const decodedToken = verifyToken(resetId);

    if (!decodedToken) {
      return AppResponse.forbidden(res, {
        message: 'Invalid password reset credentials',
      });
    }

    try {
      const { id } = decodedToken;
      const user = await UserRepo.getById(id);

      if (!user) {
        return AppResponse.notFound(res, {
          message: 'Unable to process process password reset request',
        });
      }

      const isPasswordValid = comparePassword(oldPassword, user.password);

      if (!isPasswordValid) {
        return AppResponse.conflict(res, {
          message: 'Your old password is wrong',
        });
      }

      const hashedPassword = hashPassword(newPassword.trim());

      await user.update({
        password: hashedPassword,
        secretKey: `${generateUniqueId()}-${user.email}`,
      });

      return AppResponse.success(res, {
        message: 'Password updated successfully',
      });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to reset a user's password
   * @param {*} req re
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async updateFCMToken(req, res) {
    const reqBody = trimify(req.body);
    const { fcmToken } = reqBody;
    const { id } = res.locals.user;

    try {
      const user = await UserRepo.getById(id);

      if (!user) {
        return AppResponse.notFound(res, {
          message: 'User not found',
        });
      }

      await user.update({
        fcmToken,
      });

      return AppResponse.success(res, {
        message: 'FCM token updated successfully',
      });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to authenticate a user
   * @param {*} req re
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async facebookAuth(req, res) {
    // console.log(req.body);
    try {
      if (!req.user) {
        return AppResponse.unAuthorized(res, {
          message: 'User facebook credentials',
        });
      }
      const { user } = req;
      const token = generateUserAuthToken(setupTokenData(user));

      return AppResponse.success(res, {
        message: 'Authenticated user via facebook successfully',
        data: { token },
      });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }
}

export default AuthController;
