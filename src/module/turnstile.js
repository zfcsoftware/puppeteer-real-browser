/**
 * @param {{ page: import('puppeteer').Page }} params
 */
const checkStatNested = async ({ page }) => {
    try {
        const elements = await page.$$('[name="cf-turnstile-response"]');

        if (elements.length <= 0) return false;

        for (const element of elements) {
            try {
                const parentElement = await element.evaluateHandle(el => el.parentElement);

                const box = await parentElement.boundingBox();

                const x = box.x + box.width / 2;
                const y = box.y + box.height / 2;

                await page.mouse.click(x, y);
            } catch (err) { }
        }
        return true
    } catch (err) {
        // console.log(err);
        return false
    }
}

/**
 * @param {{ page: import('puppeteer').Page }} params
 * @returns {Promise<boolean>}
 */
export const checkStat = async (params) => {
    let interval;

    return Promise.race([
        new Promise((resolve) => {
            interval = setTimeout(resolve, 4000, false);
        }),
        checkStatNested(params).catch((err) => false),
    ]).finally(() => {
        clearTimeout(interval);
    });
}