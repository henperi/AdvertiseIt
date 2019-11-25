import Sequelize from 'sequelize';

import Repository from './Repository';
import NotificationRepo from './NotificationRepo';
import { NOTIFICATIONSCOPE } from '../helpers/notificationScopes';

const { Op } = Sequelize;
/**
 * User Repo
 */
class FollowerRepo extends Repository {
  /**
   * @typedef {{
   *  title: string, price: string,
   *  description: string, userId: number,
   * }} createData
   */

  /**
   * @description Method to get a follower
   * @typedef {{ followerId: number, userId: number }} data
   * @param {data} data
   *
   * @returns {Promise<*>} Response
   */
  static async checkFollowing({ followerId, userId }) {
    const follower = this.Follower.findOne({
      where: {
        [Op.and]: [{ followerId }, { userId }],
      },
    }).catch((error) => {
      throw new Error(error);
    });

    return follower;
  }

  /**
   * @description Method to count a user's followers
   * @param {{ userId: number }} data
   *
   * @returns {Promise<*>} Response
   */
  static async countFollowers({ userId }) {
    const count = this.Follower.count({
      where: { [Op.or]: [{ userId }] },
    }).catch((error) => {
      throw new Error(error);
    });

    return count;
  }

  /**
   * @description Method to count who a user follows
   * @param {{ followerId: number }} data
   *
   * @returns {Promise<*>} Response
   */
  static async countFollowing({ followerId }) {
    const count = this.Follower.count({
      where: { [Op.or]: [{ followerId }] },
    }).catch((error) => {
      throw new Error(error);
    });

    return count;
  }

  /**
   *
   * @param {{ followerId: number, userId: number }} data
   *
   * @returns {Promise<*>} Response
   */
  static async create(data) {
    const { followerId, userId } = data;

    NotificationRepo.create({
      receiverId: userId,
      senderId: followerId,
      message: 'new user followed you',
      scope: NOTIFICATIONSCOPE.FOLLOW,
      scopeId: followerId,
    });

    return this.Follower.create({
      followerId,
      userId,
    }).catch((error) => {
      throw new Error(error);
    });
  }
}

export default FollowerRepo;
