import vanillaPuppeteer from 'puppeteer';
import { protectPage, protectedBrowser } from 'puppeteer-afp';
import { addExtra } from 'puppeteer-extra';

import { closeSession, startSession } from './module/chromium.js';
import { notice, sleep } from './module/general.js';
import { puppeteerRealBrowser } from './module/old.js';
import { checkStat } from './module/turnstile.js';

export { puppeteerRealBrowser };

const puppeteer = addExtra(vanillaPuppeteer);

async function handleNewPage({ page, config = {} }) {
    // fp(page);
    protectPage(page, {
        webRTCProtect: false,
        ...config,
    });

    return page;
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
    fpconfig = {},
}) => {
    let globalTargetStatus = false;

    function targetFilter({ target, skipTarget }) {
        if (globalTargetStatus === false) {
            return true;
        }

        try {
            if (!target.url()) {
                return false;
            }

            const targetUrl = String(target.url());

            if (skipTarget.some((item) => targetUrl.includes(String(item)))) {
                return true;
            }
        } catch (err) {}

        return false;
    }

    const setTarget = ({ status = true }) => {
        globalTargetStatus = status;
    };

    const { chromeSession, chrome, xvfbsession } = await startSession({
        args,
        headless,
        customConfig,
        proxy,
    });

    const browser = await puppeteer.connect({
        targetFilter: (target) => targetFilter({ target, skipTarget }),
        browserWSEndpoint: chromeSession.browserWSEndpoint,
        ...connectOption,
    });

    const [page] = await browser.pages();

    setTarget({ status: true });

    if (proxy?.username && proxy.username.length > 0) {
        await page.authenticate({
            username: proxy.username,
            password: proxy.password,
        });
    }

    let solveStatus = true;

    const setSolveStatus = ({ status }) => {
        solveStatus = status;
    };

    const autoSolve = async ({ page }) => {
        while (solveStatus) {
            try {
                await sleep(1500);
                await checkStat({ page }).catch((err) => {});
            } catch (err) {}
        }
    };

    if (fingerprint === true) {
        handleNewPage({ page, config: fpconfig });
    }

    if (turnstile === true) {
        setSolveStatus({ status: true });
        autoSolve({ page, browser });
    }

    await page.setUserAgent(chromeSession.agent);

    await page.setViewport({
        width: 1920,
        height: 1080,
    });

    browser.on('disconnected', async () => {
        notice({
            message: 'Browser Disconnected',
            type: 'info',
        });

        try {
            setSolveStatus({ status: false });
        } catch (err) {}

        await closeSession({
            xvfbsession,
            chrome,
        }).catch((err) => {
            console.log(err.message);
        });
    });

    browser.on('targetcreated', async (target) => {
        const newPage = await target.page();

        try {
            await newPage.setUserAgent(chromeSession.agent);
        } catch (err) {
            // console.log(err.message);
        }

        try {
            await newPage.setViewport({
                width: 1920,
                height: 1080,
            });
        } catch (err) {
            // console.log(err.message);
        }

        if (newPage && fingerprint === true) {
            try {
                handleNewPage({ page: newPage, config: fpconfig });
            } catch (err) {}
        }

        if (turnstile === true) {
            autoSolve({ page: newPage });
        }
    });

    return {
        browser,
        page,
        xvfbsession,
        chrome,
        setTarget,
    };
};
