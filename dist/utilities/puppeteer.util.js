"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.puppeteerUtil = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const IDLE_TIME = 1000 * 20;
const createPuppeteerUtil = () => {
    let browser;
    async function getBrowser() {
        if (browser.connected) {
            return browser;
        }
        browser = await puppeteer_1.default.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
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
exports.puppeteerUtil = createPuppeteerUtil();
//# sourceMappingURL=puppeteer.util.js.map