import src from 'puppeteer-afp/src/index.js';
import { notice, sleep } from './general.js'
const checkStat = ({ page }) => {
    return new Promise(async (resolve, reject) => {
        var st = setTimeout(() => {
            clearInterval(st)
            resolve(false)
        }, 4000);
        try {
            var domain = '';
            try {
                const pageURL = await page.url();
                const url = new URL(pageURL);
                domain = url.hostname;
            } catch (err) { }
            const frames = await page.frames().filter(frame => {
                return frame.url().includes('cloudflare') || frame.url().includes(domain)
            });
            if (frames.length <= 0) {
                clearInterval(st)
                return resolve(false)
            }
            const elements = await page.$$('iframe');
            for (const element of elements) {
                try {
                    const srcProperty = await element.getProperty('src');
                    const srcValue = await srcProperty.jsonValue();
                    if (srcValue.includes('turnstile')) {
                        await element.click();
                    }
                } catch (err) { }
            }
            clearInterval(st)
            resolve(true)
        } catch (err) {
            // console.log(err);
            clearInterval(st)
            resolve(false)
        }
    })
}


var solve_status = true

export const setSolveStatus = ({ status }) => {
    solve_status = status
}

export const autoSolve = ({ page, browser }) => {
    return new Promise(async (resolve, reject) => {
        while (solve_status) {
            try {
                await sleep(1500)
                await checkStat({ page: page }).catch(err => { })
            } catch (err) { }
        }
        resolve()
    })
}