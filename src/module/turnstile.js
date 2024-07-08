export const checkStat = ({ page }) => {
    return new Promise(async (resolve, reject) => {

        var st = setTimeout(() => {
            clearInterval(st)
            resolve(false)
        }, 4000);
        try {

            const elements = await page.$$('.cf-turnstile-wrapper');

            if (elements.length <= 0) return resolve(false);

            for (const element of elements) {
                try {
                    const box = await element.boundingBox();

                    const x = box.x + box.width / 2;
                    const y = box.y + box.height / 2;

                    await page.mouse.click(x, y);
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

