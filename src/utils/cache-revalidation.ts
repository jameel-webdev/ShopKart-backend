import { nodeCache } from "../app.js";
import { Product } from "../models/product.model.js";
import { RevalidateCacheProps } from "../types/types.js";

export const revalidateCache = async ({
  product,
  order,
  admin,
}: RevalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "allproducts",
    ];

    const productsId = await Product.find({}).select("_id");

    productsId.forEach((element) => {
      const id = element._id;

      productKeys.push(`single-product-${id}`);
    });

    nodeCache.del(productKeys);
  }
  if (order) {
  }
  if (admin) {
  }
};
