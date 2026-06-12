import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import logger from '../utils/logger';
import { env } from '../config/environment';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  if (err instanceof AppError && err.isOperational) {
    logger.warn(`Operational error: ${err.message}`, {
      statusCode: err.statusCode,
      details: err.details,
    });
  } else {
    logger.error('Unexpected error:', err);
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.details);
    return;
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    sendError(res, 'Database validation error', 400, err.message);
    return;
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    sendError(res, 'Resource already exists', 409);
    return;
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    const multerErr = err as multer.MulterError;
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'File size exceeds the maximum limit', 413);
      return;
    }
    sendError(res, `Upload error: ${multerErr.message}`, 400);
    return;
  }

  // Default: Internal Server Error
  const message = env.nodeEnv === 'development'
    ? err.message
    : 'Internal Server Error';

  sendError(res, message, 500);
}

// Import for type reference
import multer from 'multer';
