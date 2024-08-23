const puppeteer = require('../data/puppeteer-core/lib/cjs/puppeteer/puppeteer-core.js')
const { pageController } = require('./module/pageController.js')
const Xvfb = require('xvfb');

process.env.REBROWSER_PATCHES_RUNTIME_FIX_MODE = "alwaysIsolated"
// process.env.REBROWSER_PATCHES_DEBUG = 1
async function connect({ args = [], headless = false, customConfig = {}, proxy = {}, turnstile = false, connectOption = {}, disableXvfb = false }) {
    const { launch, Launcher } = await import('chrome-launcher');

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
        chromeFlags: [
            ...Launcher.defaultFlags().filter(item => !item.includes("--disable-features")),
            ...args, ...((headless !== false) ? [`--headless=${headless}`] : []),
            ...((proxy && proxy.host && proxy.port) ? [`--proxy-server=${proxy.host}:${proxy.port}`] : []),
            '--disable-features=Translate,OptimizationHints,MediaRouter,DialMediaRouteProvider,CalculateNativeWinOcclusion,InterestFeedContentSuggestions,CertificateTransparencyComponentUpdater,AutofillServerCommunication,PrivacySandboxSettings4,AutomationControlled',
            "--no-sandbox", "--disable-setuid-sandbox"
        ],
        ...customConfig
    });

    const browser = await puppeteer.connect({
        browserURL: `http://127.0.0.1:${chrome.port}`,
        ...connectOption
    });

    let [page] = await browser.pages();

    let pageControllerConfig = { browser, page, proxy, turnstile, xvfbsession, pid: chrome.pid }

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

module.exports = { connect }