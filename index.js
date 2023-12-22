import { launch } from 'chrome-launcher';
import chromium from 'chromium';
import CDP from 'chrome-remote-interface';
import axios from 'axios'
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

export const real = ({ proxy = {} }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let chromePath = chromium.path;
            const chromeFlags = ['--no-sandbox'];
            if (proxy && proxy.host && proxy.host.length > 0) {
                chromeFlags.push(`--proxy-server=${proxy.host}:${proxy.port}`);
            }
            var chrome = await launch({
                chromePath,
                chromeFlags
            });
            var cdpSession = await CDP({ port: chrome.port });

            const { Network, Page, Runtime } = cdpSession;

            await Runtime.enable();
            await Network.enable();
            await Page.enable();
            await Page.setLifecycleEventsEnabled({ enabled: true });

            var data = await axios.get('http://127.0.0.1:' + chrome.port + '/json/version').then(response => {
                console.log(response.data);
                return response.data.webSocketDebuggerUrl
            })
                .catch(err => {
                    throw new Error(err.message)
                })

            puppeteer.use(StealthPlugin())

            const browser = await puppeteer.connect({
                targetFilter: (target) => !!target.url(),
                browserWSEndpoint: data,
                ignoreHTTPSErrors: true,
                args: ['--start-maximized', "--window-size=1920,1040"]
            });
            browser.close = async () => {
                if (cdpSession) {
                    await cdpSession.close();
                }
                if (chrome) {
                    await chrome.kill();
                }
            }
            const pages = await browser.pages();
            const page = pages[0];
            if (proxy && proxy.username && proxy.username.length > 0) {
                await page.authenticate({ username: proxy.username, password: proxy.password });
            }
            await page.setUserAgent(data['User-Agent']);
            await page.setViewport({
                width: 1920,
                height: 1080,
            });
            resolve({
                browser: browser,
                page: page
            })
        } catch (err) {
            throw new Error(err.message)
        }
    })
}

