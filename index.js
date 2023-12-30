import { launch } from 'chrome-launcher';
import chromium from 'chromium';
import CDP from 'chrome-remote-interface';
import axios from 'axios'
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
puppeteer.use(StealthPlugin())

export const puppeteerRealBrowser = ({ proxy = {}, puppeteer_header = {} }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let chromePath = chromium.path;
            const chromeFlags = ['--no-sandbox', "--headless"];
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
                return response.data.webSocketDebuggerUrl
            })
                .catch(err => {
                    throw new Error(err.message)
                })
                console.log('1');
            var arg = {
                targetFilter: (target) => !!target.url(),
                browserWSEndpoint: data,
                headless: false,
                ...puppeteer_header
            }
            if (proxy && proxy.host && proxy.host.length > 0) {
                if (arg["args"] && arg["args"].length > 0) {
                    arg.args.push(`--proxy-server=${proxy.host}:${proxy.port}`)
                } else {
                    arg["args"] = [`--proxy-server=${proxy.host}:${proxy.port}`]
                }
            }
            puppeteer.use(StealthPlugin())
            console.log('2');
            console.log(arg);
            const browser = await puppeteer.launch(arg);
            console.log('3');
            browser.on('disconnected', async () => {
                console.log('4');
                if (cdpSession) {
                    await cdpSession.close();
                }
                if (chrome) {
                    await chrome.kill();
                }
            });
            console.log('5');
            const pages = await browser.pages();
            const page = pages[0];
            console.log('6');
            if (proxy && proxy.username && proxy.username.length > 0) {
                await page.authenticate({ username: proxy.username, password: proxy.password });
            }
            console.log('7');
            await page.setUserAgent(data['User-Agent']);
            await page.setViewport({
                width: 1920,
                height: 1080,
            });
            console.log('8');
            resolve({
                browser: browser,
                page: page,
                browserWSEndpoint: data
            })
        } catch (err) {
            console.log(err);
            throw new Error(err.message)
        }
    })
}
puppeteerRealBrowser({
    puppeteer_header: {
        args: ['--start-maximized'],
        executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
    },
}).then(resp => {
    console.log('render');
    resp.page.goto('https://fingerprint.com/demo/')
})
