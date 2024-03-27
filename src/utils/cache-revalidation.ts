import { nodeCache } from "../app.js";
import { RevalidateCacheProps } from "../types/types.js";

export const revalidateCache = ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}: RevalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = ["latest-products", "categories", "products"];

    if (typeof productId === "string")
      productKeys.push(`single-product-${productId}`);

    if (typeof productId === "object")
      productId.forEach((i) => productKeys.push(`single-product-${i}`));

    nodeCache.del(productKeys);
  }
  if (order) {
    const ordersKeys: string[] = [
      "allorders",
      `myorders-${userId}`,
      `order-${orderId}`,
    ];

    nodeCache.del(ordersKeys);
  }
  if (admin) {
    nodeCache.del(["admin-stats"]);
  }
};
