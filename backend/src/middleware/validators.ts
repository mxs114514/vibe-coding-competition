import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRecipeGeneration = [
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('Ingredients must be a non-empty array'),
  body('ingredients.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each ingredient must be a non-empty string'),

  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        code: 400,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }
    next();
  },
];
