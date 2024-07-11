/**
 * @param {{ page: import('puppeteer').Page }} params
 */
export const checkStatNested = async ({ page }) => {
    const elements = await page.$$('.cf-turnstile-wrapper');

    if (elements.length === 0) {
        return false;
    }

    for (const element of elements) {
        try {
            const box = await element.boundingBox();

            const x = box.x + box.width / 2;
            const y = box.y + box.height / 2;

            await page.mouse.click(x, y);
        } catch (err) {}
    }

    return true;
};

/**
 * @param {{ page: import('puppeteer').Page }} params
 * @returns {Promise<boolean>}
 */
export const checkStat = (params) => {
    let interval;

    return Promise.race([
        new Promise((resolve) => {
            interval = setTimeout(resolve, 4000, false);
        }),
        checkStatNested(params).catch((err) => false),
    ]).finally(() => {
        clearTimeout(interval);
    });
};
