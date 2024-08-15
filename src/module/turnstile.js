export const checkStat = ({ page }) => {
    return new Promise(async (resolve, reject) => {

        var st = setTimeout(() => {
            clearInterval(st)
            resolve(false)
        }, 4000);
        try {

            const elements = await page.$$('[name="cf-turnstile-response"]');

            if (elements.length <= 0) return resolve(false);

            for (const element of elements) {
                try {
                    const parentElement = await element.evaluateHandle(el => el.parentElement);

                    const box = await parentElement.boundingBox();

                    let x = box.x + 30;
                    let y = box.y + box.height / 2;

                    await page.mouse.click(x, y);
                    try {
                        x += 30
                        await page.mouse.click(x, y);
                    } catch (err) { }
                    try {
                        x += 30
                        await page.mouse.click(x, y);
                    } catch (err) { }
                } catch (err) { }
            }
            clearInterval(st)
            resolve(true)
        } catch (err) {
            // console.log(err);
            clearInterval(st)
            resolve(false)
        }
    })
}

