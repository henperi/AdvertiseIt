import formatJoiErrors from '../../utils/formatJoiErrors';
import NotificationSchema from './NotificationSchema';
import { AppResponse } from '../../helpers/AppResponse';

const { notificationParams } = NotificationSchema;

const validateNotificationParams = async (req, res, next) => {
  try {
    // @ts-ignore
    await notificationParams.validateAsync(req.params, {
      abortEarly: false,
    });
    return next();
  } catch (errors) {
    return AppResponse.badRequest(res, {
      errors: formatJoiErrors(errors),
    });
  }
};

export { validateNotificationParams };
