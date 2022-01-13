import  puppeteer from 'puppeteer';

const IDLE_TIME = 1000 * 20;

const createPuppeteerUtil = () => {
  let browser: puppeteer.Browser;

  async function getBrowser() {
    if (browser?.isConnected()) {
      return browser;
    }
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
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