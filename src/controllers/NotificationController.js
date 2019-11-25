// Repos
import NotificationRepo from '../repositories/NotificationRepo';

// Helpers
import { AppResponse } from '../helpers/AppResponse';

/**
 * Controller that handles everything relating to products
 */
class NotificationController {
  /**
   * @description controller method to fetch paginated products
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async fetchMyNotifications(req, res) {
    const {
      usePagination,
      paginationData,
      useOrdering,
      user,
    } = res.locals;

    try {
      const countMyNotifications = () =>
        NotificationRepo.countNotifications({ receiverId: user.id });

      const getMyNotifications = () =>
        NotificationRepo.getUserNotificationsByPagination(
          usePagination,
          useOrdering,
          {
            receiverId: user.id,
          },
        );

      const [count, notifications] = await Promise.all([
        countMyNotifications(),
        getMyNotifications(),
      ]);

      const totalPages = Math.ceil(count / paginationData.pageSize);

      const metaData = { count, totalPages, ...paginationData };

      return AppResponse.success(res, {
        data: { notifications, metaData },
      });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to publish a product
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async updateNotification(req, res) {
    const { notificationId } = req.params;
    const { id: userId } = res.locals.user;

    try {
      const updateStatus = await NotificationRepo.updateView({
        id: notificationId,
        receiverId: userId,
      });
      return AppResponse.success(res, {
        message: updateStatus ? 'notification seen' : 'not seen',
        data: { isViewed: !!updateStatus },
      });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }
}

export default NotificationController;
