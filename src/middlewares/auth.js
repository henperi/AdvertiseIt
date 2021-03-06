import { AppResponse } from '../helpers/AppResponse';
import { verifyToken } from '../helpers/tokenHelper';
import UserRepo from '../repositories/UserRepo';
import AdminRepo from '../repositories/AdminRepo';

const checkUserAuth = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return AppResponse.badRequest(res, {
      message: 'Authorization header absent, are you logged in?',
    });
  }

  try {
    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      return AppResponse.unAuthorized(res, {
        message: 'Invalid Authorization credentials',
      });
    }

    const { id, secretKey, exp } = decodedToken;
    const today = new Date();

    if (today.getTime() / 1000 > exp) {
      return AppResponse.unAuthorized(res, {
        message: 'Authorization token expired',
      });
    }

    const user = await UserRepo.getById(id);

    if (!user) {
      return AppResponse.notFound(res, {
        message:
          'Unable to find or grant access to your login ID, log out and login again',
      });
    }

    if (secretKey !== user.secretKey) {
      return AppResponse.conflict(res, {
        message:
          'Your login credentials may have changed, log out and login again',
      });
    }

    res.locals.user = { ...decodedToken };
    return next();
  } catch (error) {
    return AppResponse.serverError(res, {
      message: 'An internal error occured',
      errors: { error },
    });
  }
};
const ensureAdmin = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return AppResponse.badRequest(res, {
      message: 'Authorization header absent, are you logged in?',
    });
  }

  try {
    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      return AppResponse.unAuthorized(res, {
        message: 'Invalid Authorization credentials',
      });
    }

    const { id, secretKey, exp } = decodedToken;
    const today = new Date();

    if (today.getTime() / 1000 > exp) {
      return AppResponse.unAuthorized(res, {
        message: 'Authorization token expired',
      });
    }

    const admin = await AdminRepo.getById(id);

    if (!admin) {
      return AppResponse.unAuthorized(res, {
        message: 'Unathorized to access this resource',
      });
    }

    if (secretKey !== admin.secretKey) {
      return AppResponse.conflict(res, {
        message:
          'Your login credentials may have changed, log out and login again',
      });
    }

    res.locals.admin = { ...decodedToken };
    return next();
  } catch (error) {
    return AppResponse.serverError(res, {
      message: 'An internal error occured',
      errors: { error },
    });
  }
};
const tryUserAuth = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    const { remoteAddress } = req.connection;
    const { ip } = req;

    res.locals.user = {
      id: ip || remoteAddress,
    };

    return next();
  }

  try {
    return checkUserAuth(req, res, next);
  } catch (error) {
    return AppResponse.serverError(res, {
      message: 'An internal error occured',
      errors: { error },
    });
  }
};

export { checkUserAuth, ensureAdmin, tryUserAuth };
