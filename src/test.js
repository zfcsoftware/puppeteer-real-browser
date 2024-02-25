import { connect } from './index.js'


connect({
    turnstile: true,
    fingerprint: true,
    headless: 'auto'
})
    .then(async response => {
        const { page, browser } = response
        setInterval(async () => {
            try {
                await page.screenshot({ path: 'example.png' });
            } catch (err) { }
        }, 500);

        page.goto('https://nopecha.com/demo/cloudflare', {
            waitUntil: 'domcontentloaded'
        })

    })