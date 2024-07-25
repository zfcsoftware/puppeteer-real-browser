
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
Object.defineProperty(MouseEvent.prototype, 'screenX', { value: getRandomInt(1000, 2000) })

Object.defineProperty(MouseEvent.prototype, 'screenY', { value: getRandomInt(100, 500) })

