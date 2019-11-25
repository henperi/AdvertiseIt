import formatJoiErrors from '../../utils/formatJoiErrors';
import AuthSchema from './AuthSchema';
import { AppResponse } from '../../helpers/AppResponse';

const {
  createUserSchema,
  loginUserSchema,
  resetPasswordSchema,
  fcmTokenSchema,
} = AuthSchema;

const validateCreateUser = async (req, res, next) => {
  try {
    // @ts-ignore
    await createUserSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    return next();
  } catch (errors) {
    return AppResponse.badRequest(res, {
      errors: formatJoiErrors(errors),
    });
  }
};

const validateLoginUser = async (req, res, next) => {
  try {
    // @ts-ignore
    await loginUserSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    return next();
  } catch (errors) {
    return AppResponse.badRequest(res, {
      errors: formatJoiErrors(errors),
    });
  }
};

const validateUpdateFCMToken = async (req, res, next) => {
  try {
    // @ts-ignore
    await fcmTokenSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    return next();
  } catch (errors) {
    return AppResponse.badRequest(res, {
      errors: formatJoiErrors(errors),
    });
  }
};

const validateResetPassword = async (req, res, next) => {
  try {
    // @ts-ignore
    await resetPasswordSchema.payload.validateAsync(req.body, {
      abortEarly: false,
    });
    // @ts-ignore
    await resetPasswordSchema.params.validateAsync(req.params, {
      abortEarly: false,
    });
    return next();
  } catch (errors) {
    return AppResponse.badRequest(res, {
      errors: formatJoiErrors(errors),
    });
  }
};

export {
  validateCreateUser,
  validateLoginUser,
  validateResetPassword,
  validateUpdateFCMToken,
};
