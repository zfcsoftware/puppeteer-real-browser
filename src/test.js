import { connect } from './index.js'

var dataset = {
    success: 0,
    failed: 0
}

console.log("Launching the browser...");
var { page, browser } = await connect({
    headless: 'auto',
    args: [],
    customConfig: {},
    skipTarget: [],
    fingerprint: false,
    turnstile: true,
    connectOption: {}
})
// setInterval(() => { page.screenshot({ path: 'example.png' }).catch(err => { }); }, 1000);
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
            dataset.success++
            console.log('[SUCCESS] WAF test successful.');
        })
        .catch(() => {
            dataset.failed++
            console.log('[ERROR] WAF test failed.');
        })

    return
}

async function checkCaptcha() {
    console.log("Turnstile Captcha test has been initiated...");

    page.goto("https://nopecha.com/captcha/turnstile", {
        waitUntil: 'load'
    }).catch(err => { })
    await page.waitForSelector('a')
    await new Promise((resolve) => { setTimeout(() => { resolve() }, 500) })
    console.log('Navigated to page');
    const token = await page.evaluate(() => {
        var cl = setTimeout(() => {
            resolve(false)
        }, 60000);
        return new Promise((resolve) => {
            const input = document.querySelector('input[name="cf-turnstile-response"]');
            if (input) {
                const observer = new MutationObserver((mutations) => {
                    var mutation = mutations.find((mutation) => { return mutation.type === 'attributes' && mutation.attributeName === 'value' });
                    if (mutation && input.value.length > 3 && !input.value.includes('DUMMY')) {
                        clearInterval(cl)
                        return resolve(input.value)
                    }
                });
                observer.observe(input, { attributes: true, attributeFilter: ['value'] });
            }
        })
    });
    if (token === false) {
        dataset.failed++
        console.log("Failed to receive Turnstile Token. Transaction failed.");
    } else {
        dataset.success++
        console.log("Turnstile Captcha test successful.\n\n" + token);
    }
    return
}

async function recaptchav3() {
    console.log('Starting recaptcha-v3 test...');
    page.goto('https://recaptcha-demo.appspot.com/recaptcha-v3-request-scores.php').catch(err => { })
    await page.waitForSelector('#recaptcha-steps')
    await new Promise((resolve) => { setTimeout(() => { resolve() }, 2000) })
    console.log('Navigated to page');
    const score = await page.evaluate(() => {
        return new Promise((resolve) => {
            var cl = setTimeout(() => {
                resolve(false)
            }, 8000);
            grecaptcha.ready(function () {
                document.querySelector('.step1').classList.remove('hidden');
                grecaptcha.execute('6LdKlZEpAAAAAAOQjzC2v_d36tWxCl6dWsozdSy9', { action: 'examples/v3scores' }).then(function (token) {
                    fetch('/recaptcha-v3-verify.php?action=examples/v3scores&token=' + token).then(function (response) {
                        response.json().then(function (data) {
                            clearInterval(cl)
                            resolve(data)
                        });
                    });
                });
            });

        })
    })
    if (score === false) {
        dataset.failed++
        console.log("Recaptcha-v3 test failed.")
        return
    }
    if (score.score >= 0.7) {
        dataset.success++
        console.log('Recaptcha-v3 test successful.\n' + "Score: " + score.score + "\n" + JSON.stringify(score));
        return
    }
    dataset.failed++
    console.log("Recaptcha-v3 test failed. " + "Score: " + score.score + "\n" + JSON.stringify(score));

    return
}




await checkWaf()
await checkCaptcha()
await recaptchav3()

console.log(`Test completed.\nSuccess: ${dataset.success}\nFailed: ${dataset.failed}`);

await browser.close().catch(err => { })
