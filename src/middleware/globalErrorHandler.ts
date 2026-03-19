import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || "Something went wrong!";
  let errorSource = "AppError";

  // Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "Invalid data provided. Please check your input fields.";
    errorSource = "PrismaValidationError";
  }

  // Prisma Known Request Error
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    errorSource = "PrismaDatabaseError";
    switch (err.code) {
      case "P2002":
        statusCode = 409;
        errorMessage = `Already exists: A record with this ${err.meta?.target} already exists.`;
        break;
      case "P2025":
        statusCode = 404;
        errorMessage = "Not found: The parcel, rider, or user you are looking for does not exist.";
        break;
      case "P2003":
        statusCode = 400;
        errorMessage = "Cannot modify: This record is linked to an existing parcel or payment.";
        break;
      case "P2014":
        statusCode = 400;
        errorMessage = "Relation error: The relation between records is invalid.";
        break;
      default:
        statusCode = 500;
        errorMessage = `Database error occurred. Code: ${err.code}`;
    }
  }

  // Prisma Connection Error
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    errorMessage = "Database connection failed. Please try again later.";
    errorSource = "PrismaConnectionError";
  }

  // Better-Auth Unauthorized
  else if (err.name === "UnauthorizedError" || err.status === 401) {
    statusCode = 401;
    errorMessage = "Unauthorized: Please login to access this resource.";
    errorSource = "AuthError";
  }

  // Forbidden
  else if (err.status === 403) {
    statusCode = 403;
    errorMessage = "Forbidden: You do not have permission to perform this action.";
    errorSource = "AuthError";
  }

  // Zod Validation Error
  else if (err.name === "ZodError") {
    statusCode = 400;
    errorMessage = "Validation failed: " + err.errors?.[0]?.message;
    errorSource = "ZodValidationError";
  }

  // Generic Error
  else if (err instanceof Error) {
    errorMessage = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    errorSource,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    details: err.meta || null,
  });
};

export default globalErrorHandler;