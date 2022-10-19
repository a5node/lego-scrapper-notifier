import { connection, connect } from 'mongoose'
import ProductModel from './productModel'
import { Product } from './types'

export async function connectDatabase () {
  try {
    if (connection.readyState === 0) {
      connect(`mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/products?retryWrites=true&w=majority`)
    }
  } catch (error) {
    console.log(error)
  }
}

export async function getProducts() {
  try {
    await connectDatabase()
    const allProducts = await ProductModel.find({}).lean()
    return allProducts
  } catch (error) {
    console.log(error)
  }
}

export async function createOrUpdateProduct (product: Product): Promise<Product | undefined> {
  try {
    await connectDatabase()
    const guild = await ProductModel.findOneAndUpdate({ id: product.id }, product, {
      new: true,
      upsert: true
    })
    await guild.save()
    return guild
  } catch (error) {
    console.log(error)
  }
}

export async function createProducts (products: Product[]): Promise<void> {
  try {
    await connectDatabase()
    console.log(`Creating ${products.length} products...`)
    await ProductModel.insertMany(products)
  } catch (error) {
    console.log(error)
  }
}

export async function deleteProducts (): Promise<void> {
  try {
    await connectDatabase()
    console.log("Deleting products...")
    await ProductModel.deleteMany({})
  } catch (error) {
    console.log(error)
  }
}