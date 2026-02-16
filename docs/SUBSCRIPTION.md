# Subscription API Documentation

## Overview
The Subscription API manages subscription plans available in the system. Subscriptions can include multiple services and device types, with different pricing and plan durations.

## Schema

### Subscription Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Integer | Auto | Unique identifier |
| `name` | String | ✓ | Subscription plan name |
| `plan_type` | Enum | ✓ | Plan type: `Normal Plan`, `UV Plan`, `UF Plan` |
| `duration` | Enum | ✓ | Duration: `monthly_3`, `monthly_4`, `monthly_6`, `one_time` |
| `cost` | Decimal | ✓ | Subscription cost (≥ 0) |
| `sales_subscribed` | Decimal | ✗ | Sales from subscribed users (≥ 0) |
| `sales_non_subscribed` | Decimal | ✗ | Sales from non-subscribed users (≥ 0) |
| `profit_subscribed` | Decimal | ✗ | Profit from subscribed users (≥ 0) |
| `profit_non_subscribed` | Decimal | ✗ | Profit from non-subscribed users (≥ 0) |
| `price_of_subscription` | Decimal | ✓ | Subscription price (≥ 0) |
| `description` | Text | ✗ | Subscription description |
| `device_types` | Relation | ✗ | Many-to-many relation to Device Types |
| `services` | Relation | ✗ | Many-to-many relation to Services |
| `publishedAt` | DateTime | Auto | Publication timestamp |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

## Enumerations

### Plan Types
- `Normal Plan` - Standard subscription plan
- `UV Plan` - UV variant plan
- `UF Plan` - UF variant plan

### Durations
- `monthly_3` - 3-month subscription
- `monthly_4` - 4-month subscription
- `monthly_6` - 6-month subscription
- `one_time` - One-time purchase

## API Endpoints

### List All Subscriptions
```http
GET /api/subscriptions
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `populate` | String | Relations to populate (e.g., `device_types,services`) |
| `filters[plan_type][$eq]` | String | Filter by plan type |
| `filters[duration][$eq]` | String | Filter by duration |
| `filters[price_of_subscription][$gte]` | Decimal | Filter by minimum price |
| `sort` | String | Sort by field (e.g., `price_of_subscription:asc`) |
| `pagination[page]` | Integer | Page number |
| `pagination[pageSize]` | Integer | Items per page |

#### Response Example
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Basic 3-Month Plan",
        "plan_type": "Normal Plan",
        "duration": "monthly_3",
        "cost": 150.00,
        "sales_subscribed": 500.00,
        "sales_non_subscribed": 300.00,
        "profit_subscribed": 250.00,
        "profit_non_subscribed": 150.00,
        "price_of_subscription": 29.99,
        "description": "Basic subscription with 3 months validity",
        "device_types": {
          "data": [
            {
              "id": 1,
              "attributes": {
                "type": "Mobile"
              }
            }
          ]
        },
        "services": {
          "data": [
            {
              "id": 1,
              "attributes": {
                "name": "SMS Service"
              }
            }
          ]
        },
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z",
        "publishedAt": "2025-01-15T10:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

### Get Single Subscription
```http
GET /api/subscriptions/:id
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `populate` | String | Relations to populate |

#### Response Example
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "Basic 3-Month Plan",
      "plan_type": "Normal Plan",
      "duration": "monthly_3",
      "cost": 150.00,
      "sales_subscribed": 500.00,
      "price_of_subscription": 29.99,
      "device_types": { "data": [ ... ] },
      "services": { "data": [ ... ] },
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### Create Subscription
```http
POST /api/subscriptions
Content-Type: application/json
```

#### Request Body
```json
{
  "data": {
    "name": "Premium 6-Month Plan",
    "plan_type": "UV Plan",
    "duration": "monthly_6",
    "cost": 250.00,
    "price_of_subscription": 49.99,
    "description": "Premium plan with 6 months validity and extra features",
    "device_types": [1, 2],
    "services": [1, 2, 3]
  }
}
```

#### Response
Returns the created Subscription object with generated ID.

### Update Subscription
```http
PUT /api/subscriptions/:id
Content-Type: application/json
```

#### Request Body
```json
{
  "data": {
    "name": "Premium 6-Month Plan - Updated",
    "price_of_subscription": 54.99,
    "sales_subscribed": 750.00,
    "profit_subscribed": 375.00
  }
}
```

### Delete Subscription
```http
DELETE /api/subscriptions/:id
```

## Frontend Implementation Examples

### React Hook Example
```typescript
// Fetch all subscriptions with filters
const fetchSubscriptions = async (
  planType?: string,
  duration?: string,
  minPrice?: number
) => {
  let url = 'http://localhost:1337/api/subscriptions?populate=*';
  
  if (planType) {
    url += `&filters[plan_type][$eq]=${planType}`;
  }
  if (duration) {
    url += `&filters[duration][$eq]=${duration}`;
  }
  if (minPrice !== undefined) {
    url += `&filters[price_of_subscription][$gte]=${minPrice}`;
  }
  
  const response = await fetch(url);
  const json = await response.json();
  return json.data;
};

// Fetch single subscription
const fetchSubscription = async (id: number) => {
  const response = await fetch(
    `http://localhost:1337/api/subscriptions/${id}?populate=*`
  );
  const json = await response.json();
  return json.data;
};

// Create subscription
const createSubscription = async (data: SubscriptionData) => {
  const response = await fetch('http://localhost:1337/api/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  return response.json();
};

// Update subscription
const updateSubscription = async (
  id: number,
  data: Partial<SubscriptionData>
) => {
  const response = await fetch(
    `http://localhost:1337/api/subscriptions/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    }
  );
  return response.json();
};

// Get subscriptions by plan type
const getSubscriptionsByPlanType = (planType: string) => {
  return fetchSubscriptions(planType);
};

// Get subscriptions by duration
const getSubscriptionsByDuration = (duration: string) => {
  return fetchSubscriptions(undefined, duration);
};

// Calculate total profit
const calculateTotalProfit = (subscription: any) => {
  const subscribed = subscription.attributes.profit_subscribed || 0;
  const nonSubscribed = subscription.attributes.profit_non_subscribed || 0;
  return subscribed + nonSubscribed;
};

// Calculate ROI
const calculateROI = (subscription: any) => {
  const profit = calculateTotalProfit(subscription);
  const cost = subscription.attributes.cost || 0;
  return cost > 0 ? ((profit / cost) * 100).toFixed(2) : 0;
};
```

### GraphQL Query Example
```graphql
query GetSubscriptions(
  $planType: String,
  $duration: String,
  $minPrice: Decimal
) {
  subscriptions(
    filters: {
      plan_type: { eq: $planType }
      duration: { eq: $duration }
      price_of_subscription: { gte: $minPrice }
    }
    pagination: { pageSize: 50 }
    sort: ["price_of_subscription:asc"]
  ) {
    data {
      id
      attributes {
        name
        plan_type
        duration
        cost
        sales_subscribed
        sales_non_subscribed
        profit_subscribed
        profit_non_subscribed
        price_of_subscription
        description
        device_types {
          data {
            id
            attributes {
              type
            }
          }
        }
        services {
          data {
            id
            attributes {
              name
            }
          }
        }
        publishedAt
      }
    }
    meta {
      pagination {
        total
        page
        pageSize
      }
    }
  }
}

query GetSubscriptionById($id: ID!) {
  subscriptions(filters: { id: { eq: $id } }) {
    data {
      id
      attributes {
        name
        plan_type
        duration
        cost
        price_of_subscription
        description
        device_types { data { id } }
        services { data { id } }
      }
    }
  }
}

query GetSubscriptionsByPlanType($planType: String!) {
  subscriptions(filters: { plan_type: { eq: $planType } }) {
    data {
      id
      attributes {
        name
        price_of_subscription
      }
    }
  }
}
```

## Filtering Examples

### Get Normal Plan Subscriptions
```
GET /api/subscriptions?filters[plan_type][$eq]=Normal Plan
```

### Get 3-Month Subscriptions
```
GET /api/subscriptions?filters[duration][$eq]=monthly_3
```

### Get UV Plan 6-Month Subscriptions
```
GET /api/subscriptions?filters[plan_type][$eq]=UV Plan&filters[duration][$eq]=monthly_6
```

### Get Affordable Subscriptions (Under $50)
```
GET /api/subscriptions?filters[price_of_subscription][$lt]=50&sort=price_of_subscription:asc
```

## Financial Metrics

### Total Profit
```
Total Profit = Profit (Subscribed) + Profit (Non-Subscribed)
```

### Return on Investment (ROI)
```
ROI = ((Profit) / Cost) × 100%
```

### Profitability by Subscription Type
```
Subscribed Margin = (Sales Subscribed - Cost) / Sales Subscribed × 100%
Non-Subscribed Margin = (Sales Non-Subscribed - Cost) / Sales Non-Subscribed × 100%
```

## Notes
- All decimal fields must be ≥ 0
- Subscriptions support draft and publish functionality
- Duration field determines subscription validity period
- Plan type helps categorize different subscription tiers
- A subscription can include multiple device types and services
- Financial metrics help track subscription performance
