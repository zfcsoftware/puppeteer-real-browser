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
  <iframe width="560" height="315" src="https://www.youtube.com/embed/v2faTBy9uI0" frameborder="0" allowfullscreen></iframe>
</p>


<p align="center">
  <img src="https://img.shields.io/github/contributors/zfcsoftware/puppeteer-real-browser?color=dark-green" alt="Contributors" />
  <img src="https://img.shields.io/github/forks/zfcsoftware/puppeteer-real-browser?style=social" alt="Forks" />
  <img src="https://img.shields.io/github/stars/zfcsoftware/puppeteer-real-browser?style=social" alt="Stargazers" />
  <img src="https://img.shields.io/github/issues/zfcsoftware/puppeteer-real-browser" alt="Issues" />
  <img src="https://img.shields.io/github/license/zfcsoftware/puppeteer-real-browser" alt="License" />
</p>



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
    const { connect } = require('puppeteer-real-browser');
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

    const { browser, page } = connect({

        headless: false,

        args: [],

        customConfig: {},

        turnstile: true,

        connectOption: {},

        disableXvfb: false,

        // proxy:{
        //     host:'<proxy-host>',
        //     port:'<proxy-port>',
        //     username:'<proxy-username>',
        //     password:'<proxy-password>'
        // }

    })
    await page.goto('<url>')

}

```

**headless**: The default value is false. Values such as “new”, true, “shell” can also be sent, but it works most stable when false is used.

**args:** If there is an additional flag you want to add when starting Chromium, you can send it with this string.

**customConfig:** When launch is executed, the variables you send in be object are added. For example, you can specify the browser path with executablePath.

**turnstile:** Cloudflare Turnstile automatically clicks on Captchas if set to true

**connectOption:** The variables you send when connecting to chromium created with puppeteer.connect are added

**disableXvfb:** In Linux, when headless is false, a virtual screen is created and the browser is run there.  You can set this value to true if you want to see the browser.

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