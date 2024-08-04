import { startSession, closeSession } from './module/chromium.js'
import { sleep } from './module/general.js'
import { checkStat } from './module/turnstile.js'
import { protectPage } from 'puppeteer-afp'

async function handleNewPage({ page, config = {} }) {
    // fp(page);
    protectPage(page, {
        webRTCProtect: false,
        ...config
    });
    return page
}

export const connect = async ({
    args = [],
    headless = 'auto',
    customConfig = {},
    proxy = {},
    skipTarget = [],
    fingerprint = false,
    turnstile = false,
    connectOption = {},
    fpconfig = {}
}) => {
    let globalTargetStatus = false

    function targetFilter({ target, skipTarget }) {
        if (target.type() === 'page') return true;

        try {
            if (turnstile === true && target._getTargetInfo().type == "iframe") return false
        } catch (err) { }

        if (globalTargetStatus === false) return true

        let response = false

        try {
            response = !!target.url()
            if (skipTarget.find(item => String(target.url()).indexOf(String(item) > -1))) {
                response = true
            }
        } catch (err) { }

        return response;
    }

    const setTarget = ({ status = true }) => {
        globalTargetStatus = status
    }

    customConfig = {
        ...customConfig,
        ...connectOption,
        targetFilter: (target) => targetFilter({ target: target, skipTarget: skipTarget }),
    }
    args.push('--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--window-size=1920,1080');
    const { browser, xvfbsession } = await startSession({
        args,
        headless,
        customConfig,
        proxy
    })

    const [page] = await browser.pages()

    setTarget({ status: true })

    if (proxy && proxy.username && proxy.username.length > 0) {
        await page.authenticate({ username: proxy.username, password: proxy.password });
    }

    let solveStatus = true

    const setSolveStatus = ({ status }) => {
        solveStatus = status
    }

    const autoSolve = async ({ page }) => {
        while (solveStatus) {
            try {
                await sleep(1500)
                await checkStat({ page }).catch(err => { })
            } catch (err) { }
        }
    }

    if (fingerprint === true) {
        handleNewPage({ page, config: fpconfig });
    }
    if (turnstile === true) {
        setSolveStatus({ status: true })
        autoSolve({ page, browser })
    }

    // await page.setUserAgent(chromeSession.agent);

    await page.setViewport({
        width: 1920,
        height: 1080
    });

    browser.on('disconnected', async () => {
        // notice({
        //     message: 'Browser Disconnected',
        //     type: 'info'
        // })

        try { setSolveStatus({ status: false }) } catch (err) { }

        await closeSession({ xvfbsession }).catch(err => { console.log(err.message); })
    });

    browser.on('targetcreated', async target => {
        const newPage = await target.page();

        try {
            // await newPage.setUserAgent(chromeSession.agent);
        } catch (err) {
            // console.log(err.message);
        }

        try {
            await newPage.setViewport({
                width: 1920,
                height: 1080
            });
        } catch (err) {
            // console.log(err.message);
        }

        if (newPage && fingerprint === true) {
            try {
                handleNewPage({ page: newPage, config: fpconfig });
            } catch (err) { }
        }

        if (turnstile === true) {
            autoSolve({ page: newPage })
        }
    });

    return {
        browser,
        page,
        xvfbsession,
        setTarget
    }
}