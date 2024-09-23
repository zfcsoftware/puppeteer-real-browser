const { connect } = require('puppeteer-real-browser');
const test = require('node:test');
const assert = require('node:assert');

test('Test Window Function', async () => {

    const { RequestInterceptionManager } = await import('puppeteer-intercept-and-modify-requests')


    const { page, browser } = await connect({
        args: ["--start-maximized"],
        turnstile: true,
        headless: false,
        disableXvfb: true,
        connectOption: { defaultViewport: null }
    })
    const client = await page.target().createCDPSession()
    const interceptManager = new RequestInterceptionManager(client)
    await interceptManager.intercept(
        {
            urlPattern: `https://nuxt.com/docs/api/nuxt-config`,
            resourceType: 'Document',
            modifyResponse({ body }) {
                return {
                    body: body.replace('</body>', `<script>
                            async function win(params) {
                                let checkToken = null
                                while (!checkToken) {
                                    try{checkToken = window.__NUXT__.config.app.buildId}catch{}
                                    await new Promise(resolve => setTimeout(resolve, 500))
                                }
                               var c = document.createElement('input')
                                c.classList = 'zfc-token'
                                c.value = checkToken
                                document.body.appendChild(c)
                            }

                            win()
                        </script></body>`),
                }
            },
        }
    )

    await page.goto('https://nuxt.com/docs/api/nuxt-config', {
        waitUntil: 'networkidle0'
    })

    await page.waitForSelector('.zfc-token')
    const result = await page.evaluate(() => {
        return document.querySelector('.zfc-token').value
    })
    console.log('Build Id: ', result);
    await browser.close()
    assert((result && result.length > 0), 'Unable to access function in Window object')
})
