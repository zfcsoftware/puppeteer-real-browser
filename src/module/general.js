import clc from 'cli-color'

export const notice = ({ message = '', type = 'warning' }) => {
    switch (type) {
        case 'warning':
            console.log(clc.yellow(`[WARNING] [PUPPETEER-REAL-BROWSER] | ${message}`));
            break;
        case 'error':
            console.log(clc.red(`[ERROR] [PUPPETEER-REAL-BROWSER] | ${message}`));
            break;
        case 'info':
            console.log(clc.blue(`[INFO] [PUPPETEER-REAL-BROWSER] | ${message}`));
            break;
        case 'success':
            console.log(clc.green(`[SUCCESS] [PUPPETEER-REAL-BROWSER] | ${message}`));
            break;
        default:
            console.log(clc.yellow(`[WARNING] [PUPPETEER-REAL-BROWSER] | ${message}`));
            break;
    }
    return true
}


export function slugify(text) {
    text = String(text)
    return text
        .toUpperCase()
        .toLowerCase()
        .normalize('NFD')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');
}

export const sleep = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, ms);
    })
}