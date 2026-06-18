# RentMe API Documentation

Welcome to the **RentMe API Documentation**. RentMe is a peer-to-peer vehicle rental platform. This API provides all endpoints for vehicle listings, bookings, user profile management, reviews, KYC verification, and chat communication.

## Quick Info

*   **API Version:** `1.0.0`
*   **Production Server URL:** `https://rentme-production-6604.up.railway.app/api/v1`
*   **Authentication:** All endpoints except public vehicle browsing and review browsing require a JWT Bearer token. 
    1.  Call `POST /auth/login` with your email and password.
    2.  Include the returned token in the `Authorization` header as `Bearer <token>` for all protected endpoints.
*   **Roles:** `RENTER`, `VEHICLE_OWNER`, `ADMIN`

---

## Table of Contents

1.  [Authentication](#1-authentication)
2.  [Public - Vehicles](#2-public---vehicles)
3.  [Public - Reviews](#3-public---reviews)
4.  [Bookings - Renter](#4-bookings---renter)
5.  [Bookings - Owner](#5-bookings---owner)
6.  [Bookings - Admin](#6-bookings---admin)
7.  [Vehicles - Owner](#7-vehicles---owner)
8.  [Vehicles - Admin](#8-vehicles---admin)
9.  [Reviews](#9-reviews)
10. [Users](#10-users)
11. [Verification - Owner](#11-verification---owner)
12. [Verification - Admin](#12-verification---admin)
13. [Chat](#13-chat)
14. [Shared Schemas](#14-shared-schemas)

---

## 1. Authentication

Endpoints related to user registration, logging in, and logging out.

### 🟦 `POST` `/auth/login`
**Operation ID:** `login`
* **Summary:** Login with email and password
* **Description:** Authenticate a user and receive a JWT token. Call this first before any protected endpoint. Returns userId, email, and role.
* **Security:** None (Public)

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `email` | string (email) | Yes | User's email | `renter@example.com` |
| `password` | string | Yes | User's password | `Password@123` |

#### Responses
*   **`200 OK`**: Login successful.
    *   **Schema (JSON):**
        ```json
        {
          "success": true,
          "message": "Login successful",
          "userId": 30,
          "email": "renter@example.com",
          "role": "RENTER"
        }
        ```
*   **`401 Unauthorized`**: Invalid credentials.

---

### 🟦 `POST` `/auth/register`
**Operation ID:** `register`
* **Summary:** Register a new user account
* **Description:** Register a new user. Role must be `RENTER` or `VEHICLE_OWNER`. `ADMIN` accounts cannot be self-registered.
* **Security:** None (Public)

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `fullName` | string | Yes | Full name of the user | `John Doe` |
| `email` | string (email) | Yes | Email address | `john@example.com` |
| `password` | string | Yes | Min 8 chars with uppercase, lowercase, digit, and special char | `Password@123` |
| `role` | string (enum) | Yes | `RENTER` or `VEHICLE_OWNER` | `RENTER` |

#### Responses
*   **`200 OK`**: Registration successful.
    *   **Schema (JSON):**
        ```json
        {
          "success": true,
          "userId": 31,
          "email": "john@example.com",
          "role": "RENTER"
        }
        ```
*   **`400 Bad Request`**: Validation error or email already in use.

---

### 🟦 `POST` `/auth/logout`
**Operation ID:** `logout`
* **Summary:** Logout and clear authentication
* **Security:** Bearer Token

#### Responses
*   **`200 OK`**: Logout successful.
    *   **Schema (JSON):**
        ```json
        {
          "success": true,
          "message": "Logout successful"
        }
        ```

---

## 2. Public - Vehicles

Endpoints for browsing vehicles. No authentication required.

### 🟩 `GET` `/public/vehicles`
**Operation ID:** `listAvailableVehicles`
* **Summary:** Browse available vehicles
* **Description:** List all available and listed vehicles. No authentication required. Filter by type or maximum daily price.
* **Security:** None (Public)

#### Query Parameters
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `type` | string (enum) | No | Filter by type (`SEDAN`, `SUV`, `VAN`, `TRUCK`, `BIKE`, `OTHER`) | `SEDAN` |
| `maxPrice` | number | No | Filter by maximum daily price | `5000` |

#### Responses
*   **`200 OK`**: List of available vehicles.
    *   **Schema (JSON):** Array of [`VehicleResponse`](#vehicleresponse)

---

### 🟩 `GET` `/public/vehicles/{vehicleId}`
**Operation ID:** `getVehicleById`
* **Summary:** Get details of a specific vehicle
* **Description:** Get full details of a single vehicle by ID. No authentication required.
* **Security:** None (Public)

#### Path Parameters
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `vehicleId` | integer | Yes | ID of the vehicle | `2` |

#### Responses
*   **`200 OK`**: Vehicle details.
    *   **Schema (JSON):** [`VehicleResponse`](#vehicleresponse)
*   **`404 Not Found`**: Vehicle not found.

---

### 🟩 `GET` `/public/vehicles/map`
**Operation ID:** `getVehiclesForMap`
* **Summary:** Get vehicles within a map bounding box
* **Description:** Returns vehicles within the specified latitude and longitude bounding box. Useful for map-based search.
* **Security:** None (Public)

#### Query Parameters
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `minLat` | number | Yes | Minimum GPS latitude | `6.0` |
| `maxLat` | number | Yes | Maximum GPS latitude | `7.0` |
| `minLng` | number | Yes | Minimum GPS longitude | `79.8` |
| `maxLng` | number | Yes | Maximum GPS longitude | `80.0` |

#### Responses
*   **`200 OK`**: Vehicles within the bounding box.
    *   **Schema (JSON):** Array of [`VehicleResponse`](#vehicleresponse)

---

### 🟩 `GET` `/public/vehicles/{vehicleId}/documents`
**Operation ID:** `getVehicleDocumentsPublic`
* **Summary:** Get public documents for a vehicle
* **Description:** Get all documents such as pictures and registration for a vehicle. No authentication required.
* **Security:** None (Public)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `vehicleId` | integer | Yes | ID of the vehicle |

#### Responses
*   **`200 OK`**: List of vehicle documents.
    *   **Schema (JSON):** Array of:
        ```json
        {
          "documentId": 12,
          "documentType": "REGISTRATION",
          "documentName": "Vehicle Registration Document",
          "fileUrl": "https://storage.googleapis.com/...",
          "contentType": "application/pdf",
          "fileSize": 1048576,
          "uploadedAt": "2026-06-18T16:03:47Z"
        }
        ```

---

## 3. Public - Reviews

Endpoints for retrieving reviews. No authentication required.

### 🟩 `GET` `/public/reviews/vehicle/{vehicleId}`
**Operation ID:** `getReviewsByVehicle`
* **Summary:** Get all reviews for a vehicle
* **Description:** Retrieve all reviews posted for a specific vehicle. No authentication required.
* **Security:** None (Public)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `vehicleId` | integer | Yes | ID of the vehicle |

#### Responses
*   **`200 OK`**: List of reviews.
    *   **Schema (JSON):** Array of:
        ```json
        {
          "reviewId": 1,
          "bookingId": 9,
          "vehicleId": 2,
          "rating": 5,
          "comment": "Highly recommended!",
          "reviewerName": "Renter Name",
          "createdAt": "2026-06-18T16:03:47Z"
        }
        ```

---

### 🟩 `GET` `/public/reviews/vehicle/{vehicleId}/summary`
**Operation ID:** `getVehicleReviewSummary`
* **Summary:** Get review summary for a vehicle
* **Description:** Get average rating and total review count for a specific vehicle. No authentication required.
* **Security:** None (Public)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `vehicleId` | integer | Yes | ID of the vehicle |

#### Responses
*   **`200 OK`**: Review summary.
    *   **Schema (JSON):**
        ```json
        {
          "vehicleId": 2,
          "averageRating": 4.5,
          "totalReviews": 10
        }
        ```

---

### 🟩 `GET` `/public/reviews/owner/{ownerId}/average`
**Operation ID:** `getOwnerAverageRating`
* **Summary:** Get average rating for a vehicle owner
* **Description:** Get aggregate average rating for an owner across all their vehicles. No authentication required.
* **Security:** None (Public)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ownerId` | integer | Yes | ID of the vehicle owner |

#### Responses
*   **`200 OK`**: Average rating as a decimal number.
    *   **Schema:** `number` (e.g. `4.7`)

---

## 4. Bookings - Renter

Endpoints for Renters to request, view, and cancel bookings.

### 🟦 `POST` `/bookings`
**Operation ID:** `createBooking`
* **Summary:** Create a booking request
* **Description:** Renter submits a booking request for a vehicle. Vehicle must be available and listed. Total amount is calculated server-side. Booking starts in `PENDING` status until the owner approves.
* **Security:** Bearer Token

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `vehicleId` | integer | Yes | ID of the vehicle to book | `2` |
| `startDate` | string (date) | Yes | Must be today or a future date (`YYYY-MM-DD`) | `2026-07-01` |
| `endDate` | string (date) | Yes | Must be after `startDate` (`YYYY-MM-DD`) | `2026-07-05` |
| `notes` | string | No | Optional notes, max 500 characters | `Please have the car ready by 8 AM` |

#### Responses
*   **`201 Created`**: Booking created successfully in `PENDING` status.
    *   **Schema (JSON):** [`BookingResponse`](#bookingresponse)
*   **`400 Bad Request`**: Validation error or vehicle not available.
    *   **Schema (JSON):** [`ErrorResponse`](#errorresponse)

---

### 🟩 `GET` `/bookings/my`
**Operation ID:** `getMyBookingsAsRenter`
* **Summary:** Get my bookings as renter
* **Description:** Renter retrieves all their own bookings across all vehicles.
* **Security:** Bearer Token

#### Responses
*   **`200 OK`**: List of the renter's bookings.
    *   **Schema (JSON):** Array of [`BookingResponse`](#bookingresponse)

---

### 🟩 `GET` `/bookings/{bookingId}`
**Operation ID:** `getBookingById`
* **Summary:** Get a single booking by ID
* **Description:** Get full details of a booking. Accessible by the renter who made it, the vehicle owner, or an admin.
* **Security:** Bearer Token

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `bookingId` | integer | Yes | ID of the booking |

#### Responses
*   **`200 OK`**: Booking details.
    *   **Schema (JSON):** [`BookingResponse`](#bookingresponse)
*   **`403 Forbidden`**: Access denied.

---

### 🟨 `PATCH` `/bookings/{bookingId}/cancel`
**Operation ID:** `renterCancelBooking`
* **Summary:** Cancel a booking as renter
* **Description:** Renter cancels their own `PENDING` booking.
* **Security:** Bearer Token

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `bookingId` | integer | Yes | ID of the booking |

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `cancellationReason` | string | No | Reason for cancellation | `Change of plans` |

#### Responses
*   **`200 OK`**: Booking cancelled.
    *   **Schema (JSON):** [`BookingResponse`](#bookingresponse)
*   **`400 Bad Request`**: Cannot cancel this booking (e.g. if it is already approved/active).

---

## 5. Bookings - Owner

Endpoints for Owners to review booking requests and manage pickup status.

### 🟩 `GET` `/owner/bookings`
**Operation ID:** `getOwnerBookings`
* **Summary:** Get all bookings for owner's vehicles
* **Description:** Vehicle owner retrieves all bookings made on any of their vehicles.
* **Security:** Bearer Token (Owner)

#### Responses
*   **`200 OK`**: List of bookings on owner's vehicles.
    *   **Schema (JSON):** Array of [`BookingResponse`](#bookingresponse)

---

### 🟩 `GET` `/owner/bookings/pending`
**Operation ID:** `getPendingBookingRequests`
* **Summary:** Get pending booking requests as owner
* **Description:** Vehicle owner retrieves only `PENDING` booking requests awaiting their approval or rejection decision.
* **Security:** Bearer Token (Owner)

#### Responses
*   **`200 OK`**: List of pending booking requests.
    *   **Schema (JSON):** Array of [`BookingResponse`](#bookingresponse)

---

### 🟨 `PATCH` `/owner/bookings/{bookingId}/status`
**Operation ID:** `ownerUpdateBookingStatus`
* **Summary:** Approve or reject a booking as owner
* **Description:** Vehicle owner approves or rejects a `PENDING` booking. `APPROVED` makes the vehicle unavailable for the booked dates. `CANCELLED` rejects the request.
* **Security:** Bearer Token (Owner)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `bookingId` | integer | Yes | ID of the booking |

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `newStatus` | string (enum) | Yes | `APPROVED` or `CANCELLED` | `APPROVED` |
| `cancellationReason` | string | No | Required when `newStatus` is `CANCELLED` | `Vehicle under maintenance` |

#### Responses
*   **`200 OK`**: Booking status updated.
    *   **Schema (JSON):** [`BookingResponse`](#bookingresponse)
*   **`400 Bad Request`**: Invalid status transition or booking not found.

---

### 🟨 `PATCH` `/owner/bookings/{bookingId}/pickup`
**Operation ID:** `markAsPickedUp`
* **Summary:** Mark booking as picked up
* **Description:** Owner marks an `APPROVED` booking as picked up. Records the actual pickup time.
* **Security:** Bearer Token (Owner)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `bookingId` | integer | Yes | ID of the booking |

#### Responses
*   **`200 OK`**: Pickup recorded successfully.
    *   **Schema (JSON):**
        ```json
        {
          "bookingId": 9,
          "actualPickUpTime": "2026-06-18T16:03:47Z"
        }
        ```

---

## 6. Bookings - Admin

Admin-only endpoints for booking oversight and status moderation.

### 🟩 `GET` `/admin/bookings`
**Operation ID:** `getAllBookingsAdmin`
* **Summary:** Get all bookings on the platform (admin only)
* **Description:** Admin retrieves all bookings across the entire platform.
* **Security:** Bearer Token (Admin)

#### Responses
*   **`200 OK`**: All platform bookings.
    *   **Schema (JSON):** Array of [`BookingResponse`](#bookingresponse)

---

### 🟨 `PATCH` `/admin/bookings/{bookingId}/status`
**Operation ID:** `adminUpdateBookingStatus`
* **Summary:** Update any booking status (admin only)
* **Description:** Admin can change the status of any booking on the platform.
* **Security:** Bearer Token (Admin)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `bookingId` | integer | Yes | ID of the booking |

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `newStatus` | string (enum) | Yes | `PENDING`, `APPROVED`, `CANCELLED`, `ONGOING`, `COMPLETED` | `COMPLETED` |
| `cancellationReason` | string | No | Reason if updating to `CANCELLED` | `Administrative cancellation` |

#### Responses
*   **`200 OK`**: Booking status updated successfully.

---

## 7. Vehicles - Owner

Endpoints for owners to create, update, and manage their listings.

### 🟩 `GET` `/owner/vehicles`
**Operation ID:** `getMyVehicles`
* **Summary:** Get my vehicle listings as owner
* **Description:** Vehicle owner retrieves all their vehicle listings including listed and unlisted.
* **Security:** Bearer Token (Owner)

#### Responses
*   **`200 OK`**: Owner's vehicle listings.
    *   **Schema (JSON):** Array of [`VehicleResponse`](#vehicleresponse)

---

### 🟦 `POST` `/owner/vehicles`
**Operation ID:** `createVehicle`
* **Summary:** Create a new vehicle listing
* **Description:** Vehicle owner creates a new vehicle listing. Owner must have `APPROVED` verification status before listing vehicles.
* **Security:** Bearer Token (Owner)

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `make` | string | Yes | Vehicle make or brand | `Toyota` |
| `model` | string | Yes | Vehicle model name | `Camry` |
| `type` | string (enum) | Yes | `SEDAN`, `SUV`, `VAN`, `TRUCK`, `BIKE`, `OTHER` | `SEDAN` |
| `capacity` | integer | Yes | Number of seats from 1 to 50 | `5` |
| `dailyPrice` | number | Yes | Daily rental price | `49.99` |
| `description` | string | No | Vehicle description | `Well maintained sedan, perfect for city trips` |
| `pickupLocation` | string | Yes | Pickup address | `No 45, Galle Road, Colombo 03` |
| `latitude` | number | Yes | GPS latitude between -90 and 90 | `6.8924` |
| `longitude` | number | Yes | GPS longitude between -180 and 180 | `79.8572` |
| `isAvailable` | boolean | No | Availability toggle (defaults to true) | `true` |
| `isListed` | boolean | No | Visibility toggle (defaults to true) | `true` |

#### Responses
*   **`201 Created`**: Vehicle created successfully.
    *   **Schema (JSON):** [`VehicleResponse`](#vehicleresponse)
*   **`400 Bad Request`**: Validation error or owner not KYC-verified.
    *   **Schema (JSON):** [`ErrorResponse`](#errorresponse)

---

### 🟪 `PUT` `/owner/vehicles/{vehicleId}`
**Operation ID:** `updateVehicle`
* **Summary:** Update a vehicle listing
* **Description:** Update vehicle details. Only the owning vehicle owner can update. All fields are replaced.
* **Security:** Bearer Token (Owner)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `vehicleId` | integer | Yes | ID of the vehicle |

#### Request Body (JSON)
*Same structure as the create vehicle request body (All fields required except description, isAvailable, and isListed).*

#### Responses
*   **`200 OK`**: Vehicle updated.
    *   **Schema (JSON):** [`VehicleResponse`](#vehicleresponse)
*   **`400 Bad Request`**: Validation error or vehicle not found.

---

### 🟥 `DELETE` `/owner/vehicles/{vehicleId}`
**Operation ID:** `deleteVehicle`
* **Summary:** Delete a vehicle listing
* **Description:** Hard-delete a vehicle listing. Prefer using `PATCH /owner/vehicles/{vehicleId}/availability` with `isListed: false` to hide a vehicle without permanently removing it.
* **Security:** Bearer Token (Owner)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `vehicleId` | integer | Yes | ID of the vehicle |

#### Responses
*   **`200 OK`**: Vehicle deleted.
    *   **Schema (JSON):**
        ```json
        {
          "success": true,
          "message": "Vehicle deleted successfully"
        }
        ```

---

### 🟨 `PATCH` `/owner/vehicles/{vehicleId}/availability`
**Operation ID:** `updateVehicleAvailability`
* **Summary:** Toggle vehicle availability or listing status
* **Description:** Manually toggle vehicle availability or listing visibility. If a field is passed as null, it will not be changed.
* **Security:** Bearer Token (Owner)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `vehicleId` | integer | Yes | ID of the vehicle |

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `isAvailable` | boolean | No | Toggle booking availability | `false` |
| `isListed` | boolean | No | Toggle public list visibility | `true` |

#### Responses
*   **`200 OK`**: Availability updated successfully.
    *   **Schema (JSON):** [`VehicleResponse`](#vehicleresponse)

---

## 8. Vehicles - Admin

Admin-only endpoints to manage listings.

### 🟩 `GET` `/admin/vehicles`
**Operation ID:** `getAllVehiclesAdmin`
* **Summary:** Get all vehicles on the platform (admin only)
* **Description:** Admin view of all vehicles regardless of listing or availability status.
* **Security:** Bearer Token (Admin)

#### Responses
*   **`200 OK`**: All vehicles on the platform.
    *   **Schema (JSON):** Array of [`VehicleResponse`](#vehicleresponse)

---

### 🟥 `DELETE` `/admin/vehicles/{vehicleId}`
**Operation ID:** `adminDeleteVehicle`
* **Summary:** Delete any vehicle listing (admin only)
* **Description:** Admin hard-deletes any vehicle listing regardless of owner.
* **Security:** Bearer Token (Admin)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `vehicleId` | integer | Yes | ID of the vehicle |

#### Responses
*   **`200 OK`**: Vehicle deleted successfully.

---

### 🟨 `PATCH` `/admin/vehicles/{vehicleId}/availability`
**Operation ID:** `adminUpdateVehicleAvailability`
* **Summary:** Toggle any vehicle availability (admin only)
* **Description:** Admin toggles listing or availability status of any vehicle on the platform.
* **Security:** Bearer Token (Admin)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `vehicleId` | integer | Yes | ID of the vehicle |

#### Request Body (JSON)
| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `isAvailable` | boolean | No | Toggle availability |
| `isListed` | boolean | No | Toggle listing visibility |

#### Responses
*   **`200 OK`**: Availability updated successfully.

---

## 9. Reviews

Endpoints for submitting and moderate reviews.

### 🟦 `POST` `/reviews`
**Operation ID:** `createReview`
* **Summary:** Post a review for a completed booking
* **Description:** Renter posts a review for a completed booking. Limit of one review per booking. Rating must be between 1 and 5.
* **Security:** Bearer Token (Renter)

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `bookingId` | integer | Yes | ID of the completed booking | `9` |
| `rating` | integer | Yes | Rating from 1 to 5 | `5` |
| `comment` | string | No | Optional review comment, max 2000 chars | `Great vehicle, very comfortable!` |

#### Responses
*   **`201 Created`**: Review created successfully.
*   **`400 Bad Request`**: Booking not completed, or review already exists for this booking.

---

### 🟥 `DELETE` `/reviews/{reviewId}`
**Operation ID:** `deleteReview`
* **Summary:** Delete a review
* **Description:** Delete a review. Accessible by the review author or an admin.
* **Security:** Bearer Token

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `reviewId` | integer | Yes | ID of the review to delete |

#### Responses
*   **`200 OK`**: Review deleted.
    *   **Schema (JSON):**
        ```json
        {
          "success": true,
          "message": "Review deleted successfully"
        }
        ```

---

### 🟩 `GET` `/admin/reviews`
**Operation ID:** `getAllReviewsAdmin`
* **Summary:** Get all reviews for moderation (admin only)
* **Description:** Admin retrieves all reviews posted on the platform for moderation purposes.
* **Security:** Bearer Token (Admin)

#### Responses
*   **`200 OK`**: List of all platform reviews.

---

## 10. Users

Endpoints to view and manage user accounts.

### 🟩 `GET` `/users/me`
**Operation ID:** `getCurrentUserProfile`
* **Summary:** Get current authenticated user profile
* **Description:** Get the authenticated user's own profile including role and verification status.
* **Security:** Bearer Token

#### Responses
*   **`200 OK`**: Profile details.
    *   **Schema (JSON):**
        ```json
        {
          "userId": 30,
          "fullName": "John Doe",
          "email": "renter@example.com",
          "role": "RENTER",
          "isActive": true,
          "authProvider": "LOCAL",
          "verificationStatus": "UNVERIFIED",
          "createdAt": "2026-06-18T16:03:47Z"
        }
        ```

---

### 🟩 `GET` `/users/{userId}`
**Operation ID:** `getUserById`
* **Summary:** Get user profile by ID
* **Description:** Get a user's profile by ID. Accessible by the user themselves or an admin.
* **Security:** Bearer Token

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | integer | Yes | ID of the user to retrieve |

#### Responses
*   **`200 OK`**: User profile.
*   **`403 Forbidden`**: Access denied.

---

### 🟪 `PUT` `/users/{userId}`
**Operation ID:** `updateUser`
* **Summary:** Update user profile
* **Description:** Update user information. Accessible by the user themselves or an admin.
* **Security:** Bearer Token

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | integer | Yes | ID of the user |

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `fullName` | string | No | Updated full name | `Johnathan Doe` |
| `contactNumber` | string | No | Updated contact phone number | `+94771234567` |

#### Responses
*   **`200 OK`**: User updated successfully.

---

### 🟥 `DELETE` `/users/{userId}`
**Operation ID:** `deactivateUser`
* **Summary:** Deactivate a user account
* **Description:** Soft-delete/deactivate a user account. The account remains in database but is marked as inactive.
* **Security:** Bearer Token

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | integer | Yes | ID of the user |

#### Responses
*   **`200 OK`**: Account deactivated successfully.

---

### 🟦 `POST` `/users/{userId}/reactivate`
**Operation ID:** `reactivateUser`
* **Summary:** Reactivate a user account (admin only)
* **Description:** Admin reactivates a previously deactivated user account.
* **Security:** Bearer Token (Admin)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | integer | Yes | ID of the user |

#### Responses
*   **`200 OK`**: Account reactivated successfully.

---

### 🟩 `GET` `/users`
**Operation ID:** `getAllUsers`
* **Summary:** Get all users (admin only)
* **Description:** Admin retrieves all registered users on the platform.
* **Security:** Bearer Token (Admin)

#### Responses
*   **`200 OK`**: List of all platform users.

---

## 11. Verification - Owner

Endpoints for vehicle owners to submit identity information for KYC verification.

### 🟦 `POST` `/owner/verification/request`
**Operation ID:** `submitVerificationRequest`
* **Summary:** Submit KYC verification request
* **Description:** Vehicle owner submits identity documents for KYC verification. Accepts multipart form data with files.
* **Security:** Bearer Token (Owner)

#### Request Body (`multipart/form-data`)
| Form Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `files` | file array (binary) | Yes | One or more document files (PDF, JPEG, or PNG) |
| `documentTypes` | string array (enum) | No | Document type matching each file: `OWNER_NIC`, `OWNER_DRIVING_LICENSE`, `OWNER_OTHER` (defaults to `OWNER_OTHER`) |
| `documentNames` | string array | No | Custom label for each file (e.g. `NIC Front`) |

#### Responses
*   **`200 OK`**: Verification request submitted successfully.
*   **`400 Bad Request`**: Already has a pending request.

---

### 🟩 `GET` `/owner/verification/latest`
**Operation ID:** `getMyLatestVerificationRequest`
* **Summary:** Get latest verification request status
* **Description:** Owner checks the current status of their most recent verification request.
* **Security:** Bearer Token (Owner)

#### Responses
*   **`200 OK`**: Latest request status.
    *   **Schema (JSON):**
        ```json
        {
          "requestId": 5,
          "status": "PENDING",
          "rejectionReason": null,
          "submittedAt": "2026-06-18T16:03:47Z",
          "reviewedAt": null
        }
        ```

---

### 🟩 `GET` `/owner/verification/history`
**Operation ID:** `getVerificationHistory`
* **Summary:** Get full verification request history
* **Description:** Owner views their full verification request history including all past requests.
* **Security:** Bearer Token (Owner)

#### Responses
*   **`200 OK`**: List of all verification requests.

---

## 12. Verification - Admin

Admin-only endpoints for KYC request moderation.

### 🟩 `GET` `/admin/verification/pending`
**Operation ID:** `getPendingVerifications`
* **Summary:** Get pending verification queue (admin only)
* **Description:** Admin views all verification requests currently in `PENDING` status.
* **Security:** Bearer Token (Admin)

#### Responses
*   **`200 OK`**: List of pending verification requests.

---

### 🟩 `GET` `/admin/verification/all`
**Operation ID:** `getAllVerifications`
* **Summary:** Get all verification requests (admin only)
* **Description:** Admin views all verification requests across all statuses (`PENDING`, `APPROVED`, `REJECTED`).
* **Security:** Bearer Token (Admin)

#### Responses
*   **`200 OK`**: All verification requests.

---

### 🟦 `POST` `/admin/verification/{id}/review`
**Operation ID:** `reviewVerificationRequest`
* **Summary:** Approve or reject a KYC verification request (admin only)
* **Description:** Admin approves or rejects an owner's KYC verification request. Approving sets owner verification status to `APPROVED` allowing them to list vehicles.
* **Security:** Bearer Token (Admin)

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | integer | Yes | ID of the verification request |

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `approve` | boolean | Yes | `true` to approve, `false` to reject | `true` |
| `rejectionReason` | string | No | Required when `approve` is `false` | `Uploaded documents are blurry` |

#### Responses
*   **`200 OK`**: Verification request reviewed successfully.
*   **`400 Bad Request`**: Request not in `PENDING` status or missing rejection reason.

---

## 13. Chat

Endpoints for Renters and Owners to communicate within the platform.

### 🟦 `POST` `/chat/sessions`
**Operation ID:** `createOrGetChatSession`
* **Summary:** Create or retrieve a chat session
* **Description:** Start a conversation with another user (e.g. renter contacting an owner). If a session already exists between these users for the specified vehicle, the existing session is returned.
* **Security:** Bearer Token

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `targetUserId` | integer | Yes | User ID of the person to chat with | `60` |
| `vehicleId` | integer | No | Optional vehicle context for the chat | `2` |

#### Responses
*   **`201 Created`**: Chat session created or retrieved.
    *   **Schema (JSON):**
        ```json
        {
          "sessionId": 42,
          "sessionType": "VEHICLE_INQUIRY",
          "otherUserId": 60,
          "otherUserFullName": "John Owner",
          "lastMessageAt": "2026-06-18T16:03:47Z",
          "unreadCount": 0
        }
        ```

---

### 🟩 `GET` `/chat/sessions`
**Operation ID:** `getMyChatSessions`
* **Summary:** Get my chat sessions
* **Description:** Get all chat sessions for the current user sorted by most recent message first.
* **Security:** Bearer Token

#### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | integer | No | `0` | Page index |
| `size` | integer | No | `20` | Items per page |

#### Responses
*   **`200 OK`**: Paginated list of chat sessions.

---

### 🟩 `GET` `/chat/sessions/{sessionId}/messages`
**Operation ID:** `getChatMessages`
* **Summary:** Get messages in a chat session
* **Description:** Retrieve paginated messages for a chat session ordered oldest first.
* **Security:** Bearer Token

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | integer | Yes | ID of the chat session |

#### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | integer | No | `0` | Page index |
| `size` | integer | No | `50` | Items per page |

#### Responses
*   **`200 OK`**: Paginated list of messages.

---

### 🟦 `POST` `/chat/sessions/{sessionId}/messages`
**Operation ID:** `sendChatMessage`
* **Summary:** Send a message in a chat session
* **Description:** Send a text message in an existing chat session.
* **Security:** Bearer Token

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | integer | Yes | ID of the chat session |

#### Request Body (JSON)
| Property | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `textContent` | string | Yes | The message content | `Hello, is the vehicle still available?` |

#### Responses
*   **`201 Created`**: Message sent successfully.

---

### 🟨 `PATCH` `/chat/sessions/{sessionId}/read`
**Operation ID:** `markSessionAsRead`
* **Summary:** Mark all messages in a session as read
* **Description:** Mark all unread messages in a session as read for the current user.
* **Security:** Bearer Token

#### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | integer | Yes | ID of the chat session |

#### Responses
*   **`200 OK`**: Messages marked as read.

---

### 🟩 `GET` `/chat/unread-count`
**Operation ID:** `getTotalUnreadCount`
* **Summary:** Get total unread message count
* **Description:** Get the total number of unread messages across all chat sessions for the current user.
* **Security:** Bearer Token

#### Responses
*   **`200 OK`**: Total unread message count.
    *   **Schema (JSON):**
        ```json
        {
          "unreadCount": 3
        }
        ```

---

## 14. Shared Schemas

These components are reused as body or response schemas throughout the API.

### `VehicleResponse`
Represents the detailed response structure for vehicle operations.

```json
{
  "vehicleId": 2,
  "make": "Toyota",
  "model": "Camry",
  "type": "SEDAN",
  "capacity": 5,
  "dailyPrice": 49.99,
  "description": "Well maintained sedan",
  "pictures": [
    "https://storage.googleapis.com/..."
  ],
  "pickupLocation": "No 45, Galle Road, Colombo 03",
  "latitude": 6.8924,
  "longitude": 79.8572,
  "isAvailable": true,
  "isListed": true,
  "averageRating": 4.5,
  "totalReviews": 10,
  "vehicleOwnerId": 2,
  "ownerName": "Vehicle Owner",
  "ownerEmail": "owner@example.com",
  "createdAt": "2026-06-18T16:03:47Z",
  "updatedAt": "2026-06-18T16:03:47Z"
}
```

*   **`type`** options: `SEDAN`, `SUV`, `VAN`, `TRUCK`, `BIKE`, `OTHER`

---

### `BookingResponse`
Represents the detailed response structure for booking operations.

```json
{
  "bookingId": 9,
  "status": "APPROVED",
  "startDate": "2026-06-25",
  "endDate": "2026-06-30",
  "numberOfDays": 5,
  "dailyPrice": 49.99,
  "totalAmount": 249.95,
  "notes": "Please have car ready by 8 AM",
  "cancellationReason": null,
  "vehicleId": 2,
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry",
  "vehicleType": "SEDAN",
  "vehiclePickupLocation": "No 45, Galle Road, Colombo 03",
  "vehiclePictures": [
    "https://storage.googleapis.com/..."
  ],
  "renterId": 30,
  "renterName": "John Doe",
  "renterEmail": "renter@example.com",
  "vehicleOwnerId": 2,
  "ownerName": "Vehicle Owner",
  "ownerEmail": "owner@example.com",
  "actualPickUpTime": null,
  "createdAt": "2026-06-18T16:03:47Z",
  "updatedAt": "2026-06-18T16:03:47Z"
}
```

*   **`status`** options: `PENDING`, `APPROVED`, `CANCELLED`, `ONGOING`, `COMPLETED`

---

### `ErrorResponse`
Standard error format for client-side issues.

```json
{
  "success": false,
  "message": "Error description"
}
```
