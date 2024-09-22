const { connect } = require('puppeteer-real-browser');
const test = require('node:test');
const assert = require('node:assert');

test('Test Window Function', async () => {

    const { RequestInterceptionManager } = await import('puppeteer-intercept-and-modify-requests')


    const { page, browser } = await connect({
        args: ["--start-maximized"],
        turnstile: true,
        headless: false,
        // disableXvfb: true,
        connectOption: { defaultViewport: null }
    })
    const client = await page.target().createCDPSession()
    const interceptManager = new RequestInterceptionManager(client)
    await interceptManager.intercept(
        {
            urlPattern: `https://turnstile.zeroclover.io/`,
            resourceType: 'Document',
            modifyResponse({ body }) {
                return {
                    body: body.replace('</body>', `<script>
                            async function win(params) {
                                let checkToken = null
                                while (!checkToken) {
                                    try{checkToken = window.turnstile.getResponse()}catch{}
                                    await new Promise(resolve => setTimeout(resolve, 1000))
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

    await page.goto('https://turnstile.zeroclover.io/', {
        waitUntil: 'networkidle0'
    })

    let token = null
    let repeat = 0
    while (!token && repeat < 30) {
        token = await page.evaluate(() => {
            try { return document.querySelector('.zfc-token').value } catch (e) { return false }
        })
        await new Promise(resolve => setTimeout(resolve, 500))
        repeat++
    }
    console.log(token);
    await browser.close()
    assert((token && token.length > 10), 'Unable to access function in Window object')
})
