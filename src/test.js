import { connect } from './index.js'

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
console.log('Connected to browser');
page.goto('https://nopecha.com/demo/cloudflare', {
    waitUntil: 'domcontentloaded'
})
console.log('Navigated to page');
await page.waitForSelector('.link_row', {
    timeout: 60000
})
console.log('End of test.js');