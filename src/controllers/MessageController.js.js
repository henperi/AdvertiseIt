// Repos
import UserRepo from '../repositories/UserRepo';
import MessageRepo from '../repositories/MessageRepo';

// Helpers
import { AppResponse } from '../helpers/AppResponse';
import ChatRepo from '../repositories/ChatRepo';

/**
 * Controller that handles everything relating to products
 */
class MessageController {
  /**
   * @description controller method to create a new message
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async create(req, res) {
    const { message, media, mediaType } = req.body;
    const { receiverId } = req.params;
    const { id: senderId } = res.locals.user;

    try {
      const getUser = () => UserRepo.getById(receiverId);
      const findOrCreateChat = () =>
        ChatRepo.findOrCreate({ receiverId, senderId });

      const [user, chat] = await Promise.all([
        getUser(),
        findOrCreateChat(),
      ]);

      if (!user) {
        return AppResponse.notFound(res, {
          message: "User you're trying to message does not exist",
        });
      }

      const sentMessage = await MessageRepo.create({
        message,
        media,
        mediaType,
        senderId,
        receiverId,
        chatId: chat.chatId,
      });

      return AppResponse.created(res, { data: { sentMessage } });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to fetch paginated messages
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async fetchMessages(req, res) {
    const { usePagination, paginationData } = res.locals;
    const { receiverId } = req.params;
    const { id: senderId } = res.locals.user;
    // const { chatId } = req.params;

    try {
      const countMessages = () =>
        MessageRepo.countMessages(usePagination, {
          senderId,
          receiverId,
        });
      const getMessages = () =>
        MessageRepo.getBySenderIdAndReceiverId(usePagination, {
          senderId,
          receiverId,
        });

      const [count, messages] = await Promise.all([
        countMessages(),
        getMessages(),
      ]);

      const metaData = { count, ...paginationData };

      return AppResponse.success(res, { data: { messages, metaData } });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to search and return paginated messages by message text
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async searchMessages(req, res) {
    const { usePagination, paginationData } = res.locals;
    const { text } = req.query;
    const { receiverId } = req.params;
    const { id: senderId } = res.locals.user;

    try {
      const countSearch = () =>
        MessageRepo.countSearch(usePagination, {
          text,
          senderId,
          receiverId,
        });
      const getMessages = () =>
        MessageRepo.search(usePagination, {
          text,
          senderId,
          receiverId,
        });

      const [count, messages] = await Promise.all([
        countSearch(),
        getMessages(),
      ]);

      if (count === 0) {
        return AppResponse.notFound(res, {
          message: 'No messages match the search criteria',
        });
      }

      const metaData = { count, ...paginationData };

      return AppResponse.success(res, { data: { messages, metaData } });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }
}

export default MessageController;
