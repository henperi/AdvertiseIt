import Sequelize from 'sequelize';

import Repository from './Repository';

const { Op } = Sequelize;
/**
 * User Repo
 */
class ProductImageRepo extends Repository {
  /**
   * @typedef {{
   *  image: string, isMainImage: boolean, productId: string
   * }} createData
   */

  /**
   *
   * @param {createData[]} images
   *
   * @returns {Promise<*>} Response
   */
  static async createMany(images) {
    const productImage = this.ProductImage.bulkCreate(images).catch(
      (error) => {
        throw new Error(error);
      },
    );

    return productImage;
  }

  /**
   * @description Method to get a product by title
   * @typedef {{ productId: * }} data
   * @param {data} data
   *
   * @typedef {{ productId: * }} result
   * @returns {Promise<*>} Response
   */
  static async getByProductId({ productId }) {
    const product = this.ProductImage.findAll({
      where: {
        [Op.and]: [{ productId }],
      },
    }).catch((error) => {
      throw new Error(error);
    });

    return product;
  }
}

export default ProductImageRepo;
