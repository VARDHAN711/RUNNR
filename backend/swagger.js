const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Runnr API",
      version: "1.0.0",
      description: "REST API for the Runnr task marketplace. Roles: **customer** and **freelancer**.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token obtained from /api/auth/login or /api/auth/signup",
        },
      },
    },
    tags: [
      { name: "Health", description: "API health check" },
      { name: "Auth", description: "Authentication endpoints (signup / login)" },
      { name: "Tasks", description: "Task management — role restrictions noted per endpoint" },
      { name: "Accept Requests", description: "Accept request management — role restrictions noted per endpoint" },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js", "./index.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
