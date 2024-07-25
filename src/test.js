import { connect } from './index.js'
console.log("Launching the browser...");
const { page, browser } = await connect({
    headless: 'auto',
    args: [],
    customConfig: {},
    skipTarget: [],
    fingerprint: false,
    turnstile: true,
    connectOption: {}
})
setInterval(() => { page.screenshot({ path: 'example.png' }).catch(err => { }); }, 1000);
console.log("The browser is launched...");
async function checkWaf() {
    console.log('WAF testing started');
    await page.goto('https://nopecha.com/demo/cloudflare', {
        waitUntil: 'domcontentloaded'
    })

    console.log('Navigated to page');
    await page.waitForSelector('.link_row', {
        timeout: 60000
    })
        .then(() => {
            console.log('[SUCCESS] WAF test successful.');
        })
        .catch(() => {
            console.log('[ERROR] WAF test failed.');
        })

    return
}

async function checkCaptcha() {
    console.log("Turnstile Captcha test has been initiated...");

    page.goto("https://nopecha.com/captcha/turnstile", {
        waitUntil: 'load'
    })
    await page.waitForSelector('a')
    await new Promise((resolve) => { setTimeout(() => { resolve() }, 500) })
    console.log('Navigated to page');
    const token = await page.evaluate(() => {
        setTimeout(() => {
            resolve(false)
        }, 15000);
        return new Promise((resolve) => {
            const input = document.querySelector('input[name="cf-turnstile-response"]');
            if (input) {
                const observer = new MutationObserver((mutations) => {
                    var mutation = mutations.find((mutation) => { return mutation.type === 'attributes' && mutation.attributeName === 'value' });
                    if (mutation && input.value.length > 3 && !input.value.includes('DUMMY')) return resolve(input.value)
                });
                observer.observe(input, { attributes: true, attributeFilter: ['value'] });
            }
        })
    });
    if (token === false) {
        console.log("Failed to receive Turnstile Token. Transaction failed.");
    } else {
        console.log("Turnstile Captcha test successful.\n\n" + token);
    }
    return
}




await checkWaf()
await checkCaptcha()





