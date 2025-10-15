# Secure Express Backend

A security-centric Node.js and Express backend foundation written in TypeScript with MongoDB connectivity, structured logging, and automated testing.

## Features

- **TypeScript-first** development workflow with build scripts and Jest test runner
- **Security middleware stack** including Helmet, CORS, compression, and disabled `x-powered-by`
- **Structured logging** with Winston and request/error logging via `express-winston`
- **MongoDB integration** powered by Mongoose with connection helpers and graceful shutdown support
- **Healthcheck endpoint** at `GET /health` for uptime monitoring

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and adjust values as needed:

   ```bash
   cp .env.example .env
   ```

   At minimum, set `MONGO_URI` to point to your MongoDB instance.

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Execute the test suite:

   ```bash
   npm test
   ```

5. Build the production bundle:

   ```bash
   npm run build
   npm start
   ```

## Environment Configuration

| Variable        | Description                                               | Default                    |
|-----------------|-----------------------------------------------------------|----------------------------|
| `PORT`          | HTTP port the server listens on                           | `3000`                     |
| `APP_NAME`      | Application service name used in logging metadata         | `secure-express-backend`   |
| `NODE_ENV`      | Runtime environment (`development`, `test`, `production`) | `development`              |
| `MONGO_URI`     | MongoDB connection string                                 | _required_                 |
| `CORS_ORIGIN`   | Comma-separated list of allowed origins or `*`            | `*`                        |
| `CORS_CREDENTIALS` | Whether to include credentials in CORS responses (`true`/`false`) | `false`           |
| `LOG_LEVEL`     | Logging level for Winston                                 | `debug` in dev, `info` prod|

## Security Baseline

- **Helmet**: Applies industry-standard HTTP security headers. Additional CSP tuning may be required based on frontend needs.
- **CORS**: Configurable allowed origins. Default permits all origins; restrict in production environments.
- **Compression**: Enables gzip responses to reduce payload size.
- **Hidden Stack Details**: Express `x-powered-by` header is disabled to reduce server fingerprinting.
- **Structured Logging**: Sensitive values such as database credentials are never logged.

> **In-transit Encryption Requirement**: This service is designed to run behind a TLS termination point such as a load balancer, API gateway, or reverse proxy that serves traffic over HTTPS. Ensure that all client communication to the edge and all upstream connections (including MongoDB) enforce TLS to maintain end-to-end encryption.

## Project Structure

```
├── src
│   ├── app.ts              # Express application configuration and middleware
│   ├── index.ts            # Application bootstrap and graceful shutdown logic
│   ├── config
│   │   └── env.ts          # Environment variable loader and configuration helper
│   ├── lib
│   │   └── mongo.ts        # MongoDB connection and lifecycle helpers
│   └── routes
│       └── healthcheck.ts  # Healthcheck route
├── tests                   # Jest test suites (SuperTest integration tests)
├── .env.example            # Sample environment configuration
├── jest.config.js          # Jest configuration powered by ts-jest
└── tsconfig.json           # TypeScript compiler configuration
```

## Graceful Shutdown

The server listens for `SIGINT`, `SIGTERM`, and `SIGQUIT` signals as well as unhandled errors to perform an orderly shutdown:

1. Stops accepting new HTTP connections
2. Disconnects from MongoDB
3. Exits the process with an appropriate status code

This ensures resources are released cleanly and avoids abrupt termination of in-flight requests.

## Testing

The project ships with Jest and SuperTest configured for API assertions. The included test suite validates the healthcheck endpoint and verifies that security headers like `x-powered-by` remain disabled.

```bash
npm test
```
