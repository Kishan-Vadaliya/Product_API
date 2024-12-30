import Joi from "joi"; 
import { Request, Response, NextFunction } from "express";
import Product from "../models/productModel";

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
  "total_stock_availability",
];

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

const productSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Product name is required.",
  }),

  product_description: Joi.string()
    .trim()
    .min(10)
    .required()
    .messages({
      "string.empty": "Product description is required.",
      "string.min": "Product description must be at least 10 characters long.",
    }),

  brand: Joi.string().trim().required().messages({
    "string.empty": "Product brand is required.",
  }),

  price: Joi.number()
    .greater(0)
    .required()
    .messages({
      "number.base": "Price must be a number.",
      "number.greater": "Price must be greater than 0.",
    }),

  ratings: Joi.number()
    .min(0)
    .max(5)
    .required()
    .messages({
      "number.base": "Ratings must be a number.",
      "number.min": "Ratings must be at least 0.",
      "number.max": "Ratings must not exceed 5.",
    }),

  category: Joi.string().trim().optional().messages({
    "string.base": "Category must be a string.",
  }),

  description: Joi.string().trim().optional(),
  seller: Joi.string().trim().optional(),
  discount: Joi.number().optional(),
  cod_availability: Joi.boolean().optional(),
  total_stock_availability: Joi.number().optional(),
});

export const validateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error } = productSchema.validate(req.body, { abortEarly: false });

    if (error) {
       res.status(400).json({
        success: false,
        errors: error.details.map((detail) => ({
          field: detail.context?.key || "unknown",
          message: detail.message,
        })),
      });
      return;
    }

    const { name, product_description } = req.body;
    const existingProduct = await Product.findOne({ name, product_description });

    if (existingProduct) {
        res.status(400).json({
        success: false,
        errors: [{
          field: "name",
          message: "Product with this name and description already exists."
        }],
      });
      return;
    }

    next();
  } catch (err:any ) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  rejectExtraFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};