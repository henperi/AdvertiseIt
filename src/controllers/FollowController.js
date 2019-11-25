// Repos
import FollowerRepo from '../repositories/FollowerRepo';

// Helpers
import { AppResponse } from '../helpers/AppResponse';
import UserRepo from '../repositories/UserRepo';

/**
 * Controller that handles everything relating to products
 */
class FollowController {
  /**
   * @description controller method to add a new follower
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async addFollower(req, res) {
    /**
     * followee is the person being followed
     * follower is the person who follows
     *
     * In this context the auth user=[res.locals.user] is the follower
     * As he intends to become a follower of a followee having a [followeeId]
     */
    const { followeeId } = req.params;
    const { id } = res.locals.user;

    try {
      const getFollowee = () => UserRepo.getById(followeeId);
      const checkFollowing = () =>
        FollowerRepo.checkFollowing({
          followerId: id,
          userId: followeeId,
        });

      const [followee, isFollowing] = await Promise.all([
        getFollowee(),
        checkFollowing(),
      ]);

      if (!followee) {
        return AppResponse.notFound(res, {
          message: 'User to follow not found',
        });
      }
      if (isFollowing) {
        return AppResponse.conflict(res, {
          message: 'You are following this user already',
        });
      }

      await FollowerRepo.create({ followerId: id, userId: followeeId });
      return AppResponse.created(res, {
        message: 'Followed user successfully',
      });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to get follow metrics on a specific user
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async getMetrics(req, res) {
    const { id } = res.locals.user;

    try {
      const countFollowers = () =>
        FollowerRepo.countFollowers({
          userId: id,
        });

      const countFollowing = () =>
        FollowerRepo.countFollowing({
          followerId: id,
        });

      const [followers, follwing] = await Promise.all([
        countFollowers(),
        countFollowing(),
      ]);

      return AppResponse.success(res, { data: { followers, follwing } });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to count a user's followers
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async countFollowers(req, res) {
    const { id } = res.locals.user;

    try {
      const numberOfFollowers = await FollowerRepo.countFollowers({
        userId: id,
      });

      return AppResponse.success(res, { data: { numberOfFollowers } });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to count a user's followings
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async countFollowing(req, res) {
    const { id } = res.locals.user;

    try {
      const numberOfFollowing = await FollowerRepo.countFollowing({
        followerId: id,
      });

      return AppResponse.success(res, { data: { numberOfFollowing } });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }
}

export default FollowController;
