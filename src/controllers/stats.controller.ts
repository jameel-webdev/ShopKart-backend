import { nodeCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { calculatePercentage } from "../utils/calculatePercentage.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats = {};

  if (nodeCache.has("admin-stats")) {
    stats = JSON.parse(nodeCache.get("admin-stats") as string);
  } else {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfThisMonth = today;

    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const thisMonth = {
      start: startOfThisMonth,
      end: endOfThisMonth,
    };
    const lastMonth = {
      start: startOfLastMonth,
      end: endOfLastMonth,
    };

    const thisMonthProductsPromise = Product.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthProductsPromise = Product.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthUsersPromise = User.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthUsersPromise = User.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const thisMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });
    const lastMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });
    const lastSixMonthOrdersPromise = Order.find({
      createdAt: {
        $gte: sixMonthsAgo,
        $lte: today,
      },
    });

    const latestTransactionsPromise = Order.find({})
      .select(["orderItems", "discount", "total", "status"])
      .limit(4);

    const [
      thisMonthUsers,
      thisMonthProducts,
      thisMonthOrders,
      lastMonthUsers,
      lastMonthProducts,
      lastMonthOrders,
      usersCount,
      productsCount,
      ordersCount,
      lastSixMonthOrders,
      categories,
      femaleUsersCount,
      latestTransactions,
    ] = await Promise.all([
      thisMonthUsersPromise,
      thisMonthProductsPromise,
      thisMonthOrdersPromise,
      lastMonthUsersPromise,
      lastMonthProductsPromise,
      lastMonthOrdersPromise,
      User.countDocuments(),
      Product.countDocuments(),
      Order.find({}).select("total"),
      lastSixMonthOrdersPromise,
      Product.distinct("category"),
      User.countDocuments({ gender: "female" }),
      latestTransactionsPromise,
    ]);

    const thisMonthRevenue = thisMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (total, order) => total + (order.total || 0),
      0
    );
    const changePercent = {
      revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
      product: calculatePercentage(
        thisMonthProducts.length,
        lastMonthProducts.length
      ),
      user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
      order: calculatePercentage(
        thisMonthOrders.length,
        lastMonthOrders.length
      ),
    };

    const revenue = ordersCount.reduce(
      (total, order) => total + (order.total || 0),
      0
    );

    const counts = {
      revenue,
      user: usersCount,
      product: productsCount,
      order: ordersCount.length,
    };

    const orderMonthCounts = new Array(6).fill(0);
    const orderMonthlyRevenue = new Array(6).fill(0);

    lastSixMonthOrders.forEach((order) => {
      const createdDate = order.createdAt;
      const monthDifference = today.getMonth() - createdDate.getMonth();

      if (monthDifference < 6) {
        orderMonthCounts[6 - monthDifference - 1] += 1;
        orderMonthlyRevenue[6 - monthDifference - 1] += order.total;
      }
    });

    const categoriesCountPromise = categories.map((category) =>
      Product.countDocuments({ category })
    );

    const categoriesCount = await Promise.all(categoriesCountPromise);
    const categoryCount: Record<string, number>[] = [];

    categories.forEach((categ, idx) => {
      categoryCount.push({
        [categ]: Math.round((categoriesCount[idx] / productsCount) * 100),
      });
    });

    const userRatio = {
      male: usersCount - femaleUsersCount,
      female: femaleUsersCount,
    };
    const modifiedLatestTransaction = latestTransactions.map((ele) => ({
      _id: ele._id,
      discount: ele.discount,
      amount: ele.total,
      quantity: ele.orderItems.length,
      status: ele.status,
    }));
    stats = {
      categoryCount,
      changePercent,
      counts,
      chart: {
        order: orderMonthCounts,
        revenue: orderMonthlyRevenue,
      },
      userRatio,
      latestTransactions: modifiedLatestTransaction,
    };

    nodeCache.set("admin-stats", JSON.stringify(stats));
  }

  return res.status(200).json({
    success: true,
    stats,
  });
});
