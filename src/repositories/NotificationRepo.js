import Sequelize from 'sequelize';

import Repository from './Repository';
import { NotificationHelper } from '../helpers/NotificationHelper';

const { Op } = Sequelize;
/**
 * User Repo
 */
class NotificationRepo extends Repository {
  /**
   * @typedef {{
   *  receiverId: number, senderId: number,
   *  message?: string,
   *  scope?: string,
   *  scopeId?: string | number,
   *  isViewed?: boolean,
   * }} createData
   */

  /**
   * @description Method to get a product by id and userId
   * @param {Function} usePagination
   * @param {Function} useOrdering
   * @param {{receiverId: number}} isPublished
   *
   * @returns {Promise<*>} Response
   */
  static async getUserNotificationsByPagination(
    usePagination,
    useOrdering,
    { receiverId },
  ) {
    const products = await this.Notification.findAll({
      ...usePagination(),
      ...useOrdering(),
      where: { [Op.or]: [{ receiverId }] },
      include: [
        {
          model: this.Profile,
          as: 'Reciever',
          attributes: ['firstName', 'lastName', 'image', 'userId'],
          required: true,
        },
      ],
      attributes: {
        exclude: ['description'],
        include: [],
      },
    }).catch((error) => {
      throw new Error(error);
    });

    return products;
  }

  /**
   * @description Method to count a users notifications
   * @param {{receiverId: number}} data
   *
   * @returns {Promise<*>} Response
   */
  static async countNotifications({ receiverId }) {
    const count = await this.Notification.count({
      where: { [Op.or]: [{ receiverId }] },
    }).catch((error) => {
      throw new Error(error);
    });

    return count;
  }

  /**
   * Method to create a notification
   * @param {createData} data
   *
   * @returns {Promise<*>} Response
   */
  static async create(data) {
    const { receiverId, senderId, scope, scopeId, message } = data;

    NotificationHelper.sendNotification(data);

    const notification = this.Notification.create({
      receiverId,
      senderId,
      scope,
      scopeId,
      message,
    }).catch((error) => {
      throw new Error(error);
    });

    return notification;
  }

  /**
   * Update a notification view to true
   * @param {{ id: number, receiverId: number }} data
   *
   * @returns {Promise<*>} Response
   */
  static async updateView({ id, receiverId }) {
    const getNotification = await this.Notification.findOne({
      where: {
        [Op.and]: [{ id }],
      },
    });

    if (!getNotification) {
      return null;
    }

    const notification = this.Notification.update(
      { isViewed: true },
      {
        where: { id, receiverId },
      },
    ).catch((error) => {
      throw new Error(error);
    });

    return notification;
  }
}

export default NotificationRepo;
