// eslint-disable-next-line no-unused-vars
import Sequelize from 'sequelize';

// Model
import model from '../db/models';

const {
  User,
  Profile,
  Product,
  ProductImage,
  ProductView,
  ProductLike,
  ProductBookmark,
  Follower,
  Admin,
} = model;

/**
 * Repository
 */
class Repository {
  /**
   * @typedef {Sequelize.ModelCtor<Sequelize.Model>} Model
   */

  /**
   * @type {Model}
   */
  static get User() {
    return User;
  }

  /**
   * @type {Model}
   */
  static get Admin() {
    return Admin;
  }

  /**
   * @type {Model}
   */
  static get Profile() {
    return Profile;
  }

  /**
   * @type {Model}
   */
  static get Product() {
    return Product;
  }

  /**
   * @type {Model}
   */
  static get ProductImage() {
    return ProductImage;
  }

  /**
   * @type {Model}
   */
  static get ProductView() {
    return ProductView;
  }

  /**
   * @type {Model}
   */
  static get ProductLike() {
    return ProductLike;
  }

  /**
   * @type {Model}
   */
  static get ProductBookmark() {
    return ProductBookmark;
  }

  /**
   * @type {Model}
   */
  static get Follower() {
    return Follower;
  }
}

export default Repository;
