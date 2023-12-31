import { launch } from 'chrome-launcher';
import chromium from 'chromium';
import CDP from 'chrome-remote-interface';
import axios from 'axios'
import puppeteer from 'puppeteer-extra';
import Xvfb from 'xvfb';


export const puppeteerRealBrowser = ({ proxy = {}, action = 'default', headless = false, executablePath = 'default' }) => {
    return new Promise(async (resolve, reject) => {
        try {
            var xvfbsession = null
            var chromePath = chromium.path;

            if (executablePath !== 'default') {
                chromePath = executablePath
            }

            const chromeFlags = ['--no-sandbox'];

            if (headless === true && process.platform !== 'linux') {
                chromeFlags.push('--headless')
            }

            if (proxy && proxy.host && proxy.host.length > 0) {
                chromeFlags.push(`--proxy-server=${proxy.host}:${proxy.port}`);
            }

            if (process.platform === 'linux') {
                try {
                    var xvfbsession = new Xvfb({
                        silent: true,
                        xvfb_args: ['-screen', '0', '1280x720x24', '-ac']
                    });
                    xvfbsession.startSync();
                } catch (err) {
                    console.log(err.message);
                }
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
                response = response.data
                return {
                    browserWSEndpoint: response.webSocketDebuggerUrl,
                    agent: response['User-Agent']
                }
            })
                .catch(err => {
                    throw new Error(err.message)
                })


            if (action !== 'default') {
                const closeSession = async () => {
                    try {
                        if (cdpSession) {
                            await cdpSession.close();
                        }
                        if (chrome) {
                            await chrome.kill();
                        }

                        if (xvfbsession && xvfbsession !== null) {
                            try {
                                xvfbsession.stopSync();
                                xvfbsession = null;
                            } catch (err) { }
                        }
                    } catch (err) { }
                    return true
                }

                var smallResponse = {
                    userAgent: data.agent,
                    browserWSEndpoint: data.browserWSEndpoint,
                    closeSession: closeSession,
                    chromePath:chromePath
                }
                resolve(smallResponse)
                return smallResponse
            }

            const browser = await puppeteer.connect({
                targetFilter: (target) => !!target.url(),
                browserWSEndpoint: data.browserWSEndpoint,
            });
            browser.close = async () => {
                if (cdpSession) {
                    await cdpSession.close();
                }
                if (chrome) {
                    await chrome.kill();
                }

                if (xvfbsession && xvfbsession !== null) {
                    try {
                        xvfbsession.stopSync();
                        xvfbsession = null;
                    } catch (err) { }
                }

            }

            const pages = await browser.pages();
            const page = pages[0];
            if (proxy && proxy.username && proxy.username.length > 0) {
                await page.authenticate({ username: proxy.username, password: proxy.password });
            }
            await page.setUserAgent(data.agent);
            await page.setViewport({
                width: 1920,
                height: 1080,
            });
            resolve({
                browser: browser,
                page: page
            })
        } catch (err) {
            console.log(err);
            throw new Error(err.message)
        }
    })
}