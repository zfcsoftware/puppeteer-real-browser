import { startSession, closeSession } from './module/chromium.js'
import puppeteer from 'puppeteer-extra';
import { notice, slugify } from './module/general.js'
import { autoSolve, setSolveStatus } from './module/turnstile.js'
import { fp } from './module/afp.js';
import { puppeteerRealBrowser } from './module/old.js'
export { puppeteerRealBrowser };

var global_target_status = true

function targetFilter({ target, skipTarget }) {

    if (global_target_status === false) {
        return true
    }
    var response = !!target.url()
    if (skipTarget.find(item => String(target.url()).indexOf(String(item) > -1))) {
        response = true
    }
    return response;
}


async function handleNewPage(page) {
    fp(page);
    return page
}


const setTarget = ({ status = true }) => {
    global_target_status = status
}


export const connect = ({ args = [], headless = 'auto', customConfig = {}, proxy = {}, skipTarget = [], fingerprint = true, turnstile = false, connectOption = {}, tf = true }) => {
    return new Promise(async (resolve, reject) => {

        global_target_status = tf

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
            setSolveStatus({ status: true })
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
            setSolveStatus({ status: false })
            await closeSession({
                xvfbsession: xvfbsession,
                cdpSession: cdpSession,
                chrome: chrome
            })
        });


        browser.on('targetcreated', async target => {
            var newPage = await target.page();

            try {
                await newPage.setUserAgent(chromeSession.agent);
            } catch (err) {
                // console.log(err.message);
            }

            try {
                await newPage.setViewport({
                    width: 1920,
                    height: 1080
                });
            } catch (err) {
                // console.log(err.message);
            }


            if (newPage && fingerprint === true) {
                try {
                    handleNewPage(newPage);
                } catch (err) { }
            }

            if (turnstile === true) {
                autoSolve({ page: newPage })
            }
        });

        resolve({
            browser: browser,
            page: page,
            xvfbsession: xvfbsession,
            cdpSession: cdpSession,
            chrome: chrome,
            setTarget: setTarget
        })
    })
}





