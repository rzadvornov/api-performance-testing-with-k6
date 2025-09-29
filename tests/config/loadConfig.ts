import { calculateTotalMinutes } from "../../utilities/utils";
import { TEST_CONFIG } from "./config";
import { LoadTestConfig } from "./types/loadTestConfig";

const SCENARIO_DEFINITIONS = {
  browseCatalog: {
    weight: 30,
    enabled: true,
    description: "Catalog browsing and pagination",
  },
  searchAndFilter: {
    weight: 25,
    enabled: true,
    description: "Search, filter by price, and category",
  },
  viewProductDetails: {
    weight: 20,
    enabled: true,
    description: "Deep dive into product pages",
  },
  userManagement: {
    weight: 5,
    enabled: true,
    description: "Admin/profile views and registration checks",
  },
  categoryBrowsing: {
    weight: 15,
    enabled: true,
    description: "Category list and product listing",
  },
  authenticationFlow: {
    weight: 5,
    enabled: true,
    description: "Login, get profile, and logout",
  },
};

export const LOAD_CONFIG: LoadTestConfig = {
  stages: TEST_CONFIG.LOAD_TEST.stages,
  thresholds: TEST_CONFIG.LOAD_TEST.thresholds,
  duration: {
    totalMinutes: calculateTotalMinutes(TEST_CONFIG.LOAD_TEST.stages),
  },
  thinkTime: {
    min: 1.0,
    max: 3.0,
  },
  logging: {
    iterationInterval: 50, 
  },
  scenarios: SCENARIO_DEFINITIONS,
};