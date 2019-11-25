// /* eslint-disable require-jsdoc */
import Joi from '@hapi/joi';

/**
 * Schemas for all the endpoints relating to auth
 */
class AuthSchema {
  /**
   * @description The schema used to validate the process of creating a new user
   */
  static get createUserSchema() {
    return Joi.object({
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required(),
      firstName: Joi.string()
        .min(3)
        .max(40)
        .required(),
      lastName: Joi.string()
        .min(3)
        .max(15),
      phone: Joi.string()
        .length(11)
        .required(),
      accountType: Joi.string()
        .valid('Customer', 'Merchant')
        .required(),
      fcmToken: Joi.string().optional(),
    });
  }

  /**
   * @description The schema used to validate the process of authenticating a user
   */
  static get loginUserSchema() {
    return Joi.object({
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required(),
      fcmToken: Joi.string().optional(),
    });
  }

  /**
   * @description The schema used to validate the process of authenticating a user
   */
  static get fcmTokenSchema() {
    return Joi.object({
      fcmToken: Joi.string().required(),
    });
  }

  /**
   * @description The schema used to validate the process of authenticating a user
   */
  static get resetPasswordSchema() {
    return {
      payload: Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
      }),
      params: Joi.object({
        resetId: Joi.string()
          .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
          .error(
            new Error('The reset key supplied has an invalid format'),
          ),
      }),
    };
  }
}

export default AuthSchema;
