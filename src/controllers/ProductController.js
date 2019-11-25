// Repos
import ProductRepo from '../repositories/ProductRepo';
import ProductImageRepo from '../repositories/ProductImageRepo';

// Helpers
import { AppResponse } from '../helpers/AppResponse';
import CategoryRepo from '../repositories/CategoryRepo';
import ProductLikeRepo from '../repositories/ProductLikeRepo';
import FollowerRepo from '../repositories/FollowerRepo';
import { imageService } from '../services/imageService';
import { trimify } from '../utils/objectHelper';

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
    const reqBody = trimify(req.body);
    const { title, price, description } = reqBody;
    const { id } = res.locals.user;
    const { imageFiles } = res.locals;

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

      const promises = imageFiles.map((image) =>
        imageService.uploader.upload(image.path),
      );

      const uploadImages = await Promise.all(promises);

      const createdProduct = await ProductRepo.create({
        title,
        price,
        description,
        categoryId: category.id,
        userId: id,
      });

      const formatImages = uploadImages.map((image) => ({
        image: image.url,
        isMainImage: false,
        productId: createdProduct.id,
      }));

      const productImages = await ProductImageRepo.createMany(
        formatImages,
      );

      return AppResponse.created(res, {
        data: { createdProduct, productImages },
      });
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
          } images. You can add a max of 
          ${maxImageLength - product.ProductImages.length} more`,
        });
      }

      const productImages = images.map((image) => ({
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
      const getProducts = () =>
        ProductRepo.getByPagination(
          usePagination,
          useOrdering,
          isPublished,
        );

      const [count, products] = await Promise.all([
        countProducts(),
        getProducts(),
      ]);

      // products.dataValues.ProductImages = [products.dataValues.ProductImages];
      // log(products);

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
  static async fetchMyProducts(req, res) {
    const {
      usePagination,
      paginationData,
      useOrdering,
      user,
    } = res.locals;

    try {
      const countMyProducts = () =>
        ProductRepo.countMyProducts({ userId: user.id });

      const getMyProducts = () =>
        ProductRepo.getByUserId(usePagination, useOrdering, {
          userId: user.id,
        });

      const [count, products] = await Promise.all([
        countMyProducts(),
        getMyProducts(),
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
      const countProducts = () =>
        ProductRepo.countSearch(usePagination, { name });
      const getProducts = () =>
        ProductRepo.search(usePagination, { name });

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
      const getProductById = () => ProductRepo.getById(productId);
      const getProductImageByProductId = () =>
        ProductImageRepo.getByProductId({
          productId,
        });
      const getLikeByUserIdAndProductId = () =>
        ProductLikeRepo.getBylikerIdAndProductId({
          likerId: id,
          productId,
        });

      const [product, productImage, isLikedByUser] = await Promise.all([
        getProductById(),
        getProductImageByProductId(),
        getLikeByUserIdAndProductId(),
      ]);

      if (product) {
        product.dataValues.ProductImages = productImage;
        product.dataValues.views = parseInt(product.dataValues.views, 10);
        product.dataValues.likes = parseInt(product.dataValues.likes, 10);

        const checkFollowing = () =>
          FollowerRepo.checkFollowing({
            followerId: id,
            userId: product.Owner.userId,
          });

        const addView = () =>
          ProductRepo.addView({
            productId,
            viewerId: id.toString(),
          });

        const [add, isFollowing] = await Promise.all([
          addView(),
          checkFollowing(),
        ]);

        if (add) {
          const newViewCount = 1 + parseInt(product.dataValues.views, 10);

          await product.update({ views: newViewCount });
        }

        return AppResponse.success(res, {
          data: {
            product,
            isLikedByUser: !!isLikedByUser,
            isFollowing: !!isFollowing,
          },
        });
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

      const likeStatus = await ProductRepo.addLike({
        productId,
        likerId: id,
        ownerId: product.userId,
      });

      let message;

      if (likeStatus === 'liked') {
        message = 'Product liked';
        const newLikesCount = 1 + parseInt(product.dataValues.likes, 10);
        await product.update({ likes: newLikesCount });
      }
      if (likeStatus === 'unliked') {
        message = 'Product unliked';
        const newLikesCount = parseInt(product.dataValues.likes, 10) - 1;
        await product.update({ likes: newLikesCount });
      }

      return AppResponse.success(res, {
        message,
        data: { likeStatus },
      });
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
      const checkProductOwner = () =>
        ProductRepo.getByIdAndUserId({
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
      const checkProductOwner = () =>
        ProductRepo.getByIdAndUserId({
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
