# ServiceSmith API Overview

## Base URL
```
http://localhost:1337/api
```

## Authentication
Currently, the API runs without authentication. For production, implement authentication using:
- JWT tokens
- API keys
- OAuth2

## Content Types

This API provides access to five main content types:

1. **[Device Type](./DEVICE-TYPE.md)** - Device categories and their properties
2. **[Service](./SERVICE.md)** - Services available for device types
3. **[Subscription](./SUBSCRIPTION.md)** - Subscription plans and pricing
4. **[Part](./PART.md)** - Parts, repairs, and services inventory
5. **[Page](./PAGE.md)** - Dynamic pages with content blocks

## API Features

### Filtering
All endpoints support advanced filtering:
```
GET /api/device-types?filters[status][$eq]=ACTIVE
```

### Sorting
```
GET /api/services?sort=name:asc
```

### Pagination
```
GET /api/services?pagination[page]=1&pagination[pageSize]=10
```

### Population (Relations)
```
GET /api/services?populate=device_type,subscriptions
```

## Request/Response Format

### Request Headers
```
Content-Type: application/json
```

### Standard Response Format
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "field": "value"
    }
  },
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

## HTTP Methods

| Method | Purpose |
|--------|---------|
| `GET` | Retrieve data |
| `POST` | Create new resource |
| `PUT` | Update existing resource |
| `DELETE` | Delete resource |

## Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request |
| `401` | Unauthorized |
| `404` | Not Found |
| `500` | Server Error |

## Relations Overview

```
Device Type
├── Services (One-to-Many)
└── Subscriptions (Many-to-Many)

Service
├── Device Type (Many-to-One)
└── Subscriptions (Many-to-Many)

Subscription
├── Device Types (Many-to-Many)
├── Services (Many-to-Many)

Page
├── Blocks (Dynamic Zone)
```

## Data Type Reference

| Type | Description | Example |
|------|-------------|---------|
| String | Text | `"Mobile"` |
| Text | Long text | `"This is a description..."` |
| Integer | Whole number | `42` |
| Decimal | Decimal number | `19.99` |
| Boolean | True/False | `true` |
| Enum | Predefined values | `"ACTIVE"` |
| DateTime | Date and time | `"2025-01-15T10:00:00.000Z"` |
| Media | File/Image | `{ "data": { "id": 1, ... } }` |
| Relation | Link to another type | `{ "data": { "id": 1, ... } }` |
| DynamicZone | Multiple components | `[{ "__component": "...", ... }]` |

## Example Workflow

### 1. Create a Device Type
```http
POST /api/device-types
Content-Type: application/json

{
  "data": {
    "type": "Mobile",
    "status": "ACTIVE"
  }
}
```

### 2. Create a Service for the Device Type
```http
POST /api/services
Content-Type: application/json

{
  "data": {
    "name": "SMS Service",
    "face_value": 10.50,
    "device_type": 1
  }
}
```

### 3. Create a Subscription
```http
POST /api/subscriptions
Content-Type: application/json

{
  "data": {
    "name": "Basic Plan",
    "plan_type": "Normal Plan",
    "duration": "monthly_3",
    "cost": 150.00,
    "price_of_subscription": 29.99,
    "device_types": [1],
    "services": [1]
  }
}
```

### 4. Create a Page
```http
POST /api/pages
Content-Type: application/json

{
  "data": {
    "handle": "home",
    "page_title": "Home Page",
    "blocks": [
      {
        "__component": "home.home-navbar",
        "title": "ServiceSmith"
      },
      {
        "__component": "home.home-device-types",
        "title": "Available Devices"
      }
    ]
  }
}
```

### 5. Fetch with Relations
```http
GET /api/pages?filters[handle][$eq]=home&populate=*
```

## Common Patterns

### Get All Active Items
```
GET /api/device-types?filters[status][$eq]=ACTIVE&populate=*
```

### Search with Multiple Filters
```
GET /api/services?filters[name][$contains]=SMS&filters[face_value][$gte]=10
```

### Paginate Large Result Sets
```
GET /api/subscriptions?pagination[page]=2&pagination[pageSize]=10
```

### Get Related Data
```
GET /api/services/1?populate[device_type]=*&populate[subscriptions]=*
```

## Error Handling

### Bad Request Error
```json
{
  "data": null,
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "Invalid body",
    "details": {
      "errors": [
        {
          "path": ["type"],
          "message": "type is required",
          "name": "ValidationError"
        }
      ]
    }
  }
}
```

### Not Found Error
```json
{
  "data": null,
  "error": {
    "status": 404,
    "name": "NotFoundError",
    "message": "Not Found"
  }
}
```

## Rate Limiting
Currently no rate limiting is enforced. Implement rate limiting for production.

## Caching
For optimal performance, implement caching strategies:
- Cache GET requests with 5-minute TTL
- Invalidate cache on PUT/POST/DELETE

## CORS
CORS is enabled. Configure allowed origins in production.

## Best Practices

1. **Always use population** - Include related data to avoid N+1 queries
   ```
   GET /api/services?populate=device_type,subscriptions
   ```

2. **Use pagination** - Limit result sets
   ```
   GET /api/subscriptions?pagination[pageSize]=20
   ```

3. **Filter efficiently** - Apply filters at query level
   ```
   GET /api/services?filters[device_type][id][$eq]=1
   ```

4. **Handle errors** - Implement proper error handling
   ```typescript
   try {
     const response = await fetch(url);
     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
     return await response.json();
   } catch (error) {
     console.error('API Error:', error);
   }
   ```

5. **Validate input** - Validate data before sending
   ```typescript
   if (!data.name || data.face_value < 0) {
     throw new Error('Invalid input');
   }
   ```

## Documentation Structure

- [Device Type API](./DEVICE-TYPE.md) - Device management
- [Service API](./SERVICE.md) - Service management
- [Subscription API](./SUBSCRIPTION.md) - Subscription management
- [Page API](./PAGE.md) - Dynamic page management

## Support

For issues or questions:
1. Check the specific API documentation
2. Review error messages in response
3. Verify request format and parameters
4. Check database connectivity in Strapi admin

## Version
API Version: 1.0.0
Last Updated: 2025-01-15
