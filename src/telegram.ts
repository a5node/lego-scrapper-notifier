import axios from 'axios'
import { Product } from './types';

const getAxiosInstance = () => axios.create({
  baseURL: `https://api.telegram.org/bot${process.env.TELEGRAM_BOTID}/`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export async function sendPhotoWithCaptionToTelegram(photoUrl: string, caption: string, replyMarkup: any = undefined) {
  if(process.env.TELEGRAM_USERID != undefined && process.env.TELEGRAM_USERID.length > 0) {
    try {
      const chatId = process.env.TELEGRAM_USERID
      const options = {
        photo: photoUrl, 
        chat_id: chatId,
        disable_notification: true,
        caption,
        parse_mode: 'html',
        reply_markup: replyMarkup
      }
      await getAxiosInstance().post('/sendPhoto', options)
    } catch (error) {
      console.log(error)
    }
  }
}

export async function sendTextToTelegram(text: string) {
  if(process.env.TELEGRAM_USERID != undefined && process.env.TELEGRAM_USERID.length > 0) {
    try {
      const chatId = process.env.TELEGRAM_USERID
      const options = {
        text, 
        chat_id: chatId,
        parse_mode: 'html',
        disable_notification: true
      }
      await getAxiosInstance().post('/sendMessage', options)
      return `Message sent to telegram's chat id ${chatId}`
    } catch (error) {
      console.log(error)
    }
  }
}

const eventMessage: Record<string, string> = {
  'now-available': 'Now Available',
  'now-unavailable': 'Out of Stock',
  'new': 'New Product'
}

export async function sendProductToTelegram(product: Product, event: string) {
  const messageTitle = `<b>${eventMessage[event]}</b>: ${product.title}`
  const priceText = product.price

  if (event === 'now-unavailable') {
    await sendTextToTelegram(messageTitle)
    return
  }

  await sendPhotoWithCaptionToTelegram(
    product.image,
    `${messageTitle}\n<b>Price</b>: ${priceText}`, 
    { inline_keyboard: [[{ text: "Go to product", url: product.url }]] }
  )
}