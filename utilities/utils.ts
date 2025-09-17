import { Product } from "../api/types/product";
import { User } from "../api/types/user";
import { Cart } from "../api/types/cart";
import { sleep } from "k6";
import { TEST_DATA } from "../config";

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomProduct(): Product {
  return {
    title: `Performance Test Product ${getRandomInt(1, 10000)}`,
    price: Math.round((Math.random() * 1000 + 10) * 100) / 100,
    description: "This is a performance test product",
    category: getRandomElement(TEST_DATA.CATEGORIES),
    image: "https://via.placeholder.com/640x480.png/09f/fff",
  };
}

export function getRandomUser(): User {
  const id = getRandomInt(1, 100000);
  return {
    email: `perftest${id}@example.com`,
    username: `perfuser${id}`,
    password: "testpass123",
    name: {
      firstname: `TestUser${id}`,
      lastname: `LastName${id}`,
    },
    address: {
      city: "Test City",
      street: "Performance St",
      number: getRandomInt(1, 9999),
      zipcode: `${getRandomInt(10000, 99999)}`,
      geolocation: {
        lat: (Math.random() * 180 - 90).toFixed(4),
        long: (Math.random() * 360 - 180).toFixed(4),
      },
    },
    phone: `1-555-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
  };
}

export function getRandomCart(): Cart {
  const productCount = getRandomInt(1, 5);
  const products: Array<{ productId: number; quantity: number }> = [];

  for (let i = 0; i < productCount; i++) {
    products.push({
      productId: getRandomInt(1, 20),
      quantity: getRandomInt(1, 5),
    });
  }

  return {
    userId: getRandomInt(1, 10),
    date: new Date().toISOString().split("T")[0],
    products,
  };
}

export async function exponentialBackoff<T>(
  operation: () => T,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      return operation();
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }
      await sleep(delay / 1000);
      delay *= 2;
    }
  }
  throw new Error("Max retries exceeded");
}

export function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const random = Math.random() * totalWeight;

  let weightSum = 0;
  for (const item of items) {
    weightSum += item.weight;
    if (random <= weightSum) {
      return item;
    }
  }

  return items[items.length - 1]; // Fallback
}

export function executeWithProbability(probability: number, callback: () => void): boolean {
  if (Math.random() < probability) {
    callback();
    return true;
  }
  return false;
}

export function handleError(context: string, error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`${context} failed:`, errorMessage);
}
