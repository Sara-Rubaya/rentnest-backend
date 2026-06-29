// Static OpenAPI 3.0 specification for RentNest API.
// Served via swagger-ui-express at GET /api-docs

const bearerAuth = [{ bearerAuth: [] as string[] }];

const errorResponse = {
  description: "Error",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          errorDetails: { type: "object", nullable: true },
        },
      },
    },
  },
};

export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "RentNest API",
    version: "1.0.0",
    description:
      "Backend API for RentNest — a rental property marketplace. Roles: TENANT, LANDLORD, ADMIN.",
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password", "role"],
        properties: {
          name: { type: "string", example: "Sara Rahman" },
          email: { type: "string", example: "sara@example.com" },
          password: { type: "string", example: "password123" },
          phone: { type: "string", example: "+8801XXXXXXXXX" },
          role: { type: "string", enum: ["TENANT", "LANDLORD"] },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
      },
      PropertyInput: {
        type: "object",
        required: ["title", "description", "location", "price", "type"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          location: { type: "string" },
          price: { type: "number" },
          type: { type: "string", example: "apartment" },
          amenities: { type: "array", items: { type: "string" } },
          images: { type: "array", items: { type: "string" } },
          categoryId: { type: "string", format: "uuid" },
        },
      },
      RentalRequestInput: {
        type: "object",
        required: ["propertyId"],
        properties: {
          propertyId: { type: "string", format: "uuid" },
          moveInDate: { type: "string", format: "date-time" },
          message: { type: "string" },
        },
      },
      ReviewInput: {
        type: "object",
        required: ["rentalRequestId", "rating"],
        properties: {
          rentalRequestId: { type: "string", format: "uuid" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user (tenant/landlord)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterInput" } } },
        },
        responses: { "201": { description: "Registered" }, "400": errorResponse, "409": errorResponse },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive a JWT",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } },
        },
        responses: { "200": { description: "Logged in" }, "401": errorResponse },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: bearerAuth,
        responses: { "200": { description: "OK" }, "401": errorResponse },
      },
    },
    "/properties": {
      get: {
        tags: ["Properties (Public)"],
        summary: "Get all available properties with filters",
        parameters: [
          { name: "location", in: "query", schema: { type: "string" } },
          { name: "type", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "number" } },
          { name: "maxPrice", in: "query", schema: { type: "number" } },
          { name: "categoryId", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "OK" } },
      },
    },
    "/properties/{id}": {
      get: {
        tags: ["Properties (Public)"],
        summary: "Get property details by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" }, "404": errorResponse },
      },
    },
    "/categories": {
      get: { tags: ["Categories"], summary: "Get all property categories", responses: { "200": { description: "OK" } } },
      post: {
        tags: ["Categories"],
        summary: "Create a category (Admin only)",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } },
        },
        responses: { "201": { description: "Created" }, "403": errorResponse },
      },
    },
    "/landlord/properties": {
      get: {
        tags: ["Landlord"],
        summary: "Get all properties owned by the logged-in landlord",
        security: bearerAuth,
        responses: { "200": { description: "OK" } },
      },
      post: {
        tags: ["Landlord"],
        summary: "Create a new property listing",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PropertyInput" } } },
        },
        responses: { "201": { description: "Created" }, "400": errorResponse },
      },
    },
    "/landlord/properties/{id}": {
      put: {
        tags: ["Landlord"],
        summary: "Update a property listing (owner only)",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { schema: { $ref: "#/components/schemas/PropertyInput" } } },
        },
        responses: { "200": { description: "Updated" }, "403": errorResponse, "404": errorResponse },
      },
      delete: {
        tags: ["Landlord"],
        summary: "Delete a property listing (owner only)",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Deleted" }, "403": errorResponse, "404": errorResponse },
      },
    },
    "/landlord/requests": {
      get: {
        tags: ["Landlord"],
        summary: "Get all rental requests for the landlord's properties",
        security: bearerAuth,
        responses: { "200": { description: "OK" } },
      },
    },
    "/landlord/requests/{id}": {
      patch: {
        tags: ["Landlord"],
        summary: "Approve or reject a rental request",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", properties: { status: { type: "string", enum: ["APPROVED", "REJECTED"] } } },
            },
          },
        },
        responses: { "200": { description: "Updated" }, "400": errorResponse, "403": errorResponse },
      },
    },
    "/rentals": {
      post: {
        tags: ["Rentals"],
        summary: "Submit a rental request (Tenant)",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RentalRequestInput" } } },
        },
        responses: { "201": { description: "Created" }, "400": errorResponse },
      },
      get: {
        tags: ["Rentals"],
        summary: "Get the logged-in tenant's rental requests",
        security: bearerAuth,
        responses: { "200": { description: "OK" } },
      },
    },
    "/rentals/{id}": {
      get: {
        tags: ["Rentals"],
        summary: "Get rental request details",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" }, "403": errorResponse, "404": errorResponse },
      },
    },
    "/payments/create": {
      post: {
        tags: ["Payments"],
        summary: "Create a Stripe checkout session for an approved rental request",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", properties: { rentalRequestId: { type: "string", format: "uuid" } } },
            },
          },
        },
        responses: { "201": { description: "Checkout session created" }, "400": errorResponse },
      },
    },
    "/payments/confirm": {
      post: {
        tags: ["Payments"],
        summary: "Stripe webhook — confirms payment on checkout.session.completed event",
        responses: { "200": { description: "Received" }, "400": errorResponse },
      },
    },
    "/payments/verify/{sessionId}": {
      get: {
        tags: ["Payments"],
        summary: "Manually verify & finalize a Stripe checkout session (fallback for local/Postman testing without webhooks)",
        security: bearerAuth,
        parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Verified" }, "400": errorResponse },
      },
    },
    "/payments": {
      get: {
        tags: ["Payments"],
        summary: "Get the logged-in user's payment history",
        security: bearerAuth,
        responses: { "200": { description: "OK" } },
      },
    },
    "/payments/{id}": {
      get: {
        tags: ["Payments"],
        summary: "Get payment details by id",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" }, "403": errorResponse, "404": errorResponse },
      },
    },
    "/reviews": {
      post: {
        tags: ["Reviews"],
        summary: "Create a review after a completed rental",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewInput" } } },
        },
        responses: { "201": { description: "Created" }, "400": errorResponse },
      },
    },
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "Get all users",
        security: bearerAuth,
        responses: { "200": { description: "OK" } },
      },
    },
    "/admin/users/{id}": {
      patch: {
        tags: ["Admin"],
        summary: "Ban or unban a user",
        security: bearerAuth,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", properties: { status: { type: "string", enum: ["ACTIVE", "BANNED"] } } },
            },
          },
        },
        responses: { "200": { description: "Updated" }, "404": errorResponse },
      },
    },
    "/admin/properties": {
      get: {
        tags: ["Admin"],
        summary: "Get all properties on the platform",
        security: bearerAuth,
        responses: { "200": { description: "OK" } },
      },
    },
    "/admin/rentals": {
      get: {
        tags: ["Admin"],
        summary: "Get all rental requests on the platform",
        security: bearerAuth,
        responses: { "200": { description: "OK" } },
      },
    },
  },
};
