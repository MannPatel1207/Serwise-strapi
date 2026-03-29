# Part API Documentation

## Overview
The Part API manages all parts, repairs, and services available in the system. Parts are organized by type (Parts, Repair, Service) and category for easy filtering and management.

## Schema

### Part Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Integer | Auto | Unique identifier |
| `name` | String | ✓ | Part name (unique) |
| `category` | Enum | ✓ | Category: `Basic Filters`, `Additional Filters`, `Electrical Components`, `Other Items`, `Pipe & Fittings`, `Core` |
| `type` | Enum | ✓ | Type: `Parts`, `Repair`, `Service` |
| `price` | Decimal | ✓ | Price of the part (≥ 0, default: 0) |
| `quantity` | Integer | ✗ | Available quantity (default: 0) |
| `description` | Text | ✗ | Part description |
| `status` | Enum | ✓ | Status: `ACTIVE`, `DRAFT`, `DISCONTINUED` (default: `DRAFT`) |
| `publishedAt` | DateTime | Auto | Publication timestamp |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

## Data Structure

### Parts Type

#### Basic Filters
- Spun Filter - $10
- Pre Filter Bowl - $10
- Sediment Filter - $10
- Pre Carbon Filter - $10
- Post Carbon Filter - $10
- Inline Filter Set - $10
- UF Big Filter - $10
- UF Small Filter - $10
- RO Membrane - $10
- Alkaline Filter - $10

#### Additional Filters
- Copper Filter - $10
- Magnesium Filter - $10
- Zinc Filter - $10
- Calcium Filter - $10

#### Electrical Components
- Booster Pump - $10
- UV Lamp - $10
- TDS Controller - $10
- Power Supply Unit (SMPS) - $10
- Float Switch - $10
- Solenoid Valve (SV) - $10

#### Other Items
- Pump Head - $10
- Electrical Wire Changes - $10

### Repair Type

#### Pipe & Fittings
- Booster Pump Repair - $10
- Pump Head Repair - $10
- Electrical Wire Repair - $10

### Service Type

#### Core
- Installation - $10
- Uninstallation - $10
- Basic Check-up - $10

## API Endpoints

### List All Parts
```http
GET /content-manager/collection-types/api::part.part
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `populate` | String | Relations to populate (currently none) |
| `filters[type][$eq]` | String | Filter by type: `Parts`, `Repair`, `Service` |
| `filters[category][$eq]` | String | Filter by category |
| `filters[status][$eq]` | String | Filter by status: `ACTIVE`, `DRAFT`, `DISCONTINUED` |
| `filters[price][$lte]` | Decimal | Filter by maximum price |
| `filters[price][$gte]` | Decimal | Filter by minimum price |
| `sort` | String | Sort by field (e.g., `name:asc`, `price:desc`) |
| `pagination[page]` | Integer | Page number (default: 1) |
| `pagination[pageSize]` | Integer | Items per page (default: 25) |

#### Response Example
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Spun Filter",
        "category": "Basic Filters",
        "type": "Parts",
        "price": "10.00",
        "quantity": 0,
        "description": null,
        "status": "ACTIVE",
        "createdAt": "2024-02-13T10:00:00.000Z",
        "updatedAt": "2024-02-13T10:00:00.000Z",
        "publishedAt": "2024-02-13T10:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 2,
      "total": 28
    }
  }
}
```

### Get Single Part
```http
GET /content-manager/collection-types/api::part.part/:documentId
```

#### Response Example
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "Spun Filter",
      "category": "Basic Filters",
      "type": "Parts",
      "price": "10.00",
      "quantity": 0,
      "description": null,
      "status": "ACTIVE",
      "createdAt": "2024-02-13T10:00:00.000Z",
      "updatedAt": "2024-02-13T10:00:00.000Z",
      "publishedAt": "2024-02-13T10:00:00.000Z"
    }
  }
}
```

### Create Part
```http
POST /content-manager/collection-types/api::part.part
Content-Type: application/json
Authorization: Bearer YOUR_API_TOKEN
```

#### Request Body
```json
{
  "data": {
    "name": "New Part",
    "category": "Basic Filters",
    "type": "Parts",
    "price": 25.00,
    "quantity": 10,
    "description": "A new water filter part",
    "status": "ACTIVE"
  }
}
```

#### Response
```json
{
  "data": {
    "id": 29,
    "attributes": {
      "name": "New Part",
      "category": "Basic Filters",
      "type": "Parts",
      "price": "25.00",
      "quantity": 10,
      "description": "A new water filter part",
      "status": "ACTIVE",
      "createdAt": "2024-02-13T10:30:00.000Z",
      "updatedAt": "2024-02-13T10:30:00.000Z",
      "publishedAt": null
    }
  }
}
```

### Update Part
```http
PUT /content-manager/collection-types/api::part.part/:documentId
Content-Type: application/json
Authorization: Bearer YOUR_API_TOKEN
```

#### Request Body
```json
{
  "data": {
    "price": 30.00,
    "quantity": 15,
    "status": "ACTIVE"
  }
}
```

### Delete Part
```http
DELETE /content-manager/collection-types/api::part.part/:documentId
Authorization: Bearer YOUR_API_TOKEN
```

## Common Queries

### Get All Active Parts
```http
GET /content-manager/collection-types/api::part.part?filters[status][$eq]=ACTIVE&pagination[pageSize]=100
```

### Get All Parts by Type
```http
GET /content-manager/collection-types/api::part.part?filters[type][$eq]=Parts&sort=category:asc
```

### Get All Filters (Basic and Additional)
```http
GET /content-manager/collection-types/api::part.part?filters[$or][0][category][$eq]=Basic Filters&filters[$or][1][category][$eq]=Additional Filters
```

### Get All Parts by Price Range
```http
GET /content-manager/collection-types/api::part.part?filters[price][$gte]=10&filters[price][$lte]=50&sort=price:asc
```

### Get Electrical Components Only
```http
GET /content-manager/collection-types/api::part.part?filters[category][$eq]=Electrical Components&filters[status][$eq]=ACTIVE
```

### Get All Repair Services
```http
GET /content-manager/collection-types/api::part.part?filters[type][$eq]=Repair
```

### Get All Core Services
```http
GET /content-manager/collection-types/api::part.part?filters[type][$eq]=Service&filters[category][$eq]=Core
```

## Seeding Data

To seed the database with predefined parts, use the seed script:

```bash
npm run seed:parts
```

This script will populate the database with 28 items organized by type and category as listed above.

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## Notes

- All `name` fields must be unique globally
- `price` must be a non-negative decimal value
- Status field controls visibility of parts in the API (set to `ACTIVE` to publish)
- Parts are draft by default - publish them to make available
- Categories and types are fixed enums - new values require schema updates
