import express from 'express';

// Controllers
import NotificationController from '../../controllers/NotificationController';

// Middlewares | Validations
import { checkUserAuth } from '../../middlewares/auth';
import { validateNotificationParams } from './notificationValidations';

const notificationRouter = express.Router();

/**
 * list the authenticated user notifications
 */
notificationRouter.get(
  '/',
  checkUserAuth,
  NotificationController.fetchMyNotifications,
);

/**
 * update a specific notification view status
 */
notificationRouter.put(
  '/:notificationId',
  checkUserAuth,
  validateNotificationParams,
  NotificationController.updateNotification,
);

export default notificationRouter;
