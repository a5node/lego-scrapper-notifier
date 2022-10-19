import puppeteer, { Page } from 'puppeteer'
import { Product } from './types'

async function scrapProducts(page: Page) {
  try {
    const products = await page.evaluate(getProducts)
    console.log(`Scrapped ${products.length} products on page ${page.url()}`)
    return products
  } catch (error) {
    console.log(error)
    return []
  }
}

async function scrapNextPage(page: Page) {
  try {
    const nextPageUrl = await page.evaluate(getNextPageButton)
    return nextPageUrl
  } catch (error) {
    console.log(error)
  }
}

function getNextPageButton() {
  return document.querySelector('[class="s-pagination-item s-pagination-next s-pagination-button s-pagination-separator"]')?.getAttribute("href")
}

function getProducts(): Product[] {
  const productElements = [...document.querySelectorAll('[data-component-type="s-search-result"]')]
  const products = productElements.map(productElement => {
    const title = (<HTMLElement>(productElement.querySelector('[class="a-size-base-plus a-color-base a-text-normal"]')))?.innerText || 'Unknown'
    let id = ''
    const matches = title.match(/LEGO\s(\d+)\s(\w+)/)
    if (matches) {
        id = matches[1]
    }
    else {
      const matches = title.match(/LEGO\s(\w+)\s(\d+)\s(\w+)/)
      if (matches) {
          id = matches[2]
      }
    }
    const imageAttribute = productElement.querySelector('[class="s-image"]')?.getAttribute('src') || ''
    const images = imageAttribute.split(',')
    const image = images ? images[images.length - 1] : ''
    const showcaseElement = productElement.querySelector(".date-showcase")
    const showcase = showcaseElement ? [...showcaseElement.classList].filter(className => className !== "date-showcase") : []
    const url = productElement.querySelector('a')?.getAttribute('href') || ''
    const priceSymbol =(<HTMLElement>( productElement.querySelector('[class="a-price-symbol"]')))?.innerText || ''
    const price =((<HTMLElement>( productElement.querySelector('[class="a-price-whole"]')))?.innerText || 'Unknown') + ' ' + priceSymbol
    const isAvailable = productElement.querySelector('.overlay-no-stock') ? false : true
    return {
      id,
      title,
      image,
      showcase,
      url,
      price,
      isAvailable
    }
  })
  return products.filter(productElement => productElement.id.length > 0)
}

export async function scrapWebsiteProducts() {
  let resultsProcessed: Product[] = []
  let results: Product[] = []
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  })
  const page = await browser.newPage()
  
  let urls: String[] | undefined = process.env.SOURCE_SITES?.split(", ")
  
  if(urls != undefined && urls.length > 0) {
    for(var url of urls) {
      let hasNextPage = true
      await page.goto(`${url}`, { waitUntil: 'networkidle2', timeout: 0 })
      while (hasNextPage) {
        const products = await scrapProducts(page)
        results = results.concat(products)
        const nextPage = await scrapNextPage(page)
        if (nextPage) {
          await page.goto(`${url}${nextPage}`, { waitUntil: 'networkidle2', timeout: 0 })
        } else {
          hasNextPage = false
        }
      }
    }
  } 
  
  console.log(`Scrapped a total of ${results.length} products`)
  await browser.close()
  
  results.map(element => {
    if (resultsProcessed.find(element2 => element2.id == element.id)  == null) resultsProcessed.push(element)
    else if(Number.parseFloat(resultsProcessed.find(element2 => element2.id == element.id)?.price!) > Number.parseFloat(element.price!)) {
      resultsProcessed[resultsProcessed.indexOf(resultsProcessed.find(element2 => element2.id == element.id)!)] = element
    }
  })
  return resultsProcessed
}