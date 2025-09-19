import core, {} from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';
const IDLE_TIME = 1000 * 20;
const createPuppeteerUtil = () => {
    let browser;
    async function getBrowser() {
        if (browser.connected) {
            return browser;
        }
        browser = await core.launch({
            args: chrome.args,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
        });
        return browser;
    }
    async function newPage() {
        const browser = await getBrowser();
        const page = await browser.newPage();
        page.once('error', (err) => {
            console.log('[PAGE ERROR]', err);
            page.close();
        });
        setTimeout(() => {
            if (page.isClosed()) {
                return;
            }
            page.close();
        }, IDLE_TIME);
        return page;
    }
    return {
        newPage
    };
};
export const puppeteerUtil = createPuppeteerUtil();
