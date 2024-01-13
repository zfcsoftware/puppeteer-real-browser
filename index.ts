import { launch } from 'chrome-launcher';
import chromium from 'chromium';
import CDP from 'chrome-remote-interface';
import axios from 'axios'
import puppeteer from 'puppeteer-extra';
import Xvfb from 'xvfb';
import clc from 'cli-color'

interface Args {
    proxy?: {
        host: string,
        port: number,
        username?: string,
        password?: string
    },
    action?: string,
    headless?: boolean,
    executablePath?: string
}

export const puppeteerRealBrowser = (args: Args) => {
    return new Promise(async (resolve, reject) => {
        try {
            let xvfbsession = null
            let chromePath = chromium.path;

            if (process.platform === 'linux' && args.headless === false) {
                console.log(clc.yellow('[WARNING] [PUPPETEER-REAL-BROWSER] | On the Linux platform you can only run the browser in headless true mode.'));
                args.headless = true
            }


            if (args.executablePath !== 'default') {
                chromePath = args.executablePath
            }

            const chromeFlags = ['--no-sandbox'];

            if (args.headless === true && process.platform !== 'linux') {
                chromeFlags.push('--headless')
            }

            if (args.proxy && args.proxy.host && args.proxy.host.length > 0) {
                chromeFlags.push(`--proxy-server=${args.proxy.host}:${args.proxy.port}`);
            }

            if (process.platform === 'linux') {
                try {
                    xvfbsession = new Xvfb({
                        silent: true,
                        xvfb_args: ['-screen', '0', '1280x720x24', '-ac']
                    });
                    (xvfbsession as Xvfb).startSync();
                } catch (err) {
                    console.log(clc.red('[ERROR] [PUPPETEER-REAL-BROWSER] | You are running on a Linux platform but do not have xvfb installed. The browser can be captured. Please install it with the following command\n\nsudo apt-get install xvfb'));
                    console.log(err.message);
                }

                // if (action === 'socket') {
                //     console.log(clc.red('[ERROR] [PUPPETEER-REAL-BROWSER] | Manageable Usage is only available on windows platform. On Linux platform it should be used with the default usage.'));
                //     throw new Error('Manageable Usage is only available on windows platform. On Linux platform it should be used with the default usage.')
                //     return false
                // }

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
                const responseData = response.data;
                return {
                    browserWSEndpoint: responseData.webSocketDebuggerUrl,
                    agent: responseData['User-Agent']
                }
            }).catch(err => {
                throw new Error(err.message)
            })

            if (args.action !== 'default') {
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
                                (xvfbsession as Xvfb).stopSync();
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
                    chromePath: chromePath
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
                        (xvfbsession as Xvfb).stopSync();
                        xvfbsession = null;
                    } catch (err) { }
                }

            }

            const pages = await browser.pages();
            const page = pages[0];
            if (args.proxy && args.proxy.username && args.proxy.username.length > 0 && args.proxy.password && args.proxy.password.length > 0) {
                await page.authenticate({ username: args.proxy.username, password: args.proxy.password });
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
