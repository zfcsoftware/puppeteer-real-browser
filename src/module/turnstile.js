import { notice, sleep } from './general.js'
const checkStat = ({ page }) => {
    return new Promise(async (resolve, reject) => {
        var st = setTimeout(() => {
            resolve(false)
        }, 3000);
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
                return resolve(false)
            }
            const elements = await page.$$('iframe');
            for (const element of elements) {
                await element.click();
            }
            try {
                for (var item of frames) {
                    try {
                        await item.click('body').catch(err => { })
                        var active_frame = item.childFrames()[0]
                        await active_frame.click('[type="checkbox"]').catch(err => { })
                    } catch (err) {
                        // console.log(err);
                    }

                }
            } catch (err) { }

            clearInterval(st)
            resolve(true)
        } catch (err) {
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
                await sleep(1000)
                await checkStat({ page: page }).catch(err => { })
            } catch (err) { }
        }
        resolve()
    })
}