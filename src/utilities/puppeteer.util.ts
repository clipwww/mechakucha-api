import core, { type Browser } from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';

const IDLE_TIME = 1000 * 20;

// 判斷是否在 Vercel 環境
const isVercel = !!process.env.VERCEL;

const createPuppeteerUtil = () => {
  let browser: Browser;

  async function getBrowser() {
    if (browser.connected) {
      return browser;
    }
    browser = await core.launch({
    args: chrome.args,
    executablePath: isVercel ? await chrome.executablePath : '/path/to/your/local/chrome', // 本地開發時指向你的 Chrome
    headless: isVercel ? chrome.headless : true,
  });

    return browser;
  }
 

  async function newPage() {
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    page.once('error', (err) => {
      console.log('[PAGE ERROR]', err)
      page.close();
    })

    setTimeout(() => {
      if (page.isClosed()) {
        return;
      } 
      page.close();
    }, IDLE_TIME)
    
    return page;
  }

  return {
    newPage
  }
}

export const puppeteerUtil = createPuppeteerUtil();