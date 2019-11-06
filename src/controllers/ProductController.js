// Repos
import ProductRepo from '../repositories/ProductRepo';
import ProductImageRepo from '../repositories/ProductImageRepo';

// Helpers
import { AppResponse } from '../helpers/AppResponse';
import CategoryRepo from '../repositories/CategoryRepo';

/**
 * Controller that handles everything relating to products
 */
class ProductController {
  /**
   * @description controller method to create a new product
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async create(req, res) {
    const { title, price, description } = req.body;
    const { id } = res.locals.user;

    let name = '';
    let category = {};
    if (req.body.categoryName) {
      name = req.body.categoryName;
      category = await CategoryRepo.getByName(name);
    }

    try {
      const product = await ProductRepo.getByTitleAndUserId({
        title,
        userId: id,
      });

      if (product) {
        return AppResponse.conflict(res, {
          message:
            'You already have another product matching this exact name',
        });
      }

      if (!category) {
        return AppResponse.badRequest(res, {
          message: 'There is no category matching this category name',
        });
      }

      const newProduct = await ProductRepo.create({
        title,
        price,
        description,
        categoryId: category.id,
        userId: id,
      });

      return AppResponse.created(res, { data: { newProduct } });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to create a new product
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async addImages(req, res) {
    const { images } = req.body;
    const { productId } = req.params;
    const { id } = res.locals.user;
    const maxImageLength = 4;

    try {
      const product = await ProductRepo.getByIdAndUserId({
        id: productId,
        userId: id,
      });

      if (!product) {
        return AppResponse.notFound(res, {
          message: 'Product not found',
        });
      }

      if (product.ProductImages.length >= maxImageLength) {
        return AppResponse.conflict(res, {
          message: 'Product already has 4 or more images',
        });
      }
      if (product.ProductImages.length + images.length > maxImageLength) {
        return AppResponse.conflict(res, {
          message: `Product already has ${
            product.ProductImages.length
          } images. You can add a max of ${maxImageLength
            - product.ProductImages.length} more`,
        });
      }

      const productImages = images.map(image => ({
        ...image,
        productId,
      }));

      const addedImages = await ProductImageRepo.createMany(productImages);

      return AppResponse.created(res, {
        data: { addedImages },
        message: 'Added images successfully',
      });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to fetch paginated products
   * @param {*} req req
   * @param {{
   *  locals: { usePagination, paginationData, useOrdering, orderData}
   * }} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async fetchProducts(req, res) {
    const { usePagination, paginationData, useOrdering } = res.locals;
    const isPublished = { isPublished: false };

    try {
      const countProducts = () => ProductRepo.countProducts(isPublished);
      const getProducts = () => ProductRepo.getByPagination(
        usePagination,
        useOrdering,
        isPublished,
      );

      const [count, products] = await Promise.all([
        countProducts(),
        getProducts(),
      ]);

      const totalPages = Math.ceil(count / paginationData.pageSize);

      const metaData = { count, totalPages, ...paginationData };

      return AppResponse.success(res, { data: { products, metaData } });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to fetch paginated products
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async searchProducts(req, res) {
    const { usePagination, paginationData } = res.locals;
    const { name } = req.query;

    try {
      const countProducts = () => ProductRepo.countSearch(usePagination, { name });
      const getProducts = () => ProductRepo.search(usePagination, { name });

      const [count, products] = await Promise.all([
        countProducts(),
        getProducts(),
      ]);

      if (count === 0) {
        return AppResponse.notFound(res, {
          message: 'No products match the search criteria',
        });
      }

      const metaData = { count, ...paginationData };

      return AppResponse.success(res, { data: { products, metaData } });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to fetch a product
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async fetchOne(req, res) {
    const { productId } = req.params;
    const { id } = res.locals.user;

    try {
      const product = await ProductRepo.getById(productId);

      if (product) {
        ProductRepo.addView({ productId, viewerId: id.toString() });
        return AppResponse.success(res, { data: { product } });
      }

      return AppResponse.notFound(res, { message: 'Product not found' });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to like a product
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async likeProduct(req, res) {
    const { productId } = req.params;
    const { id } = res.locals.user;

    try {
      const product = await ProductRepo.getById(productId);

      if (!product) {
        return AppResponse.notFound(res, { message: 'Product not found' });
      }

      ProductRepo.addLike({ productId, likerId: id });
      return AppResponse.success(res, { message: 'Product liked' });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to like a product
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async bookmarkProduct(req, res) {
    const { productId } = req.params;
    const { id } = res.locals.user;

    try {
      const product = await ProductRepo.getById(productId);

      if (!product) {
        return AppResponse.notFound(res, { message: 'Product not found' });
      }

      await ProductRepo.addBookmark({ productId, bookmarkerId: id });
      return AppResponse.success(res, { message: 'Product bookmarked' });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to publish a product
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async publishProduct(req, res) {
    const { productId } = req.params;
    const { id } = res.locals.user;

    try {
      const getProduct = () => ProductRepo.getById(id);
      const checkProductOwner = () => ProductRepo.getByIdAndUserId({
        id: productId,
        userId: id,
      });
      const [isProductOwner, product] = await Promise.all([
        checkProductOwner(),
        getProduct(),
      ]);

      if (!isProductOwner) {
        return AppResponse.unAuthorized(res, {
          message: 'Unable to publish another users product',
        });
      }
      if (!product) {
        return AppResponse.notFound(res, { message: 'Product not found' });
      }

      await product.update({ isPublished: true });
      return AppResponse.success(res, { message: 'Product published' });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }

  /**
   * @description controller method to unpublish a product
   * @param {*} req req
   * @param {*} res res
   *
   * @returns {Promise<AppResponse>} The Return Object
   */
  static async unPublishProduct(req, res) {
    const { productId } = req.params;
    const { id } = res.locals.user;

    try {
      const getProduct = () => ProductRepo.getById(id);
      const checkProductOwner = () => ProductRepo.getByIdAndUserId({
        id: productId,
        userId: id,
      });
      const [isProductOwner, product] = await Promise.all([
        checkProductOwner(),
        getProduct(),
      ]);

      if (!isProductOwner) {
        return AppResponse.unAuthorized(res, {
          message: 'Unable to unpublish another users product',
        });
      }
      if (!product) {
        return AppResponse.notFound(res, { message: 'Product not found' });
      }

      await product.update({ isPublished: false });
      return AppResponse.success(res, { message: 'Product unpublished' });
    } catch (errors) {
      return AppResponse.serverError(res, { errors });
    }
  }
}

export default ProductController;
