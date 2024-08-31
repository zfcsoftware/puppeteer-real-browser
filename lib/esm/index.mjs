import { launch, Launcher } from 'chrome-launcher';
import puppeteer from 'puppeteer-core-patch';
import { pageController } from './module/pageController.mjs';
import Xvfb from 'xvfb';

process.env.REBROWSER_PATCHES_RUNTIME_FIX_MODE = "alwaysIsolated"
// process.env.REBROWSER_PATCHES_DEBUG=1
export async function connect({ args = [], headless = false, customConfig = {}, proxy = {}, turnstile = false, connectOption = {}, disableXvfb = false, plugins = [], ignoreAllFlags = false }) {
    let xvfbsession = null
    if (headless == 'auto') headless = false

    if (process.platform === 'linux' && disableXvfb === false) {
        try {
            xvfbsession = new Xvfb({
                silent: true,
                xvfb_args: ['-screen', '0', '1920x1080x24', '-ac']
            });
            xvfbsession.startSync();
        } catch (err) {
            console.log('You are running on a Linux platform but do not have xvfb installed. The browser can be captured. Please install it with the following command\n\nsudo apt-get install xvfb\n\n' + err.message);
        }
    }

    let chromeFlags
    if (ignoreAllFlags === true) {
        chromeFlags = [
            ...args,
            ...((headless !== false) ? [`--headless=${headless}`] : []),
            ...((proxy && proxy.host && proxy.port) ? [`--proxy-server=${proxy.host}:${proxy.port}`] : [])
        ]
    } else {
        // Default flags: https://github.com/GoogleChrome/chrome-launcher/blob/main/src/flags.ts
        const flags = Launcher.defaultFlags()
        // Add AutomationControlled to "disable-features" flag
        const indexDisableFeatures = flags.findIndex((flag) => flag.startsWith('--disable-features'))
        flags[indexDisableFeatures] = `${flags[indexDisableFeatures]},AutomationControlled`
        // Remove "disable-component-update" flag
        const indexComponentUpdateFlag = flags.findIndex((flag) => flag.startsWith('--disable-component-update'))
        flags.splice(indexComponentUpdateFlag, 1)
        chromeFlags = [
            ...flags,
            ...args,
            ...((headless !== false) ? [`--headless=${headless}`] : []),
            ...((proxy && proxy.host && proxy.port) ? [`--proxy-server=${proxy.host}:${proxy.port}`] : []),
            '--no-sandbox'
        ]
    }

    const chrome = await launch({
        ignoreDefaultFlags: true,
        chromeFlags,
        ...customConfig
    });
    let pextra = null
    if (plugins.length > 0) {
        const { addExtra } = await import('puppeteer-extra');

        pextra = addExtra(puppeteer);

        for (const item of plugins) {
            pextra.use(item);
        }
    }

    const browser = await (pextra ? pextra : puppeteer).connect({
        browserURL: `http://127.0.0.1:${chrome.port}`,
        ...connectOption
    });

    let [page] = await browser.pages();

    let pageControllerConfig = { browser, page, proxy, turnstile, xvfbsession, pid: chrome.pid, plugins }

    page = await pageController(pageControllerConfig);

    browser.on('targetcreated', async target => {
        if (target.type() === 'page') {
            let newPage = await target.page();
            pageControllerConfig.page = newPage
            newPage = await pageController(pageControllerConfig);
        }
    });

    return {
        browser,
        page
    }
}   