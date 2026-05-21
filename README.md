# 🔧 RideVault — Backend Server

<div align="center">

![Express.js](https://img.shields.io/badge/Express.js-5-000000?style=for-the-badge&logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-JWKS-D63AFF?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**RESTful API server for the RideVault car rental platform — handles car management, bookings, authentication verification, and search/filter operations.**

🔗 **[Server Live](https://ridevault-server.vercel.app)** &nbsp; | &nbsp; 🔗 **[Client Repo](https://github.com/mosharof-dev/ridevault-client)** &nbsp; | &nbsp; 🔗 **[Client Live](https://ridevault-client.vercel.app)**

</div>

---

## ✨ Key Features

- 🔐 **JWT Authentication** — JWKS-based token verification using `jose-cjs` for secure private routes
- 🚗 **Full CRUD for Cars** — Create, Read, Update, Delete vehicle listings
- 📅 **Booking System** — Create bookings with automatic `bookingCount` increment on the car document
- 🔍 **Search & Filter** — Server-side search by car model (regex) and category filtering
- 🏆 **Featured Cars** — Dedicated endpoint for homepage featured vehicles
- 🛡️ **Route Protection** — Email-based ownership verification for bookings and car management
- ⚡ **Express 5** — Latest Express.js with modern async error handling

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Express.js 5** | Web framework & REST API |
| **MongoDB 7** | NoSQL database (Atlas) |
| **jose-cjs** | JWT verification via JWKS (Better Auth compatible) |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |
| **Vercel** | Serverless deployment |

---

## 📡 API Endpoints

### 🔓 Public Routes (No Auth Required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check — returns server status |
| `GET` | `/car` | Get all cars (supports query params below) |
| `GET` | `/car/:id` | Get a single car by MongoDB ObjectId |
| `GET` | `/featuredCars` | Get up to 8 featured cars for homepage |

#### Query Parameters for `GET /car`

| Parameter | Type | Example | Description |
|---|---|---|---|
| `search` | string | `?search=Toyota` | Case-insensitive regex search on `carModel` |
| `category` | string | `?category=SUV` | Filter by category (Sedan, SUV, Luxury, Hatchback) |

**Combined Example:** `GET /car?search=Tesla&category=Luxury`

---

### 🔒 Private Routes (JWT Token Required)

> All private routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/car` | Add a new car to the fleet |
| `GET` | `/my-cars` | Get all cars added by the authenticated user |
| `PATCH` | `/my-cars/:id` | Update a car's details by ID |
| `DELETE` | `/my-cars/:id` | Delete a car by ID |
| `POST` | `/booking` | Create a new booking (auto-increments `bookingCount`) |
| `GET` | `/booking?email=` | Get all bookings for a specific user (email verified against token) |

---

## 📁 Project Structure

```
ridevault-server/
├── index.js            # Main server file — all routes, middleware, DB connection
├── .env                # Environment variables (not committed)
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies & scripts
├── vercel.json         # Vercel deployment config (if applicable)
└── README.md
```

---

## 🔐 Authentication Flow

```
┌─────────────┐     JWT Token      ┌─────────────────┐
│   Client     │ ──────────────────▶│   Express API    │
│  (Next.js)   │                    │   (this server)  │
└─────────────┘                    └────────┬─────────┘
                                            │
                                   verifyToken middleware
                                            │
                                   ┌────────▼─────────┐
                                   │  JWKS Endpoint    │
                                   │  /api/auth/jwks   │
                                   │  (Better Auth)    │
                                   └──────────────────┘
```

1. Client sends JWT token in `Authorization: Bearer <token>` header
2. `verifyToken` middleware fetches the JWKS (JSON Web Key Set) from the client's Better Auth endpoint
3. Token is verified using `jwtVerify` from `jose-cjs`
4. If valid, `req.user` is populated with the token payload and the request proceeds
5. If invalid, a `401 Unauthorized` response is returned

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **npm**
- **MongoDB Atlas** account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mosharof-dev/ridevault-server.git
   cd ridevault-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   CLIENT_URL=http://localhost:3000
   ```

4. **Run the server**
   ```bash
   node index.js
   ```
   
   Or with **nodemon** for development:
   ```bash
   npx nodemon index.js
   ```

5. Server will start at [http://localhost:5000](http://localhost:5000) 🎉

---

## 📦 Database Structure

### `cars` Collection

```json
{
  "_id": "ObjectId",
  "carModel": "Mercedes-Benz C-Class",
  "dailyRentalPrice": 140,
  "category": "Sedan",
  "availability": true,
  "vehicleRegistrationNumber": "REG-009",
  "features": ["Ambient Lighting", "Massage Seats", "Panoramic Roof"],
  "description": "A luxury sedan with premium comfort...",
  "bookingCount": 5,
  "image": "https://images.unsplash.com/...",
  "location": "Dhaka",
  "addedByEmail": "user@example.com"
}
```

### `bookings` Collection

```json
{
  "_id": "ObjectId",
  "carId": "car_object_id",
  "carModel": "Mercedes-Benz C-Class",
  "userEmail": "customer@example.com",
  "userName": "John Doe",
  "startDate": "2026-06-01",
  "endDate": "2026-06-05",
  "totalPrice": 700
}
```

---

## 🧑‍💻 Author

**Mosharof Hossain**

- GitHub: [@mosharof-dev](https://github.com/mosharof-dev)
- Email: md.mosharof.dev@gmail.com

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
