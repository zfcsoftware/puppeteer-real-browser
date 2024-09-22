const { connect } = require('puppeteer-real-browser');
const test = require('node:test');
const assert = require('node:assert');

test('Test Window Function', async () => {
    const { page, browser } = await connect({
        args: ["--start-maximized"],
        turnstile: true,
        headless: false,
        disableXvfb: true,
        connectOption: { defaultViewport: null }
    })

    await page.goto('https://turnstile.zeroclover.io/', {
        waitUntil: 'networkidle0'
    })
    await new Promise(resolve => setTimeout(resolve, 5000))
    const token = await page.evaluate(() => {
        try { return window.turnstile.getResponse() } catch (e) { return false }
    })
    await browser.close()
    assert(token == undefined, 'Unable to access function in Window object')
})