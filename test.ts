interface Sale {
  product: string;
  category: string;
  price: number;
  quantity: number;
}

const salesData: Sale[] = [
  { product: "iPhone", category: "Electronics", price: 999, quantity: 2 },
  { product: "MacBook", category: "Electronics", price: 1999, quantity: 1 },
  { product: "T-shirt", category: "Clothing", price: 25, quantity: 5 },
  { product: "Coffee", category: "Food", price: 5, quantity: 10 },
  { product: "Headphones", category: "Electronics", price: 299, quantity: 3 },
];

const categoryRevenue: { [key: string]: number } = {};

let maxRevenueProduct = { product: "", revenue: 0 };

const productRevenue: { [key: string]: number } = {};

salesData.forEach((sale) => {
  const revenue = sale.price * sale.quantity;

  if (categoryRevenue[sale.category]) {
    categoryRevenue[sale.category] += revenue;
  } else {
    categoryRevenue[sale.category] = revenue;
  }

  productRevenue[sale.product] = revenue;

  if (revenue > maxRevenueProduct.revenue) {
    maxRevenueProduct = { product: sale.product, revenue };
  }
});

const sortedCategories = Object.entries(categoryRevenue).sort(
  ([, revenueA], [, revenueB]) => revenueB - revenueA
);

console.log('Категории по выручке:');
sortedCategories.forEach(([category, revenue]) => {
    console.log(`${category}: ${revenue}`);
});

console.log(`\nТовар с наибольшей выручкой: ${maxRevenueProduct.product} (${maxRevenueProduct.revenue})`);