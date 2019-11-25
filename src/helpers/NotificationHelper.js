import FCM from 'fcm-node';

import { NOTIFICATIONSCOPE } from './notificationScopes';
import fcmConfig from '../repositories/fcmConfig';
import UserRepo from '../repositories/UserRepo';
import ProductImageRepo from '../repositories/ProductImageRepo';
import { stringifyObjValues } from '../utils/objectHelper';

const fcm = new FCM(fcmConfig);

/**
 * Notification Helper
 */
export class NotificationHelper {
  /**
   * get the scope
   * @param {string} scope
   * @param {*} Sender
   * @returns {string} title
   */
  static getNotificationBody(scope, Sender) {
    switch (scope) {
      case NOTIFICATIONSCOPE.FOLLOW:
        return `${Sender.Profile.firstName} has started following you`;

      case NOTIFICATIONSCOPE.MESSAGE:
        return `${Sender.Profile.firstName} sent you a new message`;

      case NOTIFICATIONSCOPE.PRODUCT_LIKE:
        return `${Sender.Profile.firstName} has liked one of your products`;

      default:
        return `New notification recieved from ${Sender.Profile.firstName}`;
    }
  }

  /**
   * @typedef {{
   *  message?: string,
   *  scope?: string,
   *  scopeId?: string | number,
   *  senderId: string | number,
   * }} Details
   */

  /**
   * get the imageope
   * @param {Details} data
   * @typedef {{title: string, body: string, image: string }} response
   * @returns {Promise<response>} title
   */
  static async getDetails({ scope, scopeId, message, senderId }) {
    let image = '';
    let title = '';
    let body = '';

    if (scope === NOTIFICATIONSCOPE.MESSAGE) {
      const user = await UserRepo.getById(senderId);
      title = user.Profile.firstName;
      body = message;
      image = '';

      return { title, body, image };
    }

    if (scope === NOTIFICATIONSCOPE.FOLLOW) {
      const user = await UserRepo.getById(senderId);
      title = `${user.Profile.firstName} has started following you`;
      body = '';
      image = '';

      return { title, body, image };
    }

    if (scope === NOTIFICATIONSCOPE.PRODUCT_LIKE) {
      const getSender = () => UserRepo.getById(senderId);
      const getProductImages = () =>
        ProductImageRepo.getByProductId({
          productId: scopeId,
        });

      const [Sender, Images] = await Promise.all([
        getSender(),
        getProductImages(),
      ]);

      title = `${Sender.Profile.firstName} liked your product`;
      const productImage = Images[0].image;
      body = '';

      return { title, body, image: productImage };
    }
    return { title, body, image };
  }

  /**
   * @typedef {{
   *  receiverId: number, senderId: number,
   *  message?: string,
   *  scope?: string,
   *  scopeId?: string | number,
   *  isViewed?: boolean,
   * }} data
   */

  /**
   * helper method to send notifications to mobile devices
   * @param {data} data
   * @returns {Promise<*>} Response
   */
  static async sendNotification(data) {
    const {
      receiverId,
      senderId,
      scope,
      scopeId,
      message,
    } = stringifyObjValues(data);

    const getReciever = () => UserRepo.getById(receiverId);

    const [Reciever] = await Promise.all([getReciever()]);

    if (!Reciever.fcmToken) {
      return null;
    }

    const details = await this.getDetails({
      scopeId,
      scope,
      message,
      senderId,
    });

    const fcmMessage = {
      to: Reciever.fcmToken,

      notification: {
        title: details.title,
        body: details.body,
        image: details.image,
      },

      data: { scope, scopeId },
    };

    return fcm.send(fcmMessage, (err, response) => {
      if (err) {
        console.log('Something has gone wrong!');
        console.log(err);
      } else {
        console.log('Successfully sent with response: ', response);
      }
    });
  }
}
