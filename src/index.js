import { startSession, closeSession } from './module/chromium.js'
import puppeteer from 'puppeteer-extra';
import { notice, slugify } from './module/general.js'
import { autoSolve } from './module/turnstile.js'
import { fp } from './module/afp.js';
import { puppeteerRealBrowser } from './module/old.js'
export { puppeteerRealBrowser };

function targetFilter({ target, skipTarget }) {
    var response = !!target.url()
    if (skipTarget.find(item => String(target.url()).indexOf(String(item) > -1))) {
        response = true
    }
    // console.log(target.type());
    // if (target.url().length == 0) {
    //     response = true
    // }

    // if (target.type() == 'page') {
    //     response = true
    // }
    return response;
}


async function handleNewPage(page) {
    fp(page);
    return page
}


export const connect = ({ args = [], headless = 'auto', customConfig = {}, proxy = {}, skipTarget = [], fingerprint = true, turnstile = false, connectOption = {} }) => {
    return new Promise(async (resolve, reject) => {

        const { chromeSession, cdpSession, chrome, xvfbsession } = await startSession({
            args: args,
            headless: headless,
            customConfig: customConfig,
            proxy: proxy
        })

        const browser = await puppeteer.connect({
            targetFilter: (target) => targetFilter({ target: target, skipTarget: skipTarget }),
            browserWSEndpoint: chromeSession.browserWSEndpoint,
            ...connectOption
        });

        var page = await browser.pages()

        page = page[0]

        if (proxy && proxy.username && proxy.username.length > 0) {
            await page.authenticate({ username: proxy.username, password: proxy.password });
        }

        if (fingerprint === true) {
            handleNewPage(page);
        }
        if (turnstile === true) {
            autoSolve({ page: page, browser: browser })
        }

        await page.setUserAgent(chromeSession.agent);

        await page.setViewport({
            width: 1920,
            height: 1080
        });

        browser.on('disconnected', async () => {
            notice({
                message: 'Browser Disconnected',
                type: 'info'
            })
            await closeSession({
                xvfbsession: xvfbsession,
                cdpSession: cdpSession,
                chrome: chrome
            })
        });


        // browser.on('targetcreated', async target => {
        //     const newPage = await target.page();
        //     if (newPage && fingerprint === true) {
        //         newPage = handleNewPage(newPage);
        //     }
        //     if (turnstile === true) {
        //         autoSolve({ page: newPage })
        //     }
        // });


        resolve({
            browser: browser,
            page: page,
            xvfbsession: xvfbsession,
            cdpSession: cdpSession,
            chrome: chrome
        })
    })
}





