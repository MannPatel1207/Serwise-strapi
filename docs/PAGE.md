# Page API Documentation

## Overview
The Page API manages dynamic pages that can be composed of various content blocks. Pages use a dynamic zone system to allow flexible composition of content from pre-defined components.

## Schema

### Page Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Integer | Auto | Unique identifier |
| `handle` | String | ✗ | Unique page identifier/slug for routing |
| `page_title` | String | ✗ | Display title of the page |
| `blocks` | DynamicZone | ✗ | Dynamic content blocks |
| `publishedAt` | DateTime | Auto | Publication timestamp |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

## Available Components

### Home Components
The following components can be used in the `blocks` dynamic zone:

1. **home-wallet** - Wallet/balance display component
2. **home-navbar** - Navigation bar component
3. **home-device-types** - Device types showcase component
4. **home-notification-banner** - Notification/announcement banner component

## API Endpoints

### List All Pages
```http
GET /content-manager/collection-types/api::page.page
```

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `populate` | String | Relations to populate (e.g., `blocks`) |
| `filters[handle][$eq]` | String | Filter by page handle |
| `sort` | String | Sort by field (e.g., `createdAt:desc`) |
| `pagination[page]` | Integer | Page number |
| `pagination[pageSize]` | Integer | Items per page |

#### Response Example
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "handle": "home",
        "page_title": "Home Page",
        "blocks": [
          {
            "__component": "home.home-navbar",
            "id": 1,
            "title": "Main Navigation",
            "items": []
          },
          {
            "__component": "home.home-wallet",
            "id": 2,
            "balance": 1000.00,
            "currency": "USD"
          },
          {
            "__component": "home.home-device-types",
            "id": 3,
            "title": "Available Devices"
          },
          {
            "__component": "home.home-notification-banner",
            "id": 4,
            "message": "Welcome to ServiceSmith",
            "type": "info"
          }
        ],
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

### Get Single Page
```http
GET /content-manager/collection-types/api::page.page/:documentId
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
      "handle": "home",
      "page_title": "Home Page",
      "blocks": [ ... ],
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "publishedAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### Create Page
```http
POST /content-manager/collection-types/api::page.page
Content-Type: application/json
```

#### Request Body
```json
{
  "data": {
    "handle": "home",
    "page_title": "Home Page",
    "blocks": [
      {
        "__component": "home.home-navbar",
        "title": "Main Navigation"
      },
      {
        "__component": "home.home-wallet",
        "balance": 1000.00
      },
      {
        "__component": "home.home-device-types",
        "title": "Available Devices"
      },
      {
        "__component": "home.home-notification-banner",
        "message": "Welcome to ServiceSmith",
        "type": "info"
      }
    ]
  }
}
```

#### Response
Returns the created Page object with generated ID.

### Update Page
```http
PUT /content-manager/collection-types/api::page.page/:documentId
Content-Type: application/json
```

#### Request Body
```json
{
  "data": {
    "page_title": "Home - Updated",
    "blocks": [
      {
        "__component": "home.home-navbar",
        "title": "Updated Navigation"
      }
    ]
  }
}
```

### Delete Page
```http
DELETE /content-manager/collection-types/api::page.page/:documentId
```

## Component Specifications

### home-navbar
Navigation bar component for page header.

```json
{
  "__component": "home.home-navbar",
  "title": "string",
  "logo": "media (optional)",
  "items": "array of navigation items (optional)"
}
```

### home-wallet
Wallet/balance display component.

```json
{
  "__component": "home.home-wallet",
  "balance": "decimal (optional)",
  "currency": "string (default: USD, optional)",
  "showHistory": "boolean (optional)"
}
```

### home-device-types
Device types showcase component.

```json
{
  "__component": "home.home-device-types",
  "title": "string",
  "showFilter": "boolean (optional)",
  "columns": "integer (optional, default: 3)"
}
```

### home-notification-banner
Notification/announcement banner component.

```json
{
  "__component": "home.home-notification-banner",
  "message": "string (required)",
  "type": "success|info|warning|error (default: info)",
  "dismissible": "boolean (optional, default: true)",
  "icon": "string (optional)"
}
```

## Frontend Implementation Examples

### React Hook Example
```typescript
// Type definitions
interface NavbarBlock {
  __component: 'home.home-navbar';
  title: string;
  logo?: any;
  items?: any[];
}

interface WalletBlock {
  __component: 'home.home-wallet';
  balance?: number;
  currency?: string;
  showHistory?: boolean;
}

interface DeviceTypesBlock {
  __component: 'home.home-device-types';
  title: string;
  showFilter?: boolean;
  columns?: number;
}

interface NotificationBannerBlock {
  __component: 'home.home-notification-banner';
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  dismissible?: boolean;
  icon?: string;
}

type PageBlock = 
  | NavbarBlock 
  | WalletBlock 
  | DeviceTypesBlock 
  | NotificationBannerBlock;

interface PageData {
  id: number;
  attributes: {
    handle: string;
    page_title: string;
    blocks: PageBlock[];
    publishedAt: string;
  };
}

// Fetch page by handle
const fetchPageByHandle = async (handle: string): Promise<PageData> => {
  const response = await fetch(
    `http://localhost:1337/content-manager/collection-types/api::page.page?filters[handle][$eq]=${handle}&populate=*`
  );
  const json = await response.json();
  return json.data[0];
};

// Fetch page by ID
const fetchPage = async (id: number): Promise<PageData> => {
  const response = await fetch(
    `http://localhost:1337/content-manager/collection-types/api::page.page/${documentId}?populate=*`
  );
  const json = await response.json();
  return json.data;
};

// Create page
const createPage = async (data: {
  handle: string;
  page_title: string;
  blocks: PageBlock[];
}) => {
  const response = await fetch('http://localhost:1337/content-manager/collection-types/api::page.page', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  return response.json();
};

// Update page
const updatePage = async (
  id: number,
  data: Partial<{
    handle: string;
    page_title: string;
    blocks: PageBlock[];
  }>
) => {
  const response = await fetch(`http://localhost:1337/content-manager/collection-types/api::page.page/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  return response.json();
};

// React Component Example
import React, { useEffect, useState } from 'react';

const PageRenderer: React.FC<{ handle: string }> = ({ handle }) => {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageByHandle(handle)
      .then(setPage)
      .finally(() => setLoading(false));
  }, [handle]);

  if (loading) return <div>Loading...</div>;
  if (!page) return <div>Page not found</div>;

  return (
    <div className="page">
      <h1>{page.attributes.page_title}</h1>
      {page.attributes.blocks.map((block, index) => {
        switch (block.__component) {
          case 'home.home-navbar':
            return <NavBar key={index} {...block} />;
          case 'home.home-wallet':
            return <Wallet key={index} {...block} />;
          case 'home.home-device-types':
            return <DeviceTypesSection key={index} {...block} />;
          case 'home.home-notification-banner':
            return <NotificationBanner key={index} {...block} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

const NavBar: React.FC<NavbarBlock> = ({ title, logo }) => (
  <nav className="navbar">
    {logo && <img src={logo.url} alt="Logo" />}
    <h2>{title}</h2>
  </nav>
);

const Wallet: React.FC<WalletBlock> = ({ balance = 0, currency = 'USD' }) => (
  <div className="wallet">
    <p>Balance: {currency} {balance.toFixed(2)}</p>
  </div>
);

const DeviceTypesSection: React.FC<DeviceTypesBlock> = ({ 
  title, 
  showFilter = false,
  columns = 3 
}) => (
  <section className="device-types">
    <h2>{title}</h2>
    {showFilter && <input type="text" placeholder="Filter devices..." />}
    {/* Render device types grid */}
  </section>
);

const NotificationBanner: React.FC<NotificationBannerBlock> = ({
  message,
  type = 'info',
  dismissible = true
}) => (
  <div className={`banner banner-${type}`}>
    {message}
    {dismissible && <button>×</button>}
  </div>
);
```

### GraphQL Query Example
```graphql
query GetPageByHandle($handle: String!) {
  pages(filters: { handle: { eq: $handle } }) {
    data {
      id
      attributes {
        handle
        page_title
        blocks {
          __typename
          ... on ComponentHomeHomeNavbar {
            id
            title
          }
          ... on ComponentHomeHomeWallet {
            id
            balance
            currency
          }
          ... on ComponentHomeHomeDeviceTypes {
            id
            title
            showFilter
            columns
          }
          ... on ComponentHomeHomeNotificationBanner {
            id
            message
            type
            dismissible
          }
        }
        publishedAt
      }
    }
  }
}

query GetPageById($id: ID!) {
  pages(filters: { id: { eq: $id } }) {
    data {
      id
      attributes {
        handle
        page_title
        blocks {
          __typename
        }
        publishedAt
      }
    }
  }
}
```

## Common Use Cases

### Home Page
```json
{
  "data": {
    "handle": "home",
    "page_title": "Home",
    "blocks": [
      { "__component": "home.home-navbar", "title": "ServiceSmith" },
      { "__component": "home.home-notification-banner", "message": "Welcome!" },
      { "__component": "home.home-wallet", "balance": 1000 },
      { "__component": "home.home-device-types", "title": "Devices" }
    ]
  }
}
```

## Notes
- Pages support draft and publish functionality
- Handle field should be unique per page for easy routing
- Dynamic zone allows flexible content composition
- Component order in blocks array is preserved on frontend
- All components are optional for maximum flexibility
