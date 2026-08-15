import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle other types of known errors here if needed
  
  // Default to 500 Internal Server Error for unhandled errors
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction ? 'Internal Server Error' : err.message;
  
  res.status(500).json({ error: message });
};
