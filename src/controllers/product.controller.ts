import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.model.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { nodeCache } from "../app.js";
import { revalidateCache } from "../utils/cache-revalidation.js";
// import { faker } from "@faker-js/faker";

export const getAllProduts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, price, category } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    const baseQuery: BaseQuery = {};
    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    }
    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }
    if (category) {
      baseQuery.category = category;
    }
    //optimised for parellel processing
    const produtsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);
    const [products, filteredproducts] = await Promise.all([
      produtsPromise,
      Product.find(baseQuery),
    ]);

    // const products = await Product.find(baseQuery)
    //   .sort(sort && { price: sort === "asc" ? 1 : -1 })
    //   .limit(limit)
    //   .skip(skip);

    // const filteredproducts = await Product.find(baseQuery);

    const totalPage = Math.ceil(filteredproducts.length / limit);
    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);

export const getLatestProducts = TryCatch(async (req, res, next) => {
  let products;
  //nodeCache -- data stored in memory for faster retrival BUT after new product created,Updated, Deleted and on New Order--nodeCache needed to me REVALIDATED
  if (nodeCache.has("latest-products")) {
    products = JSON.parse(nodeCache.get("latest-products") as string);
  } else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(4);
    nodeCache.set("latest-products", JSON.stringify(products));
  }
  return res.status(200).json({ success: true, products });
});

export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (nodeCache.has("categories")) {
    categories = JSON.parse(nodeCache.get("categories") as string);
  } else {
    categories = await Product.distinct("category");

    nodeCache.set("categories", JSON.stringify(categories));
  }
  return res.status(200).json({ success: true, categories });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {
  let allproducts;
  if (nodeCache.has("allproducts")) {
    allproducts = JSON.parse(nodeCache.get("allproducts") as string);
  } else {
    allproducts = await Product.find({});
    if (!allproducts) return next(new ErrorHandler("No Data Available", 400));
    nodeCache.set("allproducts", JSON.stringify(allproducts));
  }
  return res.status(200).json({ success: true, allproducts });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  let singleProduct;
  if (nodeCache.has(`single-product-${id}`)) {
    singleProduct = JSON.parse(nodeCache.get(`single-product-${id}`) as string);
  } else {
    singleProduct = await Product.findById(id);
    if (!singleProduct) return next(new ErrorHandler("Product not found", 404));
    nodeCache.set(`single-product-${id}`, JSON.stringify(singleProduct));
  }
  return res.status(200).json({
    success: true,
    singleProduct,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, category, price, stock } = req.body;
    const photo = req.file;
    if (!photo) return next(new ErrorHandler("Please provide photo", 400));
    if (!name || !category || !price || !stock) {
      rm(photo.path, () => console.log("Deleted"));
      return next(new ErrorHandler("Please provide all fields", 400));
    }
    await Product.create({
      name,
      photo: photo.path,
      category: category.toLowerCase(),
      price,
      stock,
    });
    //Clearing the NodeCache after creating new product
    revalidateCache({ product: true,admin:true });
    return res
      .status(201)
      .json({ success: true, message: "Product Created Successfully" });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, category, price, stock } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Invalid product Id", 404));
  if (photo) {
    rm(product.photo, () => {
      console.log("Old photo deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();
  //Clearing the NodeCache after updating the product
  revalidateCache({ product: true, admin:true, productId: String(product._id) });
  return res.status(200).json({
    success: true,
    message: "Product Updated",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  rm(product.photo, () => {
    console.log("Product photo deleted");
  });
  await product.deleteOne();
  //Clearing the NodeCache after deleting the product
  revalidateCache({ product: true, admin:true, productId: String(product._id) });

  return res.status(200).json({
    success: true,
    message: "Product Details Deleted",
  });
});
