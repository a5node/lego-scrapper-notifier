import { createProducts, deleteProducts, getProducts } from "./database"
import { scrapWebsiteProducts } from "./scrap"
import { sendProductToTelegram } from "./telegram"
import { sleep } from "./utils"
require('dotenv').config()

async function main() {
  const existingProducts = await getProducts()
  const scrappedProducts = await scrapWebsiteProducts()
  for (let index = 0; index < scrappedProducts.length; index++) {
    const scrappedProduct = scrappedProducts[index]
    const existingProduct = existingProducts?.find(product => product.id === scrappedProduct.id)
    if (!existingProduct) {
      await sendProductToTelegram(scrappedProduct, 'new')
      sleep(1)
      continue
    }

    if (!existingProduct.isAvailable && scrappedProduct.isAvailable) {
      await sendProductToTelegram(scrappedProduct, 'now-available')
      sleep(1)
    }

    if (existingProduct.isAvailable && !scrappedProduct.isAvailable) {
      await sendProductToTelegram(scrappedProduct, 'now-unavailable')
      sleep(1)
    }
  }
  await deleteProducts()
  await createProducts(scrappedProducts)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })