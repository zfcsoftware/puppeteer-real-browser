/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';
import { join } from 'path';
import childProcess from 'child_process';
import { mkdirSync } from 'fs';
import isWsl from 'is-wsl';
export function defaults(val, def) {
    return typeof val === 'undefined' ? def : val;
}
export async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
export class LauncherError extends Error {
    constructor(message = 'Unexpected error', code) {
        super();
        this.message = message;
        this.code = code;
        this.stack = new Error().stack;
        return this;
    }
}
export class ChromePathNotSetError extends LauncherError {
    constructor() {
        super(...arguments);
        this.message = 'The CHROME_PATH environment variable must be set to a Chrome/Chromium executable no older than Chrome stable.';
        this.code = "ERR_LAUNCHER_PATH_NOT_SET" /* ERR_LAUNCHER_PATH_NOT_SET */;
    }
}
export class InvalidUserDataDirectoryError extends LauncherError {
    constructor() {
        super(...arguments);
        this.message = 'userDataDir must be false or a path.';
        this.code = "ERR_LAUNCHER_INVALID_USER_DATA_DIRECTORY" /* ERR_LAUNCHER_INVALID_USER_DATA_DIRECTORY */;
    }
}
export class UnsupportedPlatformError extends LauncherError {
    constructor() {
        super(...arguments);
        this.message = `Platform ${getPlatform()} is not supported.`;
        this.code = "ERR_LAUNCHER_UNSUPPORTED_PLATFORM" /* ERR_LAUNCHER_UNSUPPORTED_PLATFORM */;
    }
}
export class ChromeNotInstalledError extends LauncherError {
    constructor() {
        super(...arguments);
        this.message = 'No Chrome installations found.';
        this.code = "ERR_LAUNCHER_NOT_INSTALLED" /* ERR_LAUNCHER_NOT_INSTALLED */;
    }
}
export function getPlatform() {
    return isWsl ? 'wsl' : process.platform;
}
export function makeTmpDir() {
    switch (getPlatform()) {
        case 'darwin':
        case 'linux':
            return makeUnixTmpDir();
        case 'wsl':
            // We populate the user's Windows temp dir so the folder is correctly created later
            process.env.TEMP = getWSLLocalAppDataPath(`${process.env.PATH}`);
        case 'win32':
            return makeWin32TmpDir();
        default:
            throw new UnsupportedPlatformError();
    }
}
function toWinDirFormat(dir = '') {
    const results = /\/mnt\/([a-z])\//.exec(dir);
    if (!results) {
        return dir;
    }
    const driveLetter = results[1];
    return dir.replace(`/mnt/${driveLetter}/`, `${driveLetter.toUpperCase()}:\\`)
        .replace(/\//g, '\\');
}
export function toWin32Path(dir = '') {
    if (/[a-z]:\\/iu.test(dir)) {
        return dir;
    }
    try {
        return childProcess.execFileSync('wslpath', ['-w', dir]).toString().trim();
    }
    catch {
        return toWinDirFormat(dir);
    }
}
export function toWSLPath(dir, fallback) {
    try {
        return childProcess.execFileSync('wslpath', ['-u', dir]).toString().trim();
    }
    catch {
        return fallback;
    }
}
function getLocalAppDataPath(path) {
    const userRegExp = /\/mnt\/([a-z])\/Users\/([^\/:]+)\/AppData\//;
    const results = userRegExp.exec(path) || [];
    return `/mnt/${results[1]}/Users/${results[2]}/AppData/Local`;
}
export function getWSLLocalAppDataPath(path) {
    const userRegExp = /\/([a-z])\/Users\/([^\/:]+)\/AppData\//;
    const results = userRegExp.exec(path) || [];
    return toWSLPath(`${results[1]}:\\Users\\${results[2]}\\AppData\\Local`, getLocalAppDataPath(path));
}
function makeUnixTmpDir() {
    return childProcess.execSync('mktemp -d -t lighthouse.XXXXXXX').toString().trim();
}
function makeWin32TmpDir() {
    const winTmpPath = process.env.TEMP || process.env.TMP ||
        (process.env.SystemRoot || process.env.windir) + '\\temp';
    const randomNumber = Math.floor(Math.random() * 9e7 + 1e7);
    const tmpdir = join(winTmpPath, 'lighthouse.' + randomNumber);
    mkdirSync(tmpdir, { recursive: true });
    return tmpdir;
}
export { childProcess as _childProcessForTesting };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUNILFlBQVksQ0FBQztBQUViLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDMUIsT0FBTyxZQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxJQUFJLENBQUM7QUFDN0IsT0FBTyxLQUFLLE1BQU0sUUFBUSxDQUFDO0FBUzNCLE1BQU0sVUFBVSxRQUFRLENBQUksR0FBZ0IsRUFBRSxHQUFNO0lBQ2xELE9BQU8sT0FBTyxHQUFHLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNoRCxDQUFDO0FBRUQsTUFBTSxDQUFDLEtBQUssVUFBVSxLQUFLLENBQUMsSUFBWTtJQUN0QyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFFRCxNQUFNLE9BQU8sYUFBYyxTQUFRLEtBQUs7SUFDdEMsWUFBbUIsVUFBa0Isa0JBQWtCLEVBQVMsSUFBYTtRQUMzRSxLQUFLLEVBQUUsQ0FBQztRQURTLFlBQU8sR0FBUCxPQUFPLENBQTZCO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBUztRQUUzRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQy9CLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFPLHFCQUFzQixTQUFRLGFBQWE7SUFBeEQ7O1FBQ0UsWUFBTyxHQUNILCtHQUErRyxDQUFDO1FBQ3BILFNBQUksK0RBQThDO0lBQ3BELENBQUM7Q0FBQTtBQUVELE1BQU0sT0FBTyw2QkFBOEIsU0FBUSxhQUFhO0lB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