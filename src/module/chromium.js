import { launch } from 'chrome-launcher';
import chromium from '@sparticuz/chromium'
import CDP from 'chrome-remote-interface';
import axios from 'axios'
import Xvfb from 'xvfb';
import { notice, slugify } from './general.js'

export const closeSession = async ({ xvfbsession,  chrome }) => {
    if (xvfbsession) {
        try {
            xvfbsession.stopSync();
        } catch (err) { }
    }
    if (chrome) {
        try {
            await chrome.kill();
        } catch (err) { }
    }
    return true
}


export const startSession = ({ args = [], headless = 'auto', customConfig = {}, proxy = {} }) => {
    return new Promise(async (resolve, reject) => {
        try {
            var xvfbsession = null
            var chromePath = customConfig.executablePath || customConfig.chromePath || chromium.path;

            if (slugify(process.platform).includes('linux') && headless === false) {
                notice({
                    message: 'This library is stable with headless: true in linuxt environment and headless: false in Windows environment. Please send headless: \'auto\' for the library to work efficiently.',
                    type: 'error'
                })
            } else if (slugify(process.platform).includes('win') && headless === true) {
                notice({
                    message: 'This library is stable with headless: true in linuxt environment and headless: false in Windows environment. Please send headless: \'auto\' for the library to work efficiently.',
                    type: 'error'
                })
            }

            if (headless === 'auto') {
                headless = slugify(process.platform).includes('linux') ? true : false
            }

            const chromeFlags = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled','--window-size=1920,1080'].concat(args);

            if (headless === true) {
                slugify(process.platform).includes('win') ? chromeFlags.push('--headless=new') : ''
            }

            if (proxy && proxy.host && proxy.host.length > 0) {
                chromeFlags.push(`--proxy-server=${proxy.host}:${proxy.port}`);
            }

            if (process.platform === 'linux') {
                try {
                    var xvfbsession = new Xvfb({
                        silent: true,
                        xvfb_args: ['-screen', '0', '1920x1080x24', '-ac']
                    });
                    xvfbsession.startSync();
                } catch (err) {
                    notice({
                        message: 'You are running on a Linux platform but do not have xvfb installed. The browser can be captured. Please install it with the following command\n\nsudo apt-get install xvfb\n\n' + err.message,
                        type: 'error'
                    })
                }
            }

            var chrome = await launch({
                chromePath,
                chromeFlags,
                ...customConfig
            });

            var chromeSession = await axios.get('http://localhost:' + chrome.port + '/json/version')
                .then(response => {
                    response = response.data
                    return {
                        browserWSEndpoint: response.webSocketDebuggerUrl,
                        agent: response['User-Agent']
                    }
                })
                .catch(err => {
                    throw new Error(err.message)
                })
            return resolve({
                chromeSession: chromeSession,
                chrome: chrome,
                xvfbsession: xvfbsession
            })

        } catch (err) {
            console.log(err);
            throw new Error(err.message)
        }
    })
}

