import chromium from '@sparticuz/chromium';
import { launch } from 'chrome-launcher';
import CDP from 'chrome-remote-interface';

import { notice, slugify } from './general.js';

export const closeSession = async ({ xvfbsession, chrome }) => {
    if (xvfbsession) {
        try {
            xvfbsession.stopSync();
        } catch (err) {}
    }
    if (chrome) {
        try {
            await chrome.kill();
        } catch (err) {}
    }
    return true;
};

export const startSession = async ({
    args = [],
    headless = 'auto',
    customConfig = {},
    proxy = {},
}) => {
    try {
        let xvfbsession = null;
        const chromePath =
            customConfig.executablePath || customConfig.chromePath || chromium.path;

        const platform = slugify(process.platform);

        const isLinuxPlatform = platform.includes('linux');
        const isWindowsPlatform = platform.includes('win');

        if (isLinuxPlatform && headless === false) {
            notice({
                message:
                    'This library is stable with headless: true in linuxt environment and headless: false in Windows environment. Please send headless: \'auto\' for the library to work efficiently.',
                type: 'error',
            });
        } else if (isWindowsPlatform && headless === true) {
            notice({
                message:
                    'This library is stable with headless: true in linuxt environment and headless: false in Windows environment. Please send headless: \'auto\' for the library to work efficiently.',
                type: 'error',
            });
        }

        if (headless === 'auto') {
            headless = isLinuxPlatform;
        }

        const chromeFlags = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1920,1080',
        ].concat(args);

        if (headless === true && isWindowsPlatform) {
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
                    xvfb_args: ['-screen', '0', '1920x1080x24', '-ac'],
                });

                xvfbsession.startSync();
            } catch (err) {
                notice({
                    message: `You are running on a Linux platform but do not have xvfb installed. The browser can be captured. Please install it with the following command\n\nsudo apt-get install xvfb\n\n${err.message}`,
                    type: 'error',
                });
            }
        }

        const chrome = await launch({
            chromePath,
            chromeFlags,
            ...customConfig,
        });

        const chromeSession = await fetch(
            `http://localhost:${chrome.port}/json/version`,
        )
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

        return {
            chromeSession,
            chrome,
            xvfbsession,
        };
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
};
