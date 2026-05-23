import { Response } from 'express';

interface ResponsePayload<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

/**
 * Sends a successful API response.
 */
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response => {
  const payload: ResponsePayload<T> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Sends an error API response.
 */
export const sendError = (
  res: Response,
  message: string,
  errors?: any,
  statusCode = 500
): Response => {
  const payload: ResponsePayload = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};
