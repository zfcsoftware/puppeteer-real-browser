const test = require('node:test');
const assert = require('node:assert');
const { connect } = require('../../lib/cjs/index.js');


const realBrowserOption = {
    args: [],
    turnstile: true,
    headless: false
}

test('DrissionPage Detector', async () => {
    const { page, browser } = await connect(realBrowserOption)
    await page.goto("https://drissionpage.pages.dev/");
    await page.realClick("#detector")
    let result = await page.evaluate(() => { return document.querySelector('#isBot span').textContent.includes("not") ? true : false })
    await browser.close()
    assert.strictEqual(result, true, "DrissionPage Detector test failed!")
})

test('Brotector, a webdriver detector', async () => {
    const { page, browser } = await connect(realBrowserOption)
    await page.goto("https://kaliiiiiiiiii.github.io/brotector/");
    await new Promise(r => setTimeout(r, 3000));
    let result = await page.evaluate(() => { return document.querySelector('#table-keys').getAttribute('bgcolor') })
    await browser.close()
    assert.strictEqual(result === "darkgreen", true, "Brotector, a webdriver detector test failed!")
})

test('Cloudflare WAF', async () => {
    const { page, browser } = await connect(realBrowserOption)
    await page.goto("https://nopecha.com/demo/cloudflare");
    let verify = null
    let startDate = Date.now()
    while (!verify && (Date.now() - startDate) < 30000) {
        verify = await page.evaluate(() => { return document.querySelector('.link_row') ? true : null }).catch(() => null)
        await new Promise(r => setTimeout(r, 1000));
    }
    await browser.close()
    assert.strictEqual(verify === true, true, "Cloudflare WAF test failed!")
})


test('Cloudflare Turnstile', async () => {
    const { page, browser } = await connect(realBrowserOption)
    await page.goto("https://2captcha.com/demo/cloudflare-turnstile");
    await page.waitForSelector('[data-action="demo_action"]')
    let token = null
    let startDate = Date.now()
    while (!token && (Date.now() - startDate) < 30000) {
        token = await page.evaluate(() => {
            let item = document.querySelector('[name="cf-turnstile-response"]').value
            return item && item.length > 20 ? item : null
        })
        await new Promise(r => setTimeout(r, 1000));
    }
    await browser.close()
    // if (token !== null) console.log('Cloudflare Turnstile Token: ' + token);
    assert.strictEqual(token !== null, true, "Cloudflare turnstile test failed!")
})



test('Recaptcha V3 Score (hard)', async () => {
    const { page, browser } = await connect(realBrowserOption)
    await page.goto("https://antcpt.com/score_detector/");
    await page.realClick("button")
    await new Promise(r => setTimeout(r, 5000));
    const score = await page.evaluate(() => {
        return document.querySelector('big').textContent.replace(/[^0-9.]/g, '')
    })
    await browser.close()
    // if (Number(score) >= 0.7) console.log('Recaptcha V3 Score: ' + score);
    assert.strictEqual(Number(score) >= 0.7, true, "Recaptcha V3 Score (hard) should be >=0.7. Score Result: " + score)
})








