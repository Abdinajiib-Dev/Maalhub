import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof ZodError || err.name === 'ZodError') {
    const errorList = err.errors || err.issues || [];
    return res.status(400).json({
      error: 'Validation failed',
      details: errorList.map((e) => ({
        field: e.path ? e.path.join('.') : 'unknown',
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
