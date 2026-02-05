# Design Decisions

This document outlines the key design decisions made during the development of the Uniblox E-commerce system.

---

## Decision 1: In-Memory Data Store with Singleton Pattern

**Context:** The assignment specified that in-memory storage is acceptable (no database required). We needed to decide how to structure data storage for products, carts, orders, and discount codes.

**Options Considered:**

- **Option A:** Use simple JavaScript objects and arrays scattered throughout the codebase
- **Option B:** Create a centralized DataStore class with a singleton pattern
- **Option C:** Use a third-party in-memory database like Redis (local instance)

**Choice:** Option B - Centralized DataStore class with singleton pattern

**Why:**

- **Maintainability**: Having all data operations centralized makes it easier to track and modify data structures
- **Separation of Concerns**: Services focus on business logic while DataStore handles data persistence
- **Easy Migration Path**: If we later need to add a real database, we only need to modify the DataStore class
- **Testing**: Easier to reset and control state during tests
- **Trade-offs**: Singleton pattern can make testing slightly harder, but we mitigated this by exposing clear() methods
- **Future Consideration**: The DataStore can be easily swapped with a database adapter (MongoDB, PostgreSQL) without changing service layer code

---

## Decision 2: Service Layer Architecture

**Context:** We needed to organize business logic for cart management, order processing, and discount validation in a maintainable way.

**Options Considered:**

- **Option A:** Put all logic directly in Express route handlers
- **Option B:** Create separate service classes for each domain (CartService, OrderService, DiscountService)
- **Option C:** Use a single "BusinessLogic" class with all methods

**Choice:** Option B - Separate service classes

**Why:**

- **Single Responsibility Principle**: Each service focuses on one domain
- **Testability**: Services can be unit tested independently without HTTP concerns
- **Reusability**: Services can be used by different interfaces (REST API, GraphQL, CLI)
- **Clarity**: Clear separation between HTTP layer (routes) and business logic (services)
- **Trade-offs**: More files to manage, but significantly better organization
- **Future Consideration**: Services can evolve into microservices if needed

---

## Decision 3: Automatic Discount Code Generation on nth Order

**Context:** The assignment states "Every nth order gets a coupon code for x% discount." We needed to decide when and how to generate these codes.

**Options Considered:**

- **Option A:** Generate discount codes in advance and store them in a pool
- **Option B:** Generate codes on-demand when checkout occurs and order count hits nth
- **Option C:** Require admin to manually generate codes via API

**Choice:** Option B - Automatic generation during checkout

**Why:**

- **User Experience**: Customers immediately receive their discount code after placing the qualifying order
- **Simplicity**: No need to pre-generate or manage a pool of codes
- **Fairness**: Guaranteed that every nth order gets a code
- **Automation**: Reduces manual intervention and potential for errors
- **Trade-offs**: Slight coupling between order and discount services, but worth it for UX
- **Implementation**: After successful order placement, we check if `orderCounter % nthOrder === 0`
- **Admin Override**: We also provide an admin API to manually generate codes if needed

---

## Decision 4: Discount Code Validation Strategy

**Context:** Discount codes need to be validated before being applied. We needed to handle various edge cases like invalid codes, already-used codes, and expired codes.

**Options Considered:**

- **Option A:** Simple existence check - if code exists, allow it
- **Option B:** Comprehensive validation including existence, usage status, and expiration
- **Option C:** Blockchain-based verification (overly complex)

**Choice:** Option B - Comprehensive validation

**Why:**

- **Security**: Prevents reuse of discount codes
- **Business Logic**: Ensures discount codes follow business rules
- **User Feedback**: Provides clear error messages for different failure scenarios
- **Audit Trail**: Tracks when codes are used (usedAt timestamp)
- **Trade-offs**: More complex validation logic, but necessary for production-ready system
- **Implementation**: `validateDiscountCode()` returns structured object with `{isValid, message, discountInfo}`
- **Future Consideration**: Could add expiration dates, per-user limits, or minimum purchase amounts

---

## Decision 5: RESTful API Design with Explicit Action Endpoints

**Context:** We needed to design API endpoints that are intuitive and follow REST conventions while supporting all required operations.

**Options Considered:**

- **Option A:** Pure REST (only GET, POST, PUT, DELETE on resources)
- **Option B:** Action-oriented endpoints like `/api/cart/add`, `/api/checkout`
- **Option C:** GraphQL instead of REST

**Choice:** Hybrid approach - RESTful with action endpoints where appropriate

**Why:**

- **Clarity**: `/api/cart/add` is more explicit than `POST /api/cart`
- **Flexibility**: Some operations don't map cleanly to CRUD (checkout is not just creating an order)
- **Developer Experience**: Easier for frontend developers to understand intent
- **Consistency**: Still follow REST conventions where they make sense (GET /api/products/:id)
- **Trade-offs**: Not "pure" REST, but prioritizes usability over dogma
- **Examples**:
  - `POST /api/cart/add` instead of `POST /api/cart/items`
  - `POST /api/checkout` instead of `POST /api/orders`
  - Admin endpoints under `/api/admin/*` for clear separation

---

## Decision 6: Frontend State Management with React Hooks

**Context:** The frontend needs to manage products, cart state, user session, and UI state. We needed to decide on a state management approach.

**Options Considered:**

- **Option A:** Redux or MobX for global state management
- **Option B:** React Context API
- **Option C:** React hooks (useState, useEffect) only

**Choice:** Option C - React hooks only

**Why:**

- **Simplicity**: No additional dependencies or boilerplate
- **Scope**: Application is small enough that hooks are sufficient
- **Learning Curve**: Easier for developers unfamiliar with Redux
- **Performance**: Adequate for this use case; no complex state updates
- **Trade-offs**: May need refactoring if app grows significantly
- **Implementation**: User ID generated on mount and persists in component state
- **Future Consideration**: Can migrate to Context API or Redux if needed

---

## Decision 7: Error Handling Strategy

**Context:** Both frontend and backend need consistent error handling to provide good user experience and debugging information.

**Options Considered:**

- **Option A:** Let errors bubble up naturally
- **Option B:** Try-catch blocks with generic error messages
- **Option C:** Structured error handling with specific error messages and types

**Choice:** Option C - Structured error handling

**Why:**

- **User Experience**: Users get clear, actionable error messages
- **Debugging**: Developers can quickly identify issues
- **Consistency**: All endpoints return `{success: boolean, message: string, ...data}`
- **Validation**: Early validation prevents cascading errors
- **Trade-offs**: More verbose code, but significantly better UX
- **Examples**:
  - "Product not found" vs "An error occurred"
  - "Insufficient stock. Only 5 items available" vs "Cannot add to cart"
  - HTTP status codes: 400 for validation, 404 for not found, 500 for server errors

---

## Decision 8: Stock Management During Checkout

**Context:** We needed to decide when to reserve/update product stock to prevent overselling.

**Options Considered:**

- **Option A:** Reduce stock when item is added to cart
- **Option B:** Reduce stock only when checkout completes
- **Option C:** Implement a reservation system with timeout

**Choice:** Option B - Reduce stock on successful checkout

**Why:**

- **Simplicity**: No need for complex reservation logic
- **Realistic**: Users often abandon carts; reducing stock on add would cause issues
- **Validation**: We validate stock at checkout time to prevent overselling
- **Trade-offs**: Possible race condition if two users checkout simultaneously, but acceptable for in-memory store
- **Implementation**:
  1. Validate stock during checkout
  2. Create order
  3. Update product stock
  4. Clear cart
- **Future Consideration**: For production with database, use transactions or pessimistic locking

---

## Decision 9: User Identification Strategy

**Context:** We needed a way to identify users and their carts without implementing full authentication.

**Options Considered:**

- **Option A:** Full authentication with JWT tokens, passwords, etc.
- **Option B:** Simple user ID passed from frontend
- **Option C:** Session-based identification with cookies

**Choice:** Option B - Simple user ID

**Why:**

- **Scope**: Assignment doesn't require authentication
- **Focus**: Allows focus on core e-commerce logic rather than auth
- **Simplicity**: Frontend generates random user ID on mount
- **Flexibility**: Easy to replace with real auth later
- **Trade-offs**: Not production-ready security, but perfect for demo/assignment
- **Implementation**: `const userId = 'user-' + Math.random().toString(36).substr(2, 9)`
- **Future Consideration**: Replace with JWT tokens, OAuth, or session cookies

---

## Decision 10: Testing Strategy

**Context:** Assignment requires unit tests for core business logic. We needed to decide what to test and how comprehensive to be.

**Options Considered:**

- **Option A:** Test only the happy path
- **Option B:** Comprehensive unit tests for services, minimal integration tests
- **Option C:** Full test coverage including E2E tests

**Choice:** Option B - Comprehensive unit tests for services

**Why:**

- **Coverage**: Tests cover both success and failure scenarios
- **Confidence**: Core business logic is thoroughly tested
- **Speed**: Unit tests run quickly, enabling fast feedback
- **Requirements**: Meets assignment requirement for unit tests
- **Trade-offs**: No integration or E2E tests, but services are well-tested
- **Focus Areas**:
  - DiscountService: Code generation, validation, application
  - CartService: Add, update, remove, validation
  - OrderService: Checkout with/without discounts, stock updates
- **Future Consideration**: Add integration tests for API endpoints and E2E tests for critical flows
