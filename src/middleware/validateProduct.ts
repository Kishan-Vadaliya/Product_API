import { Request, Response, NextFunction } from "express";
const { check, validationResult } = require("express-validator");
import Product from "../models/productModel";

// Allowed fields
const allowedFields = [
  "name",
  "brand",
  "price",
  "ratings",
  "category",
  "description",
  "seller",
  "product_description",
  "discount",
  "cod_availability",
  "total_stock_availability"
];

// Middleware to reject extra fields
const rejectExtraFields = (req: Request, res: Response, next: NextFunction) => {
  const extraFields = Object.keys(req.body).filter(
    (field) => !allowedFields.includes(field)
  );

  if (extraFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid fields: ${extraFields.join(", ")}. These fields are not allowed.`,
    });
  }

  next();
};

// Validation schema
export const validateProduct = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

    check('product_description')
    .isString().withMessage('Product description must be a string')
    .isLength({ min: 10 }).withMessage('Product description must be at least 10 characters long')
    .trim(),

    check('name').custom(async (name:String,  { req }: { req: Request }) => {
      const product = await Product.findOne({
        name: name,
        product_description: req.body.product_description,
      });

      if (product) {
        throw new Error('Product with this name and description already exists');
      }
  
      return true;
    }),

  check("brand")
    .trim()
    .notEmpty()
    .withMessage("Product brand is required"),

  check("price")
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value: number) => value > 0)
    .withMessage("Price must be greater than 0"),

  check("ratings")
    .isNumeric()
    .withMessage("Ratings must be a number")
    .custom((value: number) => value >= 0 && value <= 5)
    .withMessage("Ratings must be between 0 and 5"),

  check("category")
    .trim()
    .optional()
    .isString()
    .withMessage("Category must be a string if provided"),

  rejectExtraFields,
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
     res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return;
  }

  next();
};
