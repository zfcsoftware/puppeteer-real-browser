import { connect } from './index.js'


while (true) {
    console.log('Start of test.js');
    const { page, browser } = await connect({
        headless: 'auto',
        args: [],
        customConfig: {},
        skipTarget: [],
        fingerprint: true,
        turnstile: true,
        connectOption: {},
        tf: true,
    })
    // var cl = setInterval(() => {
    //     page.screenshot({ path: 'example.png' });
    // }, 1000);
    console.log('Connected to browser');
    await page.goto('https://nopecha.com/demo/cloudflare', {
        waitUntil: 'domcontentloaded'
    })
    console.log('Navigated to page');
    await page.waitForSelector('.link_row', {
        timeout: 60000
    })
    // clearInterval(cl)
    await browser.close()
    console.log('End of test.js');
}
