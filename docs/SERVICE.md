# Service API Documentation

## Overview
The Service API manages services available for different device types. Services have financial attributes (face value, expense, provider cut, revenue) and can be linked to subscriptions.

## Schema

### Service Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Integer | Auto | Unique identifier |
| `name` | String | ✓ | Service name |
| `description` | Text | ✗ | Detailed service description |
| `face_value` | Decimal | ✓ | Face value of the service (≥ 0) |
| `expense` | Decimal | ✗ | Expense cost (≥ 0) |
| `provider_cut` | Decimal | ✗ | Provider's cut percentage or amount (≥ 0) |
| `revenue` | Decimal | ✗ | Generated revenue (≥ 0) |
| `device_type` | Relation | ✗ | Many-to-one relation to Device Type |
| `subscriptions` | Relation | ✗ | Many-to-many relation to Subscriptions |
| `publishedAt` | DateTime | Auto | Publication timestamp |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

## API Endpoints

### List All Services
```http
GET /api/services
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `populate` | String | Relations to populate (e.g., `device_type,subscriptions`) |
| `filters[name][$contains]` | String | Search by service name |
| `filters[device_type][id][$eq]` | Integer | Filter by device type ID |
| `sort` | String | Sort by field (e.g., `face_value:desc`) |
| `pagination[page]` | Integer | Page number |
| `pagination[pageSize]` | Integer | Items per page |

#### Response Example
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "SMS Service",
        "description": "Send SMS messages",
        "face_value": 10.50,
        "expense": 5.25,
        "provider_cut": 2.10,
        "revenue": 3.15,
        "device_type": {
          "data": {
            "id": 1,
            "attributes": {
              "type": "Mobile"
            }
          }
        },
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z",
        "publishedAt": "2025-01-15T10:00:00.000Z"
      }
    }
  ],
  "meta": { "pagination": { ... } }
}
```

### Get Single Service
```http
GET /api/services/:id
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
      "name": "SMS Service",
      "description": "Send SMS messages",
      "face_value": 10.50,
      "expense": 5.25,
      "provider_cut": 2.10,
      "revenue": 3.15,
      "device_type": { "data": { ... } },
      "subscriptions": { "data": [ ... ] },
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### Create Service
```http
POST /api/services
Content-Type: application/json
```

#### Request Body
```json
{
  "data": {
    "name": "Data Service",
    "description": "High-speed data connectivity",
    "face_value": 29.99,
    "expense": 15.00,
    "provider_cut": 8.99,
    "revenue": 6.00,
    "device_type": 1
  }
}
```

#### Response
Returns the created Service object with generated ID.

### Update Service
```http
PUT /api/services/:id
Content-Type: application/json
```

#### Request Body
```json
{
  "data": {
    "name": "Premium Data Service",
    "face_value": 39.99,
    "revenue": 8.50
  }
}
```

### Delete Service
```http
DELETE /api/services/:id
```

## Frontend Implementation Examples

### React Hook Example
```typescript
// Fetch all services
const fetchServices = async (deviceTypeId?: number) => {
  let url = 'http://localhost:1337/api/services?populate=*';
  if (deviceTypeId) {
    url += `&filters[device_type][id][$eq]=${deviceTypeId}`;
  }
  const response = await fetch(url);
  const json = await response.json();
  return json.data;
};

// Fetch single service
const fetchService = async (id: number) => {
  const response = await fetch(
    `http://localhost:1337/api/services/${id}?populate=*`
  );
  const json = await response.json();
  return json.data;
};

// Create service
const createService = async (data: ServiceData) => {
  const response = await fetch('http://localhost:1337/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  return response.json();
};

// Update service
const updateService = async (id: number, data: Partial<ServiceData>) => {
  const response = await fetch(
    `http://localhost:1337/api/services/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    }
  );
  return response.json();
};

// Calculate profit
const calculateProfit = (service: any) => {
  return service.attributes.revenue - service.attributes.expense;
};
```

### GraphQL Query Example
```graphql
query GetServices($deviceTypeId: Int) {
  services(
    filters: { device_type: { id: { eq: $deviceTypeId } } }
    pagination: { pageSize: 50 }
  ) {
    data {
      id
      attributes {
        name
        description
        face_value
        expense
        provider_cut
        revenue
        device_type {
          data {
            id
            attributes {
              type
            }
          }
        }
        subscriptions {
          data {
            id
            attributes {
              name
              plan_type
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

query GetServiceById($id: ID!) {
  services(filters: { id: { eq: $id } }) {
    data {
      id
      attributes {
        name
        description
        face_value
        expense
        provider_cut
        revenue
        device_type {
          data { id }
        }
      }
    }
  }
}
```

## Filtering Examples

### Get Services for Specific Device Type
```
GET /api/services?filters[device_type][id][$eq]=1
```

### Search Services by Name
```
GET /api/services?filters[name][$contains]=Data
```

### Get High-Value Services
```
GET /api/services?filters[face_value][$gte]=50&sort=face_value:desc
```

## Financial Calculations

### Profit Per Service
```
Profit = Revenue - Expense
```

### Cost Breakdown
```
Face Value = Cost to Customer
Provider Cut = Provider's Commission
Expense = Operational Cost
Revenue = Net Revenue After Expense
```

## Notes
- All decimal fields must be ≥ 0
- Services support draft and publish functionality
- A service must have a device_type to be fully functional
- Services can be linked to multiple subscriptions via many-to-many relation
