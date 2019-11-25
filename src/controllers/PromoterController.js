// Repos
import UserRepo from '../repositories/UserRepo';
import PromoterRequestRepo from '../repositories/PromoterRequestRepo';

// Helpers
import { AppResponse } from '../helpers/AppResponse';
import NotificationRepo from '../repositories/NotificationRepo';
import { NOTIFICATIONSCOPE } from '../helpers/notificationScopes';

/**
 * Controller that handles everything relating to Users
 */
class PromoterController {
  /**
   * @description controller method to make a user a promoter
   * [AdminGuard]
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async approveBecomePromoter(req, res) {
    const { userId } = req.params;
    const { id } = res.locals.admin;

    try {
      const getUser = () => UserRepo.getById(userId);
      const getPromoterRequest = () =>
        PromoterRequestRepo.getByUserId(userId);

      const [user, promoterRequest] = await Promise.all([
        getUser(),
        getPromoterRequest(),
      ]);

      if (!user) {
        return AppResponse.notFound(res, {
          message: 'User not found',
        });
      }
      if (user.accountType === 'Promoter') {
        return AppResponse.badRequest(res, {
          message: 'User is already a promoter',
        });
      }

      await user.update({ accountType: 'Promoter' });
      /**
       * TODO: Remember to store the admin who updated the user
       * in a database for reference purpose.
       * const { id } = res.locals.admin;
       */
      if (promoterRequest) {
        await NotificationRepo.create({
          receiverId: userId,
          senderId: null,
          message: 'Your request to become a promoter has been approved',
          scope: NOTIFICATIONSCOPE.PRODUCT_LIKE,
        });

        await promoterRequest.update({
          status: 'Approved',
          approvedBy: id,
        });
      }
      return AppResponse.success(res, {
        message: 'Updated user to promoter succesfuly',
      });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to request to become a promoter
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async createRequest(req, res) {
    const { id } = res.locals.user;

    try {
      /**
       * @type {{status: string}}
       */
      const request = await PromoterRequestRepo.getByUserId(id);

      if (!request) {
        await PromoterRequestRepo.create({ ...req.body, userId: id });

        return AppResponse.success(res, {
          message: 'Requested successfuly',
        });
      }

      if (request.status === 'Pending') {
        return AppResponse.badRequest(res, {
          message: 'You already have a pending request',
        });
      }
      if (request.status === 'Approved') {
        return AppResponse.badRequest(res, {
          message: "You're already a promoter",
        });
      }
      if (request.status === 'Rejected') {
        return AppResponse.badRequest(res, {
          message: 'Your request was previously rejected',
        });
      }

      return AppResponse.badRequest(res, {
        message:
          'Unable to make this request at the moment. contact us at help@app.com',
      });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }
}

export default PromoterController;
