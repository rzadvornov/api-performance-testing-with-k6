# Fake Store API Performance Tests

Comprehensive k6 performance testing suite for the Fake Store API (https://api.escuelajs.co/docs/) built with TypeScript.

## 🚀 Overview

This project provides a complete performance testing framework covering all major performance testing types:

- **Load Testing** - Normal expected load conditions
- **Stress Testing** - Finding system breaking points  
- **Spike Testing** - Sudden traffic surges
- **Volume Testing** - Large data processing capabilities
- **Endurance Testing** - Long-term stability and reliability

## 📋 Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) - Performance testing tool
- Node.js 16+ (for TypeScript support and package management)
- TypeScript compiler (optional, for development)

## 🏗️ Architecture

### API Client Classes

The testing framework uses a layered architecture with specialized API clients:

```
BaseAPI (Abstract)
├── ProductsAPI - Product operations (CRUD, search, filtering)
├── UsersAPI - User management operations  
├── CategoriesAPI - Category operations and product filtering
└── AuthAPI - Authentication and session management
```

### Test Types

| Test Type | Duration | Users | Focus |
|-----------|----------|-------|-------|
| **Load** | 9 min | 10 | Normal expected load |
| **Stress** | 23 min | 10→50 | Breaking point identification |
| **Spike** | 7.5 min | 2→50 | Sudden traffic surge handling |
| **Volume** | 14 min | 5 | Large data processing |
| **Endurance** | 24 min | 8 | Long-term stability |

## 🚀 Quick Start

### Installation

```bash
# Clone or create project directory
mkdir fake-store-api-tests && cd fake-store-api-tests

# Install dependencies
npm install

# Setup test directories
npm run setup

# Validate k6 installation
npm run validate
```

### Running Individual Tests

```bash
# Load test (recommended starting point)
npm run test:load

# Stress test
npm run test:stress

# Spike test  
npm run test:spike

# Volume test
npm run test:volume

# Endurance test (longest duration)
npm run test:endurance
```

### Running Test Suites

```bash
# Quick smoke test
npm run test:smoke

# Standard performance suite (Load + Stress + Spike)
npm run test:standard

# Complete comprehensive suite (all tests)
npm run test:comprehensive
```

## 📊 Test Details

### Load Test
- **Purpose**: Validate system performance under expected normal load
- **Pattern**: 10 concurrent users for 5 minutes
- **Scenarios**: Product browsing, search, user management, category exploration
- **Key Metrics**: Response time (p95 < 500ms), Error rate (< 10%)

### Stress Test  
- **Purpose**: Find system breaking point and test recovery
- **Pattern**: Gradual increase from 10 to 50 users
- **Scenarios**: Rapid-fire requests, heavy data retrieval, concurrent CRUD operations
- **Key Metrics**: Breaking point identification, Error rate during stress, Recovery behavior

### Spike Test
- **Purpose**: Test sudden traffic surge handling (flash sales, viral content)
- **Pattern**: 2 users → 50 users sudden spike → return to baseline
- **Scenarios**: Flash sale traffic, viral content access, bot-like activity
- **Key Metrics**: Response time during spike, Error rate spike, Recovery time

### Volume Test
- **Purpose**: Test large data processing capabilities
- **Pattern**: 5 users performing data-intensive operations
- **Scenarios**: Bulk data retrieval, large pagination, mass export simulation
- **Key Metrics**: Data throughput, Large payload response time, Memory usage

### Endurance Test
- **Purpose**: Long-term stability and memory leak detection
- **Pattern**: 8 users sustained for 40 minutes
- **Scenarios**: Regular user activity, maintenance simulation, cache warmup
- **Key Metrics**: Performance consistency, Memory leak detection, Resource cleanup

## 🔧 Configuration

### Environment Variables

```bash
# Optional: Override default test configuration
export K6_VUS=20              # Number of virtual users
export K6_DURATION=10m        # Test duration
export K6_ITERATIONS=1000     # Total iterations

# Custom API base URL (if testing different environment)
export API_BASE_URL=https://api.escuelajs.co/api/v1
```

### Custom Configuration

Edit `config.ts` to modify:
- Test stages and duration
- Performance thresholds
- Test data and scenarios
- API endpoints and parameters

## 📈 Results and Monitoring

### Output Files

Results are saved to the `results/` directory:

```
results/
├── load-test-results.json
├── stress-test-results.json  
├── spike-test-results.json
├── volume-test-results.json
└── endurance-test-results.json
```

### Key Metrics to Monitor

1. **Response Time Metrics**
   - Average response time
   - 95th percentile response time
   - Maximum response time

2. **Throughput Metrics**
   - Requests per second
   - Data transfer rate
   - API calls per endpoint

3. **Error Metrics**
   - Error rate percentage
   - Error types and patterns
   - Failed request distribution

4. **Resource Metrics**
   - Memory usage patterns
   - Connection pool utilization
   - Cache hit/miss ratios

### Analyzing Results

```bash
# View test summary
k6 run --summary-export=summary.json load-test.ts

# Generate detailed HTML report (requires k6 reporter)
k6 run --out json=results.json load-test.ts
k6-reporter results.json --output report.html
```

## 🎯 Test Scenarios

### Realistic User Behaviors

The tests simulate realistic user patterns:

- **Product Browsing**: Pagination, product details, category filtering
- **Search Activities**: Product search, price filtering, category exploration  
- **User Management**: Profile access, authentication flows
- **E-commerce Patterns**: Shopping cart simulation, checkout processes
- **Mobile/Desktop Mix**: Different usage patterns and request frequencies

### API Coverage

All major API endpoints are tested:

- `GET /products` - Product listing with pagination
- `GET /products/{id}` - Individual product details
- `GET /categories` - Category listing
- `GET /users` - User management
- `POST /auth/login` - Authentication
- `GET /auth/profile` - User profile access
- CRUD operations for all resource types

## 🔍 Troubleshooting

### Common Issues

1. **High Error Rates**
   ```bash
   # Check API availability
   curl -I https://api.escuelajs.co/api/v1/products
   
   # Reduce load if API has rate limiting
   # Edit config.ts to lower concurrent users
   ```

2. **Timeout Issues**
   ```bash
   # Increase timeout in BaseAPI.ts
   # Add custom timeout to test configuration
   ```

3. **Memory Issues**
   ```bash
   # Monitor k6 memory usage
   # Reduce batch sizes in volume tests
   # Check for memory leaks in endurance tests
   ```

### Performance Tuning

1. **For Higher Load**
   - Increase virtual users gradually
   - Monitor system resources
   - Implement proper think times

2. **For Lower Latency**
   - Optimize request patterns
   - Use batch requests where appropriate
   - Implement connection pooling

## 📚 Best Practices

### Test Execution

1. **Start Small**: Begin with load tests before stress/spike tests
2. **Monitor Resources**: Watch both client and server resources
3. **Baseline First**: Establish performance baselines before optimization
4. **Realistic Data**: Use production-like data volumes and patterns

### Result Analysis

1. **Look for Trends**: Analyze performance over time, not just averages
2. **Correlate Metrics**: Connect response times with error rates and throughput
3. **Test Repeatability**: Run tests multiple times for consistent results
4. **Environment Consistency**: Use consistent test environments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-test`)
3. Add your test scenarios or improvements
4. Update documentation
5. Submit a pull request

### Adding New Test Scenarios

1. Create new scenario functions in existing test files
2. Add configuration to `config.ts`
3. Update test metadata in `test-runner.ts`
4. Document the new scenario in README

## 📝 License

MIT License - see LICENSE file for details

## 🔗 References

- [k6 Documentation](https://k6.io/docs/)
- [Fake Store API Documentation](https://api.escuelajs.co/docs/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/api-load-testing/)
- [TypeScript with k6](https://k6.io/docs/using-k6/typescript/)

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check k6 community forums
- Review API documentation for endpoint changes