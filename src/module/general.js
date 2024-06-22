import pc from 'picocolors'

export const notice = ({ message = '', type = 'warning' }) => {
    switch (type) {
        case 'warning':
            console.log(pc.yellow(`[WARNING] [PUPPETEER-REAL-BROWSER] | ${message}`));
            break;
        case 'error':
            console.log(pc.red(`[ERROR] [PUPPETEER-REAL-BROWSER] | ${message}`));
            break;
        case 'info':
            console.log(pc.blue(`[INFO] [PUPPETEER-REAL-BROWSER] | ${message}`));
            break;
        case 'success':
            console.log(pc.green(`[SUCCESS] [PUPPETEER-REAL-BROWSER] | ${message}`));
            break;
        default:
            console.log(pc.yellow(`[WARNING] [PUPPETEER-REAL-BROWSER] | ${message}`));
            break;
    }
}

export function slugify(text) {
    return String(text)
        .toUpperCase()
        .toLowerCase()
        .normalize('NFD')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');
}

export const sleep = (ms) => (
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
)
