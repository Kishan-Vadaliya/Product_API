import { Request, Response, NextFunction } from "express";
import Products from "../models/productModel";

const handleError = (
  res: Response,
  message: string,
  statusCode = 500,
  error?: any
) => {
  console.error(message, error);
  res.status(statusCode).json({
    status: "error",
    message,
    error: error instanceof Error ? error.message : undefined,
  });
};

// Create a one product
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newProduct = await Products.create(req.body);
    res.status(201).json({
      status: "success",
      data: newProduct,
    });
  } catch (err) {
    handleError(res, "Failed to create product", 400, err);
  }
};


// Create multiple products
// export const createMultipleProducts = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const products = req.body;
//     if (!Array.isArray(products)) {
//       res.status(400).json({
//         status: "fail",
//         message: "Request body must be an array of products.",
//       });
//       return;
//     }

//     const createdProducts = await Products.insertMany(products, {
//       ordered: true,
//     });
//     res.status(201).json({
//       status: "success",
//       data: createdProducts,
//     });
//   } catch (err) {
//     handleError(res, "Failed to create multiple products", 400, err);
//   }
// };


interface ProductResponse {
  status: string;
  successCount: number;  
  failedCount: number;   
  successInserts: any[];
  failedInserts?: { product: any; error: string }[]; 
}

export const createMultipleProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = req.body;

    if (!Array.isArray(products)) {
        res.status(400).json({
        status: "fail",
        message: "Request body must be an array of products.",
      });
      return;
    }

    const createdProducts: any[] = [];
    const failedInserts: { product: any; error: string }[] = [];

    for (const product of products) {
      try {
        const createdProduct = await Products.create(product);
        createdProducts.push(createdProduct);
      } catch (err) {
        
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";

        failedInserts.push({
          product,
          error: errorMessage,
        });
      }
    }

    
    const response: ProductResponse = {
      status: "success",
      successCount: createdProducts.length, 
      failedCount: failedInserts.length,     
      successInserts: createdProducts,
    };

    
    if (failedInserts.length > 0) {
      response.failedInserts = failedInserts;
    }

    res.status(201).json(response);
  } catch (err) {
    

    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    handleError(res, `Failed to create multiple products: ${errorMessage}`, 400, err);
  }
};




export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit=25,
      sort = "createdAt",
      order = "asc",
      name,
      brand,
      priceMin,
      priceMax,
      ...otherFilters
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10));
    const limitNumber = Math.max(1, parseInt(limit as string, 10));
    const sortOrder = order === "desc" ? -1 : 1;

    const query: any = { ...otherFilters };

    if (name) {
      query.name = { $regex: new RegExp(name as string, "i") };
    }

    if (brand) {
      query.brand = { $regex: new RegExp(brand as string, "i") };
    }

    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = parseFloat(priceMin as string);
      if (priceMax) query.price.$lte = parseFloat(priceMax as string);
    }

    const totalProducts = await Products.countDocuments(query);
    const productsList = await Products.find(query)
      .sort({ [sort as string]: sortOrder })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.status(200).json({
      status: "success",
      pagination: {
        total: totalProducts,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
        limit: limitNumber,
        result : productsList.length,
      },
      data: productsList,
    });
  } catch (err) {
    handleError(res, "Failed to retrieve products", 500, err);
  }
};

// Get a product by ID
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const product = await Products.findById(id);
    if (!product) {
      res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (err) {
    handleError(res, "Failed to retrieve product", 500, err);
  }
};

// Update product by ID
export const updateProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Products.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedProduct) {
      res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: updatedProduct,
    });
  } catch (err) {
    handleError(res, "Failed to update product", 400, err);
  }
};

// Delete product by ID
export const deleteProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const product = await Products.findByIdAndDelete(id);
    if (!product) {
      res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (err) {
    handleError(res, "Failed to delete product", 500, err);
  }
};

// Search products by a key (name or brand)
export const searchProductsByKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params;
    if (typeof key !== "string" || !isNaN(Number(key))) {
      res.status(400).json({
        status: "fail",
        message: `The ${key} key parameter must be a valid string.`,
      });
      return;
    }

    const regex = new RegExp(key, "i");
    const productsList = await Products.find({
      $or: [{ name: regex }, { brand: regex }],
    });

    if (productsList.length === 0) {
      res.status(404).json({
        status: "fail",
        message: "No products found matching the search criteria.",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: productsList,
    });
  } catch (err) {
    handleError(res, "Failed to search products", 500, err);
  }
};

export default {
  createProduct,
  createMultipleProducts,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  searchProductsByKey,
};
