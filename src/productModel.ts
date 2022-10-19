/* istanbul ignore file */
import { Schema, model } from 'mongoose'
import { Product } from './types'

const ProductSchema = new Schema<Product>({
  id: {
    type: String,
  },
  title: {
    type: String
  },
  image: {
    type: String
  },
  showcase: {
    type: [String]
  },
  url: {
    type: String
  },
  price: {
    type: String
  },
  isAvailable: {
    type: Boolean
  },
})

const ProductModel = model<Product>('Product', ProductSchema)
export default ProductModel
