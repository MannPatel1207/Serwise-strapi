# 🚀 ServiceSmith Strapi Application

A comprehensive Strapi-based backend for managing water purification device types, services, subscriptions, parts inventory, and dynamic pages.

## 📋 Project Overview

ServiceSmith is a service management platform with the following data models:

- **Device Types** - Different types of water purification devices (RO, UV, etc.)
- **Services** - Services available for specific device types with financial tracking
- **Subscriptions** - Subscription plans linked to device types
- **Parts** - Inventory of replacement parts, repairs, and services (NEW)
- **Pages** - Dynamic content pages with customizable components

## 📚 Documentation

Detailed API documentation is available in the `/docs` folder:

- [API Overview](./docs/API_OVERVIEW.md) - Complete API reference
- [Device Type API](./docs/DEVICE-TYPE.md) - Device types management
- [Service API](./docs/SERVICE.md) - Services and pricing
- [Subscription API](./docs/SUBSCRIPTION.md) - Subscription plans
- [Part API](./docs/PART.md) - Parts, repairs, and services inventory
- [Page API](./docs/PAGE.md) - Dynamic pages management

## 🛠️ Available Scripts

### Development
```bash
npm run dev          # Start development server with auto-reload
npm run develop      # Alternative: start development server
```

### Production
```bash
npm run build        # Build admin panel
npm run start        # Start production server
```

### Database
```bash
npm run seed         # Seed initial device types, services, and subscriptions
npm run seed:parts   # Seed parts, repairs, and services inventory
```

### Other
```bash
npm run console      # Access Strapi console
npm run deploy       # Deploy to Strapi Cloud
npm run upgrade      # Upgrade Strapi to latest version
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0 and <= 24.x.x
- npm >= 6.0.0

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Access the admin panel at:
```
http://localhost:1337/admin
```

### Seeding Data

To populate the database with initial data:

```bash
# Seed device types, services, and subscriptions
npm run seed

# Seed parts and repairs inventory
npm run seed:parts
```

## 📦 Collection: Parts

The Parts collection manages all replacement parts, repairs, and services. It's organized by:

**Types:**
- Parts - Replacement components
- Repair - Repair services
- Service - Installation and maintenance services

**Categories:**
- Basic Filters
- Additional Filters
- Electrical Components
- Other Items
- Pipe & Fittings
- Core (for services)

### Quick Example

Access parts through the API:

```bash
# Get all active parts
curl http://localhost:1337/api/parts?filters[status][$eq]=ACTIVE

# Get all electrical components
curl http://localhost:1337/api/parts?filters[category][$eq]="Electrical Components"

# Get all repair services
curl http://localhost:1337/api/parts?filters[type][$eq]=Repair
```

See [Part API Documentation](./docs/PART.md) for complete details.

## 🌐 API Base URL

```
http://localhost:1337/api
```

## 🔐 Authentication

Currently runs without authentication. For production, configure:
- JWT tokens
- API keys
- OAuth2

## 📊 Database

Uses SQLite for development (better-sqlite3 v12.4.1)

Database files are stored in the database directory. Clear and reseed as needed for development.

## 🏗️ Project Structure

```
serwise-strapi-app/
├── config/              # Strapi configuration files
├── database/            # Database migrations
├── docs/                # API documentation
├── public/              # Public assets
├── scripts/             # Seed scripts
├── src/
│   ├── admin/          # Custom admin panel
│   ├── api/            # API routes and models
│   │   ├── device-type/
│   │   ├── service/
│   │   ├── subscription/
│   │   └── part/       # NEW: Parts collection
│   ├── components/     # Reusable content components
│   ├── extensions/     # Plugin extensions
│   └── index.ts        # Entry point
└── types/              # TypeScript type definitions
```

## 🔧 Related Technologies

- **Strapi** v5.33.4 - Headless CMS
- **TypeScript** - Type-safe development
- **SQLite** - Development database
- **Node.js** - Runtime environment

## 📖 Learn More

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi Community](https://community.strapi.io)
- [ServiceSmith API Reference](./docs/API_OVERVIEW.md)

## ✨ Features

- ✅ Multiple content types with rich fields
- ✅ Relation management (one-to-many, many-to-many)
- ✅ Draft and publish workflow
- ✅ Advanced filtering and search
- ✅ API documentation
- ✅ Database seeding scripts
- ✅ TypeScript support

## 🤝 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review the Strapi documentation
3. Check the project logs in the terminal

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
