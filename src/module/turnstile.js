import { notice, sleep } from './general.js'
const checkStat = ({ page }) => {
    return new Promise(async (resolve, reject) => {
        var st = setTimeout(() => {
            resolve(false)
        }, 3000);
        try {
            const frames = await page.frames();
            let cloudflareFrameExists = frames.find(item => item.url().indexOf('cloudflare') > -1)
            if (cloudflareFrameExists) {
                notice({
                    message: 'Cloudflare Turnstile Detected',
                    type: 'info'
                })
            } else {
                return resolve(false)
            }

            try {
                var frame = page.frames()[0]
                await page.click('iframe')
                frame = frame.childFrames()[0]
                if (frame) {
                    await frame.hover('[type="checkbox"]').catch(err => { })
                    await frame.click('[type="checkbox"]').catch(err => { })
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