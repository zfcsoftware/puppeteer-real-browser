import Xvfb from 'xvfb';
import { notice, slugify } from './general.js'
import puppeteer from 'puppeteer'
const __dirname = import.meta.dirname;

import { fileURLToPath } from 'url';
import { dirname } from 'path';

export const closeSession = async ({ xvfbsession }) => {
    if (xvfbsession) {
        try {
            xvfbsession.stopSync();
        } catch (err) { }
    }

    return true
}


export const startSession = ({ args = [], headless = 'auto', customConfig = {}, proxy = {} }) => {
    return new Promise(async (resolve, reject) => {
        try {
            var xvfbsession = null
            var chromePath = customConfig.executablePath || customConfig.chromePath || puppeteer.executablePath()

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

            const chromeFlags = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--window-size=1920,1080'].concat(args);

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
            let dirPath = __dirname
            if (!dirPath || dirPath.length === 0) {
                const __filename = fileURLToPath(import.meta.url);
                dirPath = dirname(__filename);
            }
            const EXTENSION_PATH = `${dirPath}/extension/`;
            chromeFlags.push(`--disable-extensions-except=${EXTENSION_PATH}`)
            chromeFlags.push(`--load-extension=${EXTENSION_PATH}`)

            const browser = await puppeteer.launch({
                headless: false, // Since it is in the testing phase, headless fixed is used and will be updated with the incoming value in the future.
                executablePath: chromePath,
                args: chromeFlags,
                ...customConfig
            })
           
            return resolve({
                browser,
                xvfbsession: xvfbsession
            })

        } catch (err) {
            console.log(err);
            throw new Error(err.message)
        }
    })
}

