import Sequelize from 'sequelize';

import Repository from './Repository';
import { NOTIFICATIONSCOPE } from '../helpers/notificationScopes';
import NotificationRepo from './NotificationRepo';

const { Op } = Sequelize;
/**
 * User Repo
 */
class ProductRepo extends Repository {
  /**
   * @typedef {{
   *  title: string, price: string,
   *  description: string, userId: number,
   *  categoryId?: number?,
   * }} createData
   */

  /**
   * @description Method to get a product by title
   * @param {string} title
   *
   * @returns {Promise<*>} Response
   */
  static async getByTitle(title) {
    const product = this.Product.findOne({
      where: {
        [Op.or]: [{ title }],
      },
      include: [{ model: this.ProductImage, as: 'ProductImages' }],
    }).catch((error) => {
      throw new Error(error);
    });

    return product;
  }

  /**
   * @description Method to get a product by title
   * @typedef {{ title: string, userId }} data
   * @param {data} data
   *
   * @returns {Promise<*>} Response
   */
  static async getByTitleAndUserId({ title, userId }) {
    const product = this.Product.findOne({
      where: {
        [Op.and]: [{ title }, { userId }],
      },
      include: [{ model: this.ProductImage, as: 'ProductImages' }],
    }).catch((error) => {
      throw new Error(error);
    });

    return product;
  }

  /**
   * @description Method to get a product by id
   * @param {string | number} id
   *
   * @returns {Promise<*>} Response
   */
  static async getById(id) {
    const product = this.Product.findOne({
      where: {
        [Op.or]: [{ id }],
      },
      include: [
        {
          model: this.Profile,
          as: 'Owner',
          attributes: ['firstName', 'lastName', 'image', 'userId'],
        },
        // {
        //   model: this.ProductLike,
        //   as: 'ProductLikes',
        //   attributes: [],
        // },
        // {
        //   model: this.ProductView,
        //   as: 'ProductViews',
        //   attributes: [],
        // },
      ],
      attributes: {
        exclude: ['description'],
        include: [
          // [
          //   Sequelize.fn('COUNT', Sequelize.col('ProductLikes.id')),
          //   'likesCount',
          // ],
          // [
          //   Sequelize.fn('COUNT', Sequelize.col('ProductViews.id')),
          //   'views',
          // ],
        ],
      },
      // group: ['Product.id', 'Owner.id'],
      // subQuery: false,
    }).catch((error) => {
      throw new Error(error);
    });

    return product;
  }

  /**
   * @description Method to get a product by id and userId
   * @param {{ id: string, userId }} data
   *
   * @returns {Promise<*>} Response
   */
  static async getByIdAndUserId({ id, userId }) {
    const product = this.Product.findOne({
      where: {
        [Op.and]: [{ id }, { userId }],
      },
      include: [{ model: this.ProductImage, as: 'ProductImages' }],
    }).catch((error) => {
      throw new Error(error);
    });

    return product;
  }

  /**
   * @description Method to get a product by id and userId
   * @param {Function} usePagination
   * @param {Function} useOrdering
   * @param {{isPublished: boolean}} isPublished
   *
   * @returns {Promise<*>} Response
   */
  static async getByPagination(
    usePagination,
    useOrdering,
    { isPublished },
  ) {
    const products = await this.Product.findAll({
      ...usePagination(),
      ...useOrdering(),
      where: { [Op.or]: [{ isPublished }] },
      // distinct: true,
      include: [
        {
          model: this.ProductImage,
          as: 'ProductImages',
          attributes: ['image'],
          // duplicating: false,
          // required: true,
        },
        {
          model: this.Profile,
          as: 'Owner',
          attributes: ['firstName', 'lastName', 'image', 'userId'],
          // duplicating: false,
          required: true,
        },
        // {
        //   model: this.ProductLike,
        //   as: 'ProductLikes',
        //   attributes: [],
        // },
        // {
        //   model: this.ProductView,
        //   as: 'ProductViews',
        //   attributes: [],
        // },
      ],
      attributes: {
        exclude: ['description'],
        include: [
          // [
          //   Sequelize.fn('COUNT', Sequelize.col('ProductLikes.id')),
          //   'likes',
          // ],
          // [
          //   Sequelize.fn('COUNT', Sequelize.col('ProductViews.id')),
          //   'views',
          // ],
        ],
      },
      // group: ['Product.id', 'ProductImages.id', 'Owner.id'],
      // subQuery: false,
    }).catch((error) => {
      throw new Error(error);
    });

    return products;
  }

  /**
   * @description Method to get a product by the userId
   * @param {Function} usePagination
   * @param {Function} useOrdering
   * @param {{userId: boolean}} isPublished
   *
   * @returns {Promise<*>} Response
   */
  static async getByUserId(usePagination, useOrdering, { userId }) {
    const products = await this.Product.findAll({
      ...usePagination(),
      ...useOrdering(),
      where: { [Op.or]: [{ userId }] },
      include: [
        {
          model: this.ProductImage,
          as: 'ProductImages',
          attributes: ['image'],
        },
        {
          model: this.Profile,
          as: 'Owner',
          attributes: ['firstName', 'lastName', 'image', 'userId'],
          required: true,
        },
      ],
      attributes: {
        exclude: ['description'],
      },
    }).catch((error) => {
      throw new Error(error);
    });

    return products;
  }

  /**
   * @description Method to get products matching a specific search criteria
   * @param {Function} usePagination
   * @param {{name: string}} name
   *
   * @returns {Promise<*>} Response
   */
  static async search(usePagination, { name }) {
    const products = await this.Product.findAll({
      ...usePagination(),
      where: {
        [Op.or]: [
          {
            title: {
              [Op.iLike]: `%${name}%`,
            },
          },
          {
            description: {
              [Op.iLike]: `%${name}%`,
            },
          },
        ],
      },
      include: [{ model: this.ProductImage, as: 'ProductImages' }],
    }).catch((error) => {
      throw new Error(error);
    });

    return products;
  }

  /**
   * @description Method to count products matching a specific search criteria
   * @param {Function} usePagination
   * @param {{name: string}} name
   *
   * @returns {Promise<*>} Response
   */
  static async countSearch(usePagination, { name }) {
    const products = await this.Product.count({
      ...usePagination(),
      where: {
        [Op.or]: [
          {
            title: {
              [Op.iLike]: `%${name}%`,
            },
          },
          {
            description: {
              [Op.iLike]: `%${name}%`,
            },
          },
        ],
      },
    }).catch((error) => {
      throw new Error(error);
    });

    return products;
  }

  /**
   * @description Method to count products
   * @param {{isPublished: boolean}} data
   *
   * @returns {Promise<*>} Response
   */
  static async countProducts({ isPublished = true }) {
    const count = await this.Product.count({
      where: { [Op.or]: [{ isPublished }] },
    }).catch((error) => {
      throw new Error(error);
    });

    return count;
  }

  /**
   * @description Method to count my products
   * @param {{userId: number}} data
   *
   * @returns {Promise<*>} Response
   */
  static async countMyProducts({ userId }) {
    const count = await this.Product.count({
      where: { [Op.or]: [{ userId }] },
    }).catch((error) => {
      throw new Error(error);
    });

    return count;
  }

  // /**s

  /**
   *
   * @param {createData} data
   *
   * @returns {Promise<*>} Response
   */
  static async create(data) {
    const { title, price, description, userId, categoryId = null } = data;

    const product = this.Product.create({
      title,
      price,
      description,
      userId,
      categoryId,
      isPublished: false,
    }).catch((error) => {
      throw new Error(error);
    });

    return product;
  }

  /**
   *
   * @param {{ viewerId: number, productId: number }} data
   *
   * @returns {Promise<*>} Response
   */
  static async addView(data) {
    const { productId, viewerId } = data;

    const isViewedAlready = await this.ProductView.findOne({
      where: {
        [Op.and]: [{ productId }, { viewerId }],
      },
    });

    if (isViewedAlready) {
      return null;
    }

    // this.Product.update(
    //   {
    //     views: newValue,
    //   },
    //   { where: { id: productId } },
    // );

    this.ProductView.create({
      productId,
      viewerId,
    }).catch((error) => {
      throw new Error(error);
    });

    return 'added';
  }

  /**
   *
   * @param {{ likerId: number, productId: number, ownerId: number }} data
   *
   * @returns {Promise<any | boolean>} Response
   */
  static async addLike(data) {
    const { productId, likerId, ownerId } = data;

    const isAlreadyLiked = await this.ProductLike.findOne({
      where: {
        [Op.and]: [{ productId }, { likerId }],
      },
    });

    if (isAlreadyLiked) {
      this.ProductLike.destroy({
        where: {
          [Op.and]: [{ productId }, { likerId }],
        },
      });
      return 'unliked';
    }

    // console.log('notification like');

    NotificationRepo.create({
      receiverId: ownerId,
      senderId: likerId,
      message: 'someone liked your product',
      scope: NOTIFICATIONSCOPE.PRODUCT_LIKE,
      scopeId: productId,
    });

    this.ProductLike.create({
      productId,
      likerId,
    }).catch((error) => {
      throw new Error(error);
    });

    return 'liked';
  }

  /**
   *
   * @param {{ bookmarkerId: number, productId: number }} data
   *
   * @returns {Promise<void>} Response
   */
  static async addBookmark(data) {
    const { productId, bookmarkerId } = data;

    const isAlreadyBookmarked = await this.ProductBookmark.findOne({
      where: {
        [Op.and]: [{ productId }, { bookmarkerId }],
      },
    });

    if (isAlreadyBookmarked) {
      return;
    }

    this.ProductBookmark.create({
      productId,
      bookmarkerId,
    }).catch((error) => {
      throw new Error(error);
    });
  }
}

export default ProductRepo;
