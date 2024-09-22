import { launch, Launcher } from 'chrome-launcher';
import puppeteer from 'rebrowser-puppeteer-core';
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

    const chrome = await launch({
        ignoreDefaultFlags: true,
        chromeFlags: [
            ...(
                (ignoreAllFlags === true)
                    ? [
                        ...((proxy && proxy.host && proxy.port) ? [`--proxy-server=${proxy.host}:${proxy.port}`] : []),
                        ...args, ...((headless !== false) ? [`--headless=${headless}`] : []),
                    ] : [
                        ...Launcher.defaultFlags().filter(item => !item.includes("--disable-features") && !item.includes("component-update")),
                        ...args, ...((headless !== false) ? [`--headless=${headless}`] : []),
                        ...((proxy && proxy.host && proxy.port) ? [`--proxy-server=${proxy.host}:${proxy.port}`] : []),
                        '--disable-features=Translate,OptimizationHints,MediaRouter,DialMediaRouteProvider,CalculateNativeWinOcclusion,InterestFeedContentSuggestions,CertificateTransparencyComponentUpdater,AutofillServerCommunication,PrivacySandboxSettings4,AutomationControlled',
                        "--no-sandbox"
                    ]
            ),
        ],
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

    page = await pageController({ ...pageControllerConfig, chrome, killProcess: true });

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