import { createCursor } from 'ghost-cursor';
import { checkTurnstile } from './turnstile.mjs';
import kill from 'tree-kill';

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function pageController({ browser, page, proxy, turnstile, xvfbsession, pid, plugins, killProcess = false, chrome }) {

    let solveStatus = turnstile

    page.on('close', () => {
        solveStatus = false
    });


    browser.on('disconnected', async () => {
        solveStatus = false
        if (killProcess === true) {
            if (xvfbsession) try { xvfbsession.stopSync() } catch (err) { }
            if (chrome) try { chrome.kill() } catch (err) { console.log(err); }
            if (pid) try { kill(pid, 'SIGKILL', () => { }) } catch (err) { }
        }
    });

    async function turnstileSolver() {
        while (solveStatus) {
            await checkTurnstile({ page }).catch(() => { });
            await new Promise(r => setTimeout(r, 1000));
        }
        return
    }

    turnstileSolver()

    if (proxy.username && proxy.password) await page.authenticate({ username: proxy.username, password: proxy.password });

    if (plugins.length > 0) {
        for (const plugin of plugins) {
            plugin.onPageCreated(page)
        }
    }

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(MouseEvent.prototype, 'screenX', {
            get: function () {
                return this.clientX + window.screenX;
            }
        });

        Object.defineProperty(MouseEvent.prototype, 'screenY', {
            get: function () {
                return this.clientY + window.screenY;
            }
        });

    });

    const cursor = createCursor(page);
    page.realCursor = cursor
    page.realClick = cursor.click
    return page
}