import chromium from '@sparticuz/chromium';
import { launch } from 'chrome-launcher';
import CDP from 'chrome-remote-interface';
import vanillaPuppeteer from 'puppeteer';
import { addExtra } from 'puppeteer-extra';

import { notice } from './general.js';

const puppeteer = addExtra(vanillaPuppeteer);

export const puppeteerRealBrowser = async ({
    proxy = {},
    action = 'default',
    headless = false,
    executablePath = 'default',
}) => {
    try {
        notice({
            message:
                'The library has been updated. This usage will disappear soon. Please update your code.',
            type: 'error',
        });

        let xvfbsession = null;
        let chromePath = chromium.path;

        if (process.platform === 'linux' && headless === false) {
            notice({
                message:
                    'On the Linux platform you can only run the browser in headless true mode.',
                type: 'warning',
            });
            headless = true;
        }

        if (executablePath !== 'default') {
            chromePath = executablePath;
        }

        const chromeFlags = ['--no-sandbox'];

        if (headless === true && process.platform !== 'linux') {
            chromeFlags.push('--headless=new');
        }

        if (proxy?.host && proxy.host.length > 0) {
            chromeFlags.push(`--proxy-server=${proxy.host}:${proxy.port}`);
        }

        if (process.platform === 'linux') {
            try {
                const { default: Xvfb } = await import('xvfb');

                xvfbsession = new Xvfb({
                    silent: true,
                    xvfb_args: ['-screen', '0', '1280x720x24', '-ac'],
                });

                xvfbsession.startSync();
            } catch (err) {
                notice({
                    message:
                        'You are running on a Linux platform but do not have xvfb installed. The browser can be captured. Please install it with the following command\n\nsudo apt-get install xvfb',
                    type: 'error',
                });
                console.log(err.message);
            }
        }

        const chrome = await launch({
            chromePath,
            chromeFlags,
        });

        const cdpSession = await CDP({ port: chrome.port });

        const { Network, Page, Runtime } = cdpSession;

        await Runtime.enable();
        await Network.enable();
        await Page.enable();
        await Page.setLifecycleEventsEnabled({ enabled: true });

        const data = await fetch(`http://localhost:${chrome.port}/json/version`)
            .then((response) => response.json())
            .then((response) => {
                return {
                    browserWSEndpoint: response.webSocketDebuggerUrl,
                    agent: response['User-Agent'],
                };
            })
            .catch((err) => {
                throw new Error(err.message);
            });

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
                        } catch (err) {}
                    }
                } catch (err) {}
                return true;
            };

            const smallResponse = {
                userAgent: data.agent,
                browserWSEndpoint: data.browserWSEndpoint,
                closeSession,
                chromePath,
            };

            return smallResponse;
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
                } catch (err) {}
            }
        };

        const pages = await browser.pages();
        const page = pages[0];

        if (proxy?.username && proxy.username.length > 0) {
            await page.authenticate({
                username: proxy.username,
                password: proxy.password,
            });
        }

        await page.setUserAgent(data.agent);
        await page.setViewport({
            width: 1920,
            height: 1080,
        });

        return {
            browser,
            page,
        };
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
};
