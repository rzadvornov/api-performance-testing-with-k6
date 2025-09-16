import { sleep } from "k6";
import { FakeStoreAPI } from "../api/FakeStoreAPI";
import { volumeTestOptions, USER_JOURNEY_CONFIG, TEST_DATA } from "../config";
import {
  getRandomElement,
  getRandomInt,
  executeWithProbability,
  handleError,
} from "../utilities/utils";

export let options = volumeTestOptions;

const api = new FakeStoreAPI();

const JOURNEY_STEPS = [
  { weight: 0.9, execute: browseCategory, name: "Browse Category" },
  { weight: 0.8, execute: viewProductDetails, name: "View Product Details" },
  { weight: 0.3, execute: checkUserProfile, name: "Check User Profile" },
  { weight: 0.2, execute: viewCart, name: "View Cart" },
  { weight: 0.4, execute: viewUserCarts, name: "View User Carts" },
  { weight: 0.5, execute: viewLimitedProducts, name: "View Limited Products" },
  { weight: 0.1, execute: viewAllCarts, name: "View All Carts" },
  {
    weight: 0.2,
    execute: batchProductOperations,
    name: "Batch Product Operations",
  },
];

export default function () {
  try {
    simulateRealisticUserJourney();
  } catch (error) {
    handleError("User journey simulation", error);
  }

  const thinkTime = getRandomInt(
    USER_JOURNEY_CONFIG.THINK_TIME.MIN,
    USER_JOURNEY_CONFIG.THINK_TIME.MAX
  );
  sleep(thinkTime);
}

function simulateRealisticUserJourney() {
  api.products.getAllProducts();
  api.products.getProductCategories();

  JOURNEY_STEPS.forEach(({ weight, execute }) => {
    executeWithProbability(weight, execute);
  });
}

function browseCategory() {
  const selectedCategory = getRandomElement(TEST_DATA.CATEGORIES);
  api.products.getProductsByCategory(selectedCategory);
}

function viewProductDetails() {
  const productId = getRandomInt(
    USER_JOURNEY_CONFIG.PRODUCT.MIN_ID,
    USER_JOURNEY_CONFIG.PRODUCT.MAX_ID
  );
  api.products.getProduct(productId);

  executeWithProbability(0.3, () => {
    const additionalProductId = getRandomInt(
      USER_JOURNEY_CONFIG.PRODUCT.MIN_ID,
      USER_JOURNEY_CONFIG.PRODUCT.MAX_ID
    );
    api.products.getProduct(additionalProductId);
  });
}

function checkUserProfile() {
  const userId = getRandomInt(
    USER_JOURNEY_CONFIG.USER.MIN_ID,
    USER_JOURNEY_CONFIG.USER.MAX_ID
  );
  api.users.getUser(userId);
}

function viewCart() {
  const cartId = getRandomInt(
    USER_JOURNEY_CONFIG.CART.MIN_ID,
    USER_JOURNEY_CONFIG.CART.MAX_ID
  );
  api.carts.getCart(cartId);
}

function viewUserCarts() {
  const userId = getRandomInt(
    USER_JOURNEY_CONFIG.USER.MIN_ID,
    USER_JOURNEY_CONFIG.USER.MAX_ID
  );
  api.carts.getUserCarts(userId);
}

function viewLimitedProducts() {
  const limit = getRandomInt(5, 15);
  api.products.getLimitedProducts(limit);
}

function viewAllCarts() {
  api.carts.getAllCarts();
}

function batchProductOperations() {
  const productIds = Array.from({ length: 3 }, () =>
    getRandomInt(
      USER_JOURNEY_CONFIG.PRODUCT.MIN_ID,
      USER_JOURNEY_CONFIG.PRODUCT.MAX_ID
    )
  );
  api.products.batchGetProducts(productIds);
}