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

<p align="center">
<video src='https://github.com/user-attachments/assets/5dddca09-6941-42e9-9427-5c666632483f'/>
</p>


<p align="center">
  <img src="https://img.shields.io/github/contributors/zfcsoftware/puppeteer-real-browser?color=dark-green" alt="Contributors" />
  <img src="https://img.shields.io/github/forks/zfcsoftware/puppeteer-real-browser?style=social" alt="Forks" />
  <img src="https://img.shields.io/github/stars/zfcsoftware/puppeteer-real-browser?style=social" alt="Stargazers" />
  <img src="https://img.shields.io/github/issues/zfcsoftware/puppeteer-real-browser" alt="Issues" />
  <img src="https://img.shields.io/github/license/zfcsoftware/puppeteer-real-browser" alt="License" />
</p>

## Sponsor

[![Capsolver](data/capsolver.png)](https://www.capsolver.com/?utm_source=github&utm_medium=repo&utm_campaign=scraping&utm_term=puppeteer-real-browser)

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
const { connect } = require('puppeteer-real-browser');

const start = async () => {
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

const { connect } = require("puppeteer-real-browser")

async function test() {

    const { browser, page } = await connect({

        headless: false,

        args: [],

        customConfig: {},

        turnstile: true,

        connectOption: {},

        disableXvfb: false,
        ignoreAllFlags: false
        // proxy:{
        //     host:'<proxy-host>',
        //     port:'<proxy-port>',
        //     username:'<proxy-username>',
        //     password:'<proxy-password>'
        // }

    })
    await page.goto('<url>')

}

test()
```

**headless**: The default value is false. Values such as “new”, true, “shell” can also be sent, but it works most stable when false is used.

**args:** If there is an additional flag you want to add when starting Chromium, you can send it with this string.
Supported flags: https://github.com/GoogleChrome/chrome-launcher/blob/main/docs/chrome-flags-for-tools.md

**customConfig:** https://github.com/GoogleChrome/chrome-launcher The browser is initialized with this library. What you send with this object is added as a direct initialization argument. You should use the initialization values in this repo. You should set the userDataDir option here and if you want to specify a custom chrome path, you should set it with the chromePath value.

**turnstile:** Cloudflare Turnstile automatically clicks on Captchas if set to true

**connectOption:** The variables you send when connecting to chromium created with puppeteer.connect are added

**disableXvfb:** In Linux, when headless is false, a virtual screen is created and the browser is run there.  You can set this value to true if you want to see the browser.

**ignoreAllFlags** If true, all initialization arguments are overridden. This includes the let's get started page that appears on the first load.

## How to Install Puppeteer-extra Plugins?
Some plugins, such as puppeteer-extra-plugin-anonymize-ua, may cause you to be detected. You can use the plugin installation test in the library's test file to see if it will cause you to be detected.

The following is an example of installing a plugin. You can install other plugins in the same way as this example.

```bash
npm i puppeteer-extra-plugin-click-and-wait
```

```js

const test = require('node:test');
const assert = require('node:assert');
const { connect } = require('puppeteer-real-browser');

test('Puppeteer Extra Plugin', async () => {
    const { page, browser } = await connect({
        args: ["--start-maximized"],
        turnstile: true,
        headless: false,
        // disableXvfb: true,
        customConfig: {},
        connectOption: {
            defaultViewport: null
        },
        plugins: [
            require('puppeteer-extra-plugin-click-and-wait')()
        ]
    })
    await page.goto("https://google.com", { waitUntil: "domcontentloaded" })
    await page.clickAndWaitForNavigation('body')
    await browser.close()
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

This library is completely open source and is constantly being updated. Please star this repo to support this project. Starring and supporting the project will ensure that it receives updates. If you want to support it further, you can consider sponsoring me (https://github.com/sponsors/zfcsoftware)


## Quick Questions and Answers

### I Cannot Access Functions in Window Object What Should I Do?

This problem is probably caused by the runtime being closed by the rebrowser used. 
https://github.com/zfcsoftware/puppeteer-real-browser/tree/access-window
I created a branch for this. You can access the value you want by adding javascript to the page source with puppeteer-intercept-and-modify-requests as done in success.js. If you know about the Chrome plugin, you can also use it.

### https://antcpt.com/score_detector/ Recaptcha v3 detects me, what should I do?

If you add the flag “--user-data-dir=/path/to/user/data” to the args variable, this will fix the problem. In the future this will be automated but for now it needs to be added manually.

### page.setViewport method is not working, what should I do?
As with the initialization arguments in the test module, you can set the defaultViewport in connectOption. If you set null, it will take up as much space as the width of the Browser.

### Does the library have any known detection problems? 
using puppeteer-core patched with rebrowser. Tested with the challenging sites in the test file in headless false mode and passed with flying colors. The only known issue is that the mouse screeenX does not match the mouse position. This has been patched in the library. 

The ghost-cursor is included in the library. (https://github.com/zfcsoftware/puppeteer-real-browser/blob/2a5fba37a85c15625fb3c8d1f7cf8dcb109b9492/lib/cjs/module/pageController.js#L54) You can use ghost-cursor with page.realCursor. page.click It is recommended to use page.realClick instead of page.click.

### What Makes This Library Special?
This library does not have any amazing features. I apply patches created to avoid current bot detection systems, and it is the people who make these patches who should be thanked. This library is just to make your work easier and keep you up to date. There are my contributions in it, but the main contributors are under the “thanks” heading. Please star those repos and support the authors. Thank you.

## License

Distributed under the MIT License. See [LICENSE](https://github.com/zfcsoftware/puppeteer-real-browser/blob/main/LICENSE.md) for more information.

## Thank You

**Contributions to the current version**

* **rebrowser™** - [rebrowser™](https://github.com/rebrowser) - *Created a patch pack for Runtime, which left many traces behind. Since Runtime was not used, most problems were solved. TargetFilter, which was used in the past and caused many problems, was switched to this patch. The Puppeteer-core library was patched and added to this repo. A lot of good bot detection systems are not caught thanks to rebrowser. Please star the rebrowser repo. Thank you. (https://github.com/rebrowser/rebrowser-patches)*
* 
* **Skill Issue™** - [TheFalloutOf76](https://github.com/TheFalloutOf76) - *He realized that mouse movements could not be simulated accurately and created a solution for this. His solution is used in this library. (https://github.com/TheFalloutOf76/CDP-bug-MouseEvent-.screenX-.screenY-patcher)*
  

**For older versions**

* **Jimmy Laurent** - [Jimmy Laurent](https://github.com/JimmyLaurent) - *Inspired by cloudflare-scraper library*
* **CrispyyBaconx** - [CrispyyBaconx](https://github.com/CrispyyBaconx) - *Contributed to converting this library to Typescript*
* **Pavle Aleksic** - [pavlealeksic](https://github.com/pavlealeksic) - *We change the fingerprint with the puppeteer-afp library.*

## Disclaimer of Liability

No responsibility is accepted for the use of this software. This software is intended for educational and informational purposes only. Users should use this software at their own risk. The developer cannot be held liable for any damages that may result from the use of this software.

This software is not intended to bypass Cloudflare Captcha or any other security measure. It must not be used for malicious purposes. Malicious use may result in legal consequences.

This software is not officially endorsed or guaranteed. Users can visit the GitHub page to report bugs or contribute to the software, but they are not entitled to make any claims or request service fixes.

By using this software, you agree to this disclaimer.