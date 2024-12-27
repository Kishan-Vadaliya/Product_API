import express from "express";
import { createProduct,createMultipleProducts,getAllProducts, getProductById,
         updateProductById,deleteProductById,searchProductsByKey } from "../controllers/productController";
import { validateProduct, handleValidationErrors } from "../middleware/validateProduct";

const router = express.Router();

router.post("/CreateProduct", validateProduct, handleValidationErrors, createProduct);
router.post("/CreateMultiple", createMultipleProducts);
router.get("/GetAllProducts", getAllProducts);
router.get("/GetProductById/:id", getProductById);
router.get("/SearchProduct/:key", searchProductsByKey);
router.patch("/UpdateProductById/:id",validateProduct, updateProductById);
router.delete("/DeleteProductById/:id", deleteProductById);

export default router;
