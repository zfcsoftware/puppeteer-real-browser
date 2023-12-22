# puppeteer-real-browser
This package prevents Puppeteer from being detected as a bot in services like Cloudflare and allows you to pass captchas without any problems. It behaves like a real browser.
## Warnings
1) The fingerprints of the browsers created with this package are the same.
https://fingerprint.com/demo/
You can check with services like. If you are using it for a service that checks fingerprints, you can get caught.
2) It serves on a port on localhost to act like a real browser. The port must be closed when the process is finished. To close it, simply call browser.close(). In this method, operations to close the port are performed.
3) Currently only available with windows. 

## installation

```bash
npm i puppeteer-real-browser
```
## Include

### commanjs

```js
        const start = async () => {
            var puppeteerRealBrowser = await import('puppeteer-real-browser')
            puppeteerRealBrowser = await puppeteerRealBrowser.puppeteerRealBrowser({})
            var browser = puppeteerRealBrowser.browser
            var page = puppeteerRealBrowser.page
        }
```
### Module

```js
import {puppeteerRealBrowser} from 'puppeteer-real-browser'
```

## Usage

Use without proxy:

```js
import {puppeteerRealBrowser} from 'puppeteer-real-browser'

puppeteerRealBrowser({})
    .then(async response => {
        var browser = response.browser
        var page = response.page
        await page.goto('https://auth0.openai.com/u/email-verification')
    })
```

Use with a proxy without auth information:

```js
import {puppeteerRealBrowser} from 'puppeteer-real-browser'

puppeteerRealBrowser({
    proxy: {
        host: '<proxy-host>',
        port: '<proxy-port>',
    }
})
.then(async response => {
    var browser = response.browser
    var page = response.page
    await page.goto('https://auth0.openai.com/u/email-verification')
})
```
Use with a proxy with auth information:

```js
import {puppeteerRealBrowser} from 'puppeteer-real-browser'

puppeteerRealBrowser({
    proxy: {
        host: '<proxy-host>',
        port: '<proxy-port>',
        username: '<proxy-username>',
        password: '<proxy-password>'
    }
})
.then(async response => {
    var browser = response.browser
    var page = response.page
    await page.goto('https://auth0.openai.com/u/email-verification')
})
```

The function returns you browser and page. Browser and page are created with puppeteer. You can run them with puppeteer functions.