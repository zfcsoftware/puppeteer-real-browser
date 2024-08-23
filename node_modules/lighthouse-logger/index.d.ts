export default Log;
declare class Log {
    static _logToStdErr(title: any, argsArray: any): void;
    /**
     * @param {string} title
     */
    static loggerfn(title: string): any;
    /**
     * @param {string} level
     */
    static setLevel(level: string): void;
    /**
     * A simple formatting utility for event logging.
     * @param {string} prefix
     * @param {!Object} data A JSON-serializable object of event data to log.
     * @param {string=} level Optional logging level. Defaults to 'log'.
     */
    static formatProtocol(prefix: string, data: any, level?: string | undefined): void;
    /**
     * @return {boolean}
     */
    static isVerbose(): boolean;
    /**
     * @param {{msg: string, id: string, args?: any[]}} status
     * @param {string} level
     */
    static time({ msg, id, args }: {
        msg: string;
        id: string;
        args?: any[];
    }, level?: string): void;
    /**
     * @param {{msg: string, id: string, args?: any[]}} status
     * @param {string} level
     */
    static timeEnd({ msg, id, args }: {
        msg: string;
        id: string;
        args?: any[];
    }, level?: string): void;
    /**
     * @param {string} title
     * @param {...any} args
     */
    static log(title: string, ...args: any[]): void;
    /**
     * @param {string} title
     * @param {...any} args
     */
    static warn(title: string, ...args: any[]): void;
    /**
     * @param {string} title
     * @param {...any} args
     */
    static error(title: string, ...args: any[]): void;
    /**
     * @param {string} title
     * @param {...any} args
     */
    static verbose(title: string, ...args: any[]): void;
    /**
     * Add surrounding escape sequences to turn a string green when logged.
     * @param {string} str
     * @return {string}
     */
    static greenify(str: string): string;
    /**
     * Add surrounding escape sequences to turn a string red when logged.
     * @param {string} str
     * @return {string}
     */
    static redify(str: string): string;
    static get green(): string;
    static get red(): string;
    static get yellow(): string;
    static get purple(): string;
    static get reset(): string;
    static get bold(): string;
    static get dim(): string;
    static get tick(): "√" | "✓";
    static get cross(): "×" | "✘";
    static get whiteSmallSquare(): "·" | "▫";
    static get heavyHorizontal(): "─" | "━";
    static get heavyVertical(): "│ " | "┃ ";
    static get heavyUpAndRight(): "└" | "┗";
    static get heavyVerticalAndRight(): "├" | "┣";
    static get heavyDownAndHorizontal(): "┬" | "┳";
    static get doubleLightHorizontal(): string;
}
declare namespace Log {
    const events: Emitter;
    /**
     * @return {PerformanceEntry[]}
     */
    function takeTimeEntries(): PerformanceEntry[];
    /**
     * @return {PerformanceEntry[]}
     */
    function getTimeEntries(): PerformanceEntry[];
}
declare class Emitter extends EventEmitter {
    /**
     * Fires off all status updates. Listen with
     * `require('lib/log').events.addListener('status', callback)`
     * @param {string} title
     * @param {!Array<*>} argsArray
     */
    issueStatus(title: string, argsArray: Array<any>): void;
    /**
     * Fires off all warnings. Listen with
     * `require('lib/log').events.addListener('warning', callback)`
     * @param {string} title
     * @param {!Array<*>} argsArray
     */
    issueWarning(title: string, argsArray: Array<any>): void;
}
import { EventEmitter } from 'events';
