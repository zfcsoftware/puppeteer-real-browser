import { connect } from './index.js'


connect({
    turnstile: true,
    fingerprint: true,
    headless: 'auto'
})
    .then(async response => {
        const { page, browser, setTarget } = response

        setInterval(async () => {
            try {
                await page.screenshot({ path: 'example.png' });
            } catch (err) { }
        }, 500);

        page.goto('https://nopecha.com/demo/cloudflare', {
            waitUntil: 'domcontentloaded'
        })
        setTarget({ status: false })
        let page2 = await browser.newPage();
        setTarget({ status: true })
        setInterval(async () => {
            try {
                await page2.screenshot({ path: 'example2.png' });
            } catch (err) { }
        }, 500);

        await page2.goto('https://nopecha.com/demo/cloudflare');
        setTimeout(() => {
            browser.close()
        }, 3000);

    })