import { startSession, closeSession } from './module/chromium.js'
import vanillaPuppeteer from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import { notice, sleep } from './module/general.js'
import { checkStat } from './module/turnstile.js'
import { protectPage, protectedBrowser } from 'puppeteer-afp'
import { puppeteerRealBrowser } from './module/old.js'
export { puppeteerRealBrowser };

const puppeteer = addExtra(vanillaPuppeteer);

async function handleNewPage({ page, config = {} }) {
    // fp(page);
    protectPage(page, {
        webRTCProtect: false,
        ...config
    });
    return page
}

export const connect = async ({
    args = [],
    headless = 'auto',
    customConfig = {},
    proxy = {},
    skipTarget = [],
    fingerprint = false,
    turnstile = false,
    connectOption = {},
    fpconfig = {}
}) => {
    var global_target_status = false

    function targetFilter({ target, skipTarget }) {
        if (global_target_status === false) {
            return true
        }

        var response = false

        try {
            response = !!target.url()
            if (skipTarget.find(item => String(target.url()).indexOf(String(item) > -1))) {
                response = true
            }
        } catch (err) { }

        return response;
    }

    const setTarget = ({ status = true }) => {
        global_target_status = status
    }

    const { chromeSession, chrome, xvfbsession } = await startSession({
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

    setTarget({ status: true })

    if (proxy && proxy.username && proxy.username.length > 0) {
        await page.authenticate({ username: proxy.username, password: proxy.password });
    }

    var solve_status = true

    const setSolveStatus = ({ status }) => {
        solve_status = status
    }

    const autoSolve = async ({ page }) => {
        while (solve_status) {
            try {
                await sleep(1500)
                await checkStat({ page: page }).catch(err => { })
            } catch (err) { }
        }
    }

    if (fingerprint === true) {
        handleNewPage({ page: page, config: fpconfig });
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

        try { setSolveStatus({ status: false }) } catch (err) { }

        await closeSession({
            xvfbsession: xvfbsession,
            chrome: chrome
        }).catch(err => { console.log(err.message); })
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
                handleNewPage({ page: newPage, config: fpconfig });
            } catch (err) { }
        }

        if (turnstile === true) {
            autoSolve({ page: newPage })
        }
    });

    return {
        browser: browser,
        page: page,
        xvfbsession: xvfbsession,
        chrome: chrome,
        setTarget: setTarget
    };
}





