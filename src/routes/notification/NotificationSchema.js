// /* eslint-disable require-jsdoc */
import Joi from '@hapi/joi';

/**
 * Schemas for all the endpoints relating to Notifications
 */
class NotificationSchema {
  /**
   * @description The schema used to validate the notification params endpoint
   */
  static get notificationParams() {
    return Joi.object({
      notificationId: Joi.string(),
    });
  }
}

export default NotificationSchema;
