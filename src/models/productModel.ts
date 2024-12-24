import mongoose, { Schema, Document} from "mongoose";

export interface IProduct extends Document {
  name: string;
  brand: string;
  seller: string;
  product_description: string;
  price: number;
  discount: number;
  ratings: number;
  cod_availability: boolean;
  total_stock_availability: number;
  category: string;
}

const productSchema: Schema<IProduct> = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
    },
    brand: {
      type: String,
      required: true,
    },
    seller: {
      type: String,
      required: true,
    },
    product_description: {
      type: String,
      required: true,
      minlength: 10,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
    },
    ratings: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    cod_availability: {
      type: Boolean,
      required: true,
    },
    total_stock_availability: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
    },
  },
  { timestamps: true }
);



// // Middleware to handle duplicate key errors gracefully
// productSchema.post<IProduct>("save", (error: any, doc: IProduct, next: (err?: CallbackError) => void) => {
//   if (error?.name === "MongoServerError" && (error as any).code === 11000) {
//     next(new Error("Product name or product description must be unique"));
//   } else {
//     next(error);
//   }
// });

// // Error handling for update operations
// productSchema.post<IProduct>(
//   ["findOneAndUpdate", "updateOne", "updateMany"],
//   (error: any, res: any, next: (err?: CallbackError) => void) => {
//     if (error?.name === "MongoServerError" && (error as any).code === 11000) {
//       next(new Error("Product name or product description must be unique"));
//     } else {
//       next(error);
//     }
//   }
// );

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
