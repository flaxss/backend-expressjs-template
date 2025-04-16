// app.js or server.js
const express = require("express");
const winston = require("winston");
const config = require("./configs/config.js"); // Import environment-specific config

// Initialize express app
const app = express();
const port = config.port;

// Configure winston logger
const logger = winston.createLogger({
  level: config.logLevel, // Set default log level (e.g., 'info', 'debug')
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "logs/app.log",
      level: "info", // Logs 'info' and above in this file
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error", // Logs only 'error' and above in this file
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

// Middleware to log errors for failed routes
app.use((err, req, res, next) => {
  logger.error(`Error in ${req.method} ${req.url}: ${err.message}`, {
    stack: err.stack,
  });
  res.status(500).send("Something went wrong!");
});

// Example route
app.get("/", (req, res) => {
  try {
    logger.info("Hello, Dockerized Express!");
    res.send("Hello, Dockerized Express!");
  } catch (error) {
    logger.error("Error in / route:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).send("Internal Server Error");
  }
});

app.get("/error", (req, res) => {
  throw new Error("This is a test error!");
});

// Catching uncaught exceptions and unhandled promise rejections
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1); // Exit after logging the error to prevent running in a broken state
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Promise Rejection:", { reason, promise });
  process.exit(1); // Exit after logging the error to prevent running in a broken state
});

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
