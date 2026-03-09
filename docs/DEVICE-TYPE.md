# Device Type API Documentation

## Overview
The Device Type API manages different types of devices available in the system. Each device type can have associated services and subscriptions.

## Schema

### Device Type Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Integer | Auto | Unique identifier |
| `type` | String | ✓ | Device type name (unique) |
| `image` | Media | ✗ | Device type image (images only) |
| `icon` | Media | ✗ | Device type icon (images only) |
| `thumbnail` | Media | ✗ | Device type thumbnail (images only) |
| `status` | Enum | ✓ | Status: `ACTIVE`, `DRAFT`, `EXPERIMENTAL` (default: `DRAFT`) |
| `action_link` | String | ✗ | Action/redirect link for this device type |
| `services` | Relation | ✗ | One-to-many relation to Services |
| `subscriptions` | Relation | ✗ | Many-to-many relation to Subscriptions |
| `publishedAt` | DateTime | Auto | Publication timestamp |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

## API Endpoints

### List All Device Types
```http
GET /api/device-types
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `populate` | String | Relations to populate (e.g., `services,subscriptions`) |
| `filters[status][$eq]` | String | Filter by status |
| `sort` | String | Sort by field (e.g., `type:asc`) |
| `pagination[page]` | Integer | Page number |
| `pagination[pageSize]` | Integer | Items per page |

#### Response Example
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "type": "Mobile",
        "status": "ACTIVE",
        "action_link": "/mobile-details",
        "image": {
          "data": {
            "id": 1,
            "attributes": {
              "url": "/uploads/mobile.jpg",
              "name": "mobile.jpg"
            }
          }
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

### Get Single Device Type
```http
GET /api/device-types/:id
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
      "type": "Mobile",
      "status": "ACTIVE",
      "action_link": "/mobile-details",
      "image": { "data": { ... } },
      "services": {
        "data": [
          {
            "id": 1,
            "attributes": { ... }
          }
        ]
      },
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### Create Device Type
```http
POST /api/device-types
Content-Type: application/json
```

#### Request Body
```json
{
  "data": {
    "type": "Tablet",
    "status": "DRAFT",
    "action_link": "/tablet-details"
  }
}
```

#### Response
Returns the created Device Type object with generated ID.

### Update Device Type
```http
PUT /api/device-types/:id
Content-Type: application/json
```

#### Request Body
```json
{
  "data": {
    "type": "Tablet Pro",
    "status": "ACTIVE",
    "action_link": "/tablet-pro-details"
  }
}
```

### Delete Device Type
```http
DELETE /api/device-types/:id
```

## Frontend Implementation Examples

### React Hook Example
```typescript
// Fetch device types
const fetchDeviceTypes = async () => {
  const response = await fetch(
    'http://localhost:1337/api/device-types?populate=*'
  );
  const json = await response.json();
  return json.data;
};

// Create device type
const createDeviceType = async (data) => {
  const response = await fetch('http://localhost:1337/api/device-types', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  return response.json();
};

// Update device type
const updateDeviceType = async (id, data) => {
  const response = await fetch(`http://localhost:1337/api/device-types/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  return response.json();
};
```

### GraphQL Query Example
```graphql
query GetDeviceTypes {
  deviceTypes {
    data {
      id
      attributes {
        type
        status
        action_link
        image {
          data {
            id
            attributes {
              url
              name
            }
          }
        }
        services {
          data {
            id
            attributes {
              name
              description
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
  }
}

query GetDeviceTypeById($id: ID!) {
  deviceTypes(filters: { id: { eq: $id } }) {
    data {
      id
      attributes {
        type
        status
        action_link
        image { data { id } }
        services { data { id } }
        subscriptions { data { id } }
      }
    }
  }
}
```

## Filtering Examples

### Get ACTIVE Device Types
```
GET /api/device-types?filters[status][$eq]=ACTIVE
```

### Get with Specific Populate
```
GET /api/device-types?populate[services][populate][0]=device_type&populate[subscriptions]=*
```

## Notes
- All device types support draft and publish functionality
- Image field accepts only image media types
- The `type` field is unique across all device types
- Deleting a device type will cascade to related services and subscriptions
