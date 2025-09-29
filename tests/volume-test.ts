import { Options } from "k6/options";
import { FakeStoreAPI } from "../api/FakeStoreAPI";
import { TEST_CONFIG, TEST_DATA } from "./config/config";
import {
  delay,
  selectWeightedScenario,
  getRandomInt,
} from "../utilities/utils";
import { VOLUME_CONFIG } from "./config/volumeConfig";
import { TeardownData, WeightedScenario } from "./config/types/commonTypesConfig";
export { handleSummary } from "../reporter/k6-summary";

type ValidScenarioName = Extract<keyof typeof VOLUME_CONFIG.scenarios, string>;

const scenarioFunctions: Record<ValidScenarioName, Function> = {
  bulkDataRetrieval: bulkDataRetrieval,
  largePaginationCycles: largePaginationCycles,
  comprehensiveDataSweep: comprehensiveDataSweep,
  bulkCreationOperations: bulkCreationOperations,
  dataMiningSimulation: dataMiningSimulation,
  archivalDataAccess: archivalDataAccess,
  massDataExportSimulation: massDataExportSimulation,
  continuousDataStreaming: continuousDataStreaming,
};

const weightedScenarios: WeightedScenario[] = (
  Object.keys(VOLUME_CONFIG.scenarios) as ValidScenarioName[]
).map((scenarioName) => {
  const config = VOLUME_CONFIG.scenarios[scenarioName];

  return {
    name: scenarioName,
    func: scenarioFunctions[scenarioName],
    weight: config.weight,
    dynamicWeight: (_runningTime: number) => config.weight,
  };
});

export const options: Options = {
  stages: TEST_CONFIG.VOLUME_TEST.stages,
  thresholds: TEST_CONFIG.VOLUME_TEST.thresholds,
  tags: {
    test_type: "volume_test",
  },
};

// Global variables for tracking
const api = new FakeStoreAPI();
let iterationCount = 0;
let sessionStartTime = Date.now();

export function setup(): TeardownData {
  console.log("📊 Starting Volume Test for Fake Store API");
  console.log("📈 Test Configuration:");
  console.log(
    `   - Virtual Users: ${TEST_CONFIG.VOLUME_TEST.stages
      .map((s) => s.target)
      .join(" → ")}`
  );
  console.log(`   - Duration: ${VOLUME_CONFIG.duration.totalMinutes} minutes`);
  console.log("   - Focus: Large data processing and bulk operations");
  console.log("   - Target: Process significant amounts of data efficiently");

  return {
    startTime: new Date().toISOString(),
    expectedIterations: 0,
  };
}

function bulkDataRetrieval(_runningTime: number, _iterationCount: number) {
  // Large page size requests to maximize data transfer
  const bulkRequests = [
    api.products.getAllProducts(0, 100),
    api.products.getAllProducts(100, 100),
    api.products.getAllProducts(200, 100),
    api.users.getAllUsers(0, 50),
    api.categories.getAllCategories(0, 20),
  ];

  for (const request of bulkRequests) {
    try {
      request;
    } catch (error) {
      console.log(`Bulk retrieval error: ${error}`);
    }
  }
  delay(0.2);

  for (let i = 1; i <= 20; i++) {
    try {
      api.products.getProductById(i);
    } catch (error) {
      console.log(`Product detail error for ID ${i}: ${error}`);
    }
  }
}

function largePaginationCycles(_runningTime: number, _iterationCount: number) {
  const pageSize = 50;
  const totalPages = 10;

  for (let page = 0; page < totalPages; page++) {
    const offset = page * pageSize;

    try {
      api.products.getAllProducts(offset, pageSize);
    } catch (error) {
      console.log(`Products pagination error at page ${page}: ${error}`);
    }

    try {
      api.users.getAllUsers(offset, Math.min(pageSize, 30));
    } catch (error) {
      console.log(`Users pagination error at page ${page}: ${error}`);
    }

    delay(0.1);
  }
}

function comprehensiveDataSweep(_runningTime: number, _iterationCount: number) {
  for (const categoryId of TEST_DATA.CATEGORIES.SAMPLE_IDS) {
    try {
      api.categories.getProductsByCategory(categoryId, 0, 30);
    } catch (error) {
      console.log(`Category sweep error for category ${categoryId}: ${error}`);
    }
  }

  for (const priceRange of TEST_DATA.PRODUCTS.PRICE_RANGES) {
    try {
      api.products.getProductsByPriceRange(priceRange.min, priceRange.max);
    } catch (error) {
      console.log(`Price range sweep error: ${error}`);
    }
  }

  try {
    api.users.getUsersBatch(TEST_DATA.USERS.SAMPLE_IDS);
  } catch (error) {
    console.log(`User batch error: ${error}`);
  }

  try {
    api.products.getProductsBatch(TEST_DATA.PRODUCTS.SAMPLE_IDS);
  } catch (error) {
    console.log(`Product batch error: ${error}`);
  }

  delay(0.15);
}

function bulkCreationOperations(_runningTime: number, _iterationCount: number) {
  const createdProductIds = [];

  try {
    const bulkCount = 10;

    for (let i = 0; i < bulkCount; i++) {
      const productData = {
        ...TEST_DATA.NEW_PRODUCT,
        title: `Volume Test Product ${Date.now()}_${i}`,
        description: `Generated during volume testing - batch ${i}. ${new Array(
          20
        )
          .fill("Data padding for larger payloads.")
          .join(" ")}`,
        price: getRandomInt(10, 509),
        categoryId:
          TEST_DATA.CATEGORIES.SAMPLE_IDS[
            i % TEST_DATA.CATEGORIES.SAMPLE_IDS.length
          ],
      };

      try {
        const response = api.products.createProduct(productData);

        const productJson = response.json();

        if (productJson && (productJson as any).id) {
          createdProductIds.push((productJson as any).id);
        }
      } catch (error) {
        console.log(`Product creation error for item ${i}: ${error}`);
      }
    }

    delay(0.2);

    // Bulk user creation
    for (let i = 0; i < 5; i++) {
      const userData = {
        ...TEST_DATA.NEW_USER,
        email: `volume_test_${Date.now()}_${i}@example.com`,
        name: `Volume Test User ${Date.now()}_${i}`,
      };

      try {
        api.users.createUser(userData);
      } catch (error) {
        console.log(`User creation error for item ${i}: ${error}`);
      }
    }

    delay(0.2);

    // Cleanup created products to avoid data pollution
    for (const productId of createdProductIds) {
      try {
        api.products.deleteProduct(productId);
      } catch (error) {
        console.log(`Product cleanup error for ID ${productId}: ${error}`);
      }
    }
  } catch (error) {
    console.log(`Bulk creation error: ${error}`);
  }
}

function dataMiningSimulation(_runningTime: number, _iterationCount: number) {
  for (let minPrice = 0; minPrice < 500; minPrice += 100) {
    const maxPrice = minPrice + 100;
    try {
      api.products.getProductsByPriceRange(minPrice, maxPrice);
    } catch (error) {
      console.log(
        `Price mining error for range ${minPrice}-${maxPrice}: ${error}`
      );
    }
  }

  for (const categoryId of TEST_DATA.CATEGORIES.SAMPLE_IDS) {
    try {
      api.categories.getProductsByCategory(categoryId, 0, 50);
    } catch (error) {
      console.log(`Category mining error for category ${categoryId}: ${error}`);
    }
  }

  for (const term of TEST_DATA.SEARCH.searchTerms) {
    try {
      api.products.searchProducts(term);
    } catch (error) {
      console.log(`Search mining error for term '${term}': ${error}`);
    }
  }

  delay(0.3);
}

function archivalDataAccess(_runningTime: number, _iterationCount: number) {
  for (let id = 50; id <= 100; id += 10) {
    try {
      api.products.getProductById(id);
    } catch (error) {
      console.log(`Archival product access error for ID ${id}: ${error}`);
    }
  }

  const deepPaginationRequests = [
    {
      fn: () => api.products.getAllProducts(500, 50),
      desc: "Deep products pagination",
    },
    {
      fn: () => api.products.getAllProducts(1000, 50),
      desc: "Deeper products pagination",
    },
    { fn: () => api.users.getAllUsers(100, 30), desc: "Deep users pagination" },
  ];

  for (const request of deepPaginationRequests) {
    try {
      request.fn();
    } catch (error) {
      console.log(`${request.desc} error: ${error}`);
    }
  }

  delay(0.25);
}

function massDataExportSimulation(
  _runningTime: number,
  _iterationCount: number
) {
  for (let offset = 0; offset < 1000; offset += 100) {
    try {
      api.products.getAllProducts(offset, 100);
    } catch (error) {
      console.log(`Product export error at offset ${offset}: ${error}`);
    }
  }

  try {
    api.users.getAllUsers(0, 100);
  } catch (error) {
    console.log(`User export error: ${error}`);
  }

  for (const categoryId of TEST_DATA.CATEGORIES.SAMPLE_IDS) {
    try {
      api.categories.getProductsByCategory(categoryId, 0, 100);
    } catch (error) {
      console.log(`Category export error for category ${categoryId}: ${error}`);
    }
  }

  delay(0.4);
}

function continuousDataStreaming(
  _runningTime: number,
  _iterationCount: number
) {
  const streamingDuration = 5;
  const startTime = Date.now();

  while (Date.now() - startTime < streamingDuration * 1000) {
    const streamRequests = [
      {
        fn: () => api.products.getAllProducts(getRandomInt(0, 200), 20),
        desc: "Stream products",
      },
      {
        fn: () => api.users.getAllUsers(getRandomInt(0, 50), 10),
        desc: "Stream users",
      },
      {
        fn: () => api.categories.getAllCategories(0, 5),
        desc: "Stream categories",
      },
    ];

    for (const request of streamRequests) {
      try {
        request.fn();
      } catch (error) {
        console.log(`${request.desc} streaming error: ${error}`);
      }
    }

    delay(0.1);
  }
}

export default function () {
  iterationCount++;
  const currentTime = Date.now();
  const runningTime = Math.floor((currentTime - sessionStartTime) / 1000 / 60); 

  if (iterationCount % VOLUME_CONFIG.logging.iterationInterval === 0) {
    console.log(
      `📊 Volume Test Progress: ${runningTime} minutes, ${iterationCount} iterations completed.`
    );
  }

  const scenario = selectWeightedScenario(weightedScenarios, runningTime);
  scenario(runningTime, iterationCount);

  delay(VOLUME_CONFIG.thinkTime.min, VOLUME_CONFIG.thinkTime.max);
}

export function teardown(data: TeardownData) {
  const endTime = new Date();
  const duration = Math.floor((Date.now() - sessionStartTime) / 1000 / 60);

  console.log("📊 Volume Test completed");
  console.log(`   - Started: ${data.startTime}`);
  console.log(`   - Ended: ${endTime.toISOString()}`);
  console.log(`   - Total Duration: ${duration} minutes`);
  console.log(`   - Total Iterations: ${iterationCount}`);

  console.log("📈 Analyze results for data processing capabilities");
  console.log("🔍 Key metrics to evaluate:");
  console.log("   - Total data throughput");
  console.log("   - Large payload response times");
  console.log("   - Bulk operation performance");
  console.log("   - Memory usage patterns");
  console.log("   - Database query efficiency");
  console.log("   - API rate limiting behavior with large requests");
}
