import Sequelize from 'sequelize';

import Repository from './Repository';

const { Op } = Sequelize;
/**
 * User Repo
 */
class UserRepo extends Repository {
  /**
   * @typedef {{
   *  uniqueId: string, email: string, password: string,
   *  phone: string, secretKey: string, accountType: string,
   *  userProfile: { firstName: string, lastName: string, image?: string, bio?: string },
   *  authType?: string,
   * fcmToken?: string,
   * }} createData
   */

  /**
   * @description Get a user by either email or phone
   * @param {Object} data
   * @property {string} email
   * @property {string} phone
   *
   * @returns {Promise<*>} Response
   */
  static async getByEmailOrPhone({ email, phone }) {
    const user = this.User.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
      include: [{ model: this.Profile, as: 'Profile' }],
    }).catch((error) => {
      throw new Error(error);
    });

    return user;
  }

  /**
   * @description Method to get a user by email
   * @param {string} email
   *
   * @returns {Promise<*>} Response
   */
  static async getByEmail(email) {
    const user = this.User.findOne({
      where: {
        [Op.or]: [{ email }],
      },
      include: [{ model: this.Profile, as: 'Profile' }],
    }).catch((error) => {
      throw new Error(error);
    });

    return user;
  }

  /**
   * @description Method to get a user by email
   * @param {number | string} id
   *
   * @returns {Promise<*>} Response
   */
  static async getById(id) {
    const user = this.User.findOne({
      where: {
        [Op.or]: [{ id }],
      },
      include: [{ model: this.Profile, as: 'Profile' }],
    }).catch((error) => {
      throw new Error(error);
    });

    return user;
  }

  /**
   * @description Method to create a new user
   * @param {createData} data
   *
   * @returns {Promise<*>} Response
   */
  static async create(data) {
    const getAuthType = () => {
      if (data.authType) {
        return { authType: data.authType };
      }
      return null;
    };

    const {
      uniqueId,
      email,
      phone,
      password,
      secretKey,
      accountType,
      userProfile,
      fcmToken,
    } = data;

    const user = this.User.create(
      {
        uniqueId,
        email,
        phone,
        secretKey,
        accountType,
        password,
        fcmToken,
        ...getAuthType(),
        Profile: userProfile,
      },
      {
        include: [{ model: this.Profile, as: 'Profile' }],
      },
    ).catch((error) => {
      throw new Error(error);
    });

    return user;
  }
}

export default UserRepo;
