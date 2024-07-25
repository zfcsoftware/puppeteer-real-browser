<br/>
<p align="center">
  <a href="https://github.com/zfcsoftware/puppeteer-real-browser">
    <img src="https://github.com/zfcsoftware/puppeteer-real-browser/assets/123484092/cc8b5fb9-504a-4fd3-97f6-a51990bb4303" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Puppeteer Real Browser</h3>

  <p align="center">
    This package prevents Puppeteer from being detected as a bot in services like Cloudflare and allows you to pass captchas without any problems. It behaves like a real browser.
    <br/>
    <br/>
    If you are only interested in Cloudflare WAF, please check this repo:<br/> https://github.com/zfcsoftware/cf-clearance-scraper
  </p>
</p>

https://github.com/zfcsoftware/puppeteer-real-browser/assets/123484092/bd8ca2b0-a661-4248-9bf5-3ef12e3f5801

 ![Contributors](https://img.shields.io/github/contributors/zfcsoftware/puppeteer-real-browser?color=dark-green) ![Forks](https://img.shields.io/github/forks/zfcsoftware/puppeteer-real-browser?style=social) ![Stargazers](https://img.shields.io/github/stars/zfcsoftware/puppeteer-real-browser?style=social) ![Issues](https://img.shields.io/github/issues/zfcsoftware/puppeteer-real-browser) ![License](https://img.shields.io/github/license/zfcsoftware/puppeteer-real-browser) 


## Installation

If you are using a Linux operating system, xvfb must be installed for the library to work correctly.


```bash
npm i puppeteer-real-browser
```

if you are using linux:

```bash
sudo apt-get install xvfb
```



## Include

### CommonJS

```js

const start = async () => {
    var { connect } = await import('puppeteer-real-browser')
    const { page, browser } = await connect({})
}

```
### Module

```js

import { connect } from 'puppeteer-real-browser'

const { page, browser } = await connect({})

```

## Usage


```js
import { connect } from 'puppeteer-real-browser'

connect({

    headless: 'auto',

    args: [],

    customConfig: {},

    skipTarget: [],

    fingerprint: false,

    turnstile: true,

    connectOption: {},

    fpconfig: {},

    // proxy:{
    //     host:'<proxy-host>',
    //     port:'<proxy-port>',
    //     username:'<proxy-username>',
    //     password:'<proxy-password>'
    // }

})
.then(async response => {
    const {browser, page} = response
    await page.goto('<url>')
    
})
.catch(error=>{
    console.log(error.message)
})

```

**headless**: auto can take the values true and false. If auto is set, it uses the option that is stable on the operating system in use.

**args:** If there is an additional flag you want to add when starting Chromium, you can send it with this string.

**customConfig:** When launch is executed, the variables you send in be onje are added. For example, you can specify the browser path with executablePath.

**skipTarget:** It uses target filter to avoid detection. You can send the targets you want to allow. This feature is in beta. Its use is not recommended.

**fingerprint:** If set to true, it injects a unique fingerprint ID into the page every time the browser is launched and prevents you from being caught. **Not recommended if not mandatory. May cause detection. runs the puppeteer-afp library.**

**turnstile:** Cloudflare Turnstile automatically clicks on Captchas if set to true

**connectOption:** The variables you send when connecting to chromium created with puppeteer.connect are added
**fpconfig:** This setting allows you to reuse fingerprint values that you have previously saved in the puppeteer-afp library. Please refer to the puppeteer-afp library documentation for details.

For example, if you want to open a 2nd page, you can use this library as follows.

```js

import { connect } from 'puppeteer-real-browser'

connect({
    turnstile: true
})
.then(async response => {
        const { page, browser, setTarget } = response

        page.goto('https://nopecha.com/demo/cloudflare', {
            waitUntil: 'domcontentloaded'
        })

        setTarget({ status: false })

        let page2 = await browser.newPage();

        setTarget({ status: true })

        await page2.goto('https://nopecha.com/demo/cloudflare');
})

```


## Docker

You can use the Dockerfile file in the main directory to use this library with docker. It has been tested with docker on Ubuntu server operating systems.

To run a test, you can follow these steps


```bash
git clone https://github.com/zfcsoftware/puppeteer-real-browser
```

```bash
cd puppeteer-real-browser
```

```bash
docker build -t puppeteer-real-browser-project .
```


```bash
docker run puppeteer-real-browser-project
```

## Support Us

This library is completely open source and is constantly being updated. Please star this repo to keep these updates coming. Starring the repo will support us to improve it.

## License

Distributed under the MIT License. See [LICENSE](https://github.com/zfcsoftware/puppeteer-real-browser/blob/main/LICENSE.md) for more information.

## Thank You

* **Skill Issue™** - [TheFalloutOf76](https://github.com/TheFalloutOf76) - *The library had stopped working on Linux servers and proxies with high spam scores. Thanks to the plugin he developed, this problem was solved. Thanks to him *

* **Jimmy Laurent** - [Jimmy Laurent](https://github.com/JimmyLaurent) - *Inspired by cloudflare-scraper library*
* **CrispyyBaconx** - [CrispyyBaconx](https://github.com/CrispyyBaconx) - *Contributed to converting this library to Typescript*
* **Pavle Aleksic** - [pavlealeksic](https://github.com/pavlealeksic) - *We change the fingerprint with the puppeteer-afp library.*

## Disclaimer of Liability

No responsibility is accepted for the use of this software. This software is intended for educational and informational purposes only. Users should use this software at their own risk. The developer cannot be held liable for any damages that may result from the use of this software.

This software is not intended to bypass Cloudflare Captcha or any other security measure. It must not be used for malicious purposes. Malicious use may result in legal consequences.

This software is not officially endorsed or guaranteed. Users can visit the GitHub page to report bugs or contribute to the software, but they are not entitled to make any claims or request service fixes.

By using this software, you agree to this disclaimer.