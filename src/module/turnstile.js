export const checkStatNested = async ({ page }) => {
    let hostname = '';

    try {
        const pageURL = await page.url();

        const url = new URL(pageURL);

        hostname = url.hostname;
    } catch (err) {}

    const frames = await page.frames().filter((frame) => {
        return frame.url().includes('cloudflare') || frame.url().includes(hostname);
    });

    if (frames.length <= 0) {
        return false;
    }

    const elements = await page.$$('iframe');

    for (const element of elements) {
        try {
            const srcProperty = await element.getProperty('src');
            const srcValue = await srcProperty.jsonValue();

            if (srcValue.includes('turnstile')) {
                await element.click();
            }
        } catch (err) {}
    }

    return true;
};

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
