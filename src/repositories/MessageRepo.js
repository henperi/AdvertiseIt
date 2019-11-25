import Sequelize from 'sequelize';

import Repository from './Repository';
import NotificationRepo from './NotificationRepo';
import { NOTIFICATIONSCOPE } from '../helpers/notificationScopes';

const { Op } = Sequelize;
/**
 * Message Repo
 */
class MessageRepo extends Repository {
  /**
   * @description Method to fetch paginated messages by senderId and recieverId
   * @param {Function} usePagination
   * @param {{ chatId: string }} data
   *
   * @returns {Promise<*>} Response
   */
  static async getByChatId(usePagination, { chatId }) {
    const messages = this.Message.findAndCountAll({
      ...usePagination(),
      where: {
        [Op.or]: [{ chatId }],
      },
    }).catch((error) => {
      throw new Error(error);
    });

    return messages;
  }

  /**
   * @description Method to fetch paginated messages by senderId and recieverId
   * @param {Function} usePagination
   * @param {{ senderId: string, receiverId: string }} data
   *
   * @returns {Promise<*>} Response
   */
  static async getBySenderIdAndReceiverId(
    usePagination,
    { senderId, receiverId },
  ) {
    const messages = this.Message.findAll({
      ...usePagination(),
      where: {
        [Op.or]: [
          {
            [Op.and]: [{ senderId }, { receiverId }],
          },
          {
            [Op.and]: [{ senderId: receiverId }, { receiverId: senderId }],
          },
        ],
      },
    }).catch((error) => {
      throw new Error(error);
    });

    return messages;
  }

  /**
   * @description Method to search/get products matching a specific search criteria
   * @param {Function} usePagination
   * @param {{text: string, senderId: string, receiverId: string}} message
   *
   * @returns {Promise<*>} Response
   */
  static async search(usePagination, { text, senderId, receiverId }) {
    const message = await this.Message.findAll({
      ...usePagination(),
      where: {
        [Op.or]: [
          {
            [Op.and]: [
              { senderId },
              { receiverId },
              {
                message: {
                  [Op.iLike]: `%${text}%`,
                },
              },
            ],
          },
          {
            [Op.and]: [
              { senderId: receiverId },
              { receiverId: senderId },
              {
                message: {
                  [Op.iLike]: `%${text}%`,
                },
              },
            ],
          },
        ],
      },
    }).catch((error) => {
      throw new Error(error);
    });

    return message;
  }

  /**
   * @description Method to count messages matching a specific search criteria
   * @param {Function} usePagination
   * @param {{ text: string, senderId: string, receiverId: string }} text
   *
   * @returns {Promise<*>} Response
   */
  static async countSearch(usePagination, { text, senderId, receiverId }) {
    const message = await this.Message.count({
      ...usePagination(),
      where: {
        [Op.or]: [
          {
            [Op.and]: [
              { senderId },
              { receiverId },
              {
                message: {
                  [Op.iLike]: `%${text}%`,
                },
              },
            ],
          },
          {
            [Op.and]: [
              { senderId: receiverId },
              { receiverId: senderId },
              {
                message: {
                  [Op.iLike]: `%${text}%`,
                },
              },
            ],
          },
        ],
      },
    }).catch((error) => {
      throw new Error(error);
    });

    return message;
  }

  /**
   * @description Method to count messages belonging to two users
   * @param {Function} usePagination
   * @param {{ senderId: string, receiverId: string }} data
   *
   * @returns {Promise<*>} Response
   */
  static async countMessages(usePagination, { senderId, receiverId }) {
    const messages = this.Message.count({
      ...usePagination(),
      where: {
        [Op.or]: [
          {
            [Op.and]: [{ senderId }, { receiverId }],
          },
          {
            [Op.and]: [{ senderId: receiverId }, { receiverId: senderId }],
          },
        ],
      },
    }).catch((error) => {
      throw new Error(error);
    });

    return messages;
  }

  /**
   *
   * @param {{
   *  message: string, senderId: number, receiverId: number,
   *  media: string?, mediaType: string?,
   *  chatId: string,
   * }} data
   *
   * @returns {Promise<*>} Response
   */
  static async create(data) {
    const {
      message,
      senderId,
      receiverId,
      chatId,
      media = null,
      mediaType = 'Text',
    } = data;

    NotificationRepo.create({
      receiverId,
      senderId,
      message,
      scope: NOTIFICATIONSCOPE.MESSAGE,
      scopeId: chatId,
    });

    const sentMessage = this.Message.create({
      message,
      senderId,
      receiverId,
      media,
      mediaType,
      chatId,
    }).catch((error) => {
      throw new Error(error);
    });

    return sentMessage;
  }
}

export default MessageRepo;
