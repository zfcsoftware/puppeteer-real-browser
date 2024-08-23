/**
 * @license Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';
/**
 * See the following `chrome-flags-for-tools.md` for exhaustive coverage of these and related flags
 * @url https://github.com/GoogleChrome/chrome-launcher/blob/main/docs/chrome-flags-for-tools.md
 */
export const DEFAULT_FLAGS = [
    '--disable-features=' +
        [
            // Disable built-in Google Translate service
            'Translate',
            // Disable the Chrome Optimization Guide background networking
            'OptimizationHints',
            //  Disable the Chrome Media Router (cast target discovery) background networking
            'MediaRouter',
            /// Avoid the startup dialog for _Do you want the application “Chromium.app” to accept incoming network connections?_. This is a sub-component of the MediaRouter.
            'DialMediaRouteProvider',
            // Disable the feature of: Calculate window occlusion on Windows will be used in the future to throttle and potentially unload foreground tabs in occluded windows.
            'CalculateNativeWinOcclusion',
            // Disables the Discover feed on NTP
            'InterestFeedContentSuggestions',
            // Don't update the CT lists
            'CertificateTransparencyComponentUpdater',
            // Disables autofill server communication. This feature isn't disabled via other 'parent' flags.
            'AutofillServerCommunication',
            // Disables "Enhanced ad privacy in Chrome" dialog (though as of 2024-03-20 it shouldn't show up if the profile has no stored country).
            'PrivacySandboxSettings4',
        ].join(','),
    // Disable all chrome extensions
    '--disable-extensions',
    // Disable some extensions that aren't affected by --disable-extensions
    '--disable-component-extensions-with-background-pages',
    // Disable various background network services, including extension updating,
    //   safe browsing service, upgrade detector, translate, UMA
    '--disable-background-networking',
    // Don't update the browser 'components' listed at chrome://components/
    '--disable-component-update',
    // Disables client-side phishing detection.
    '--disable-client-side-phishing-detection',
    // Disable syncing to a Google account
    '--disable-sync',
    // Disable reporting to UMA, but allows for collection
    '--metrics-recording-only',
    // Disable installation of default apps on first run
    '--disable-default-apps',
    // Mute any audio
    '--mute-audio',
    // Disable the default browser check, do not prompt to set it as such
    '--no-default-browser-check',
    // Skip first run wizards
    '--no-first-run',
    // Disable backgrounding renders for occluded windows
    '--disable-backgrounding-occluded-windows',
    // Disable renderer process backgrounding
    '--disable-renderer-backgrounding',
    // Disable task throttling of timer tasks from background pages.
    '--disable-background-timer-throttling',
    // Disable the default throttling of IPC between renderer & browser processes.
    '--disable-ipc-flooding-protection',
    // Avoid potential instability of using Gnome Keyring or KDE wallet. crbug.com/571003 crbug.com/991424
    '--password-store=basic',
    // Use mock keychain on Mac to prevent blocking permissions dialogs
    '--use-mock-keychain',
    // Disable background tracing (aka slow reports & deep reports) to avoid 'Tracing already started'
    '--force-fieldtrials=*BackgroundTracing/default/',
    // Suppresses hang monitor dialogs in renderer processes. This flag may allow slow unload handlers on a page to prevent the tab from closing.
    '--disable-hang-monitor',
    // Reloading a page that came from a POST normally prompts the user.
    '--disable-prompt-on-repost',
    // Disables Domain Reliability Monitoring, which tracks whether the browser has difficulty contacting Google-owned sites and uploads reports to Google.
    '--disable-domain-reliability',
    // Disable the in-product Help (IPH) system.
    '--propagate-iph-for-testing',
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZmxhZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUNILFlBQVksQ0FBQztBQUViOzs7R0FHRztBQUVILE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBMEI7SUFDbEQscUJBQXFCO1FBQ2pCO1lBQ0UsNENBQTRDO1lBQzVDLFdBQVc7WUFDWCw4REFBOEQ7WUFDOUQsbUJBQW1CO1lBQ25CLGlGQUFpRjtZQUNqRixhQUFhO1lBQ2Isa0tBQWtLO1lBQ2xLLHdCQUF3QjtZQUN4QixtS0FBbUs7WUFDbkssNkJBQTZCO1lBQzdCLG9DQUFvQztZQUNwQyxnQ0FBZ0M7WUFDaEMsNEJBQTRCO1lBQzVCLHlDQUF5QztZQUN6QyxnR0FBZ0c7WUFDaEcsNkJBQTZCO1lBQzdCLHVJQUF1STtZQUN2SSx5QkFBeUI7U0FDMUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBRWYsZ0NBQWdDO0lBQ2hDLHNCQUFzQjtJQUN0Qix1RUFBdUU7SUFDdkUsc0RBQXNEO0lBQ3RELDZFQUE2RTtJQUM3RSw0REFBNEQ7SUFDNUQsaUNBQWlDO0lBQ2pDLHVFQUF1RTtJQUN2RSw0QkFBNEI7SUFDNUIsMkNBQTJDO0lBQzNDLDBDQUEwQztJQUMxQyxzQ0FBc0M7SUFDdEMsZ0JBQWdCO0lBQ2hCLHNEQUFzRDtJQUN0RCwwQkFBMEI7SUFDMUIsb0RBQW9EO0lBQ3BELHdCQUF3QjtJQUN4QixpQkFBaUI7SUFDakIsY0FBYztJQUNkLHFFQUFxRTtJQUNyRSw0QkFBNEI7SUFDNUIseUJBQXlCO0lBQ3pCLGdCQUFnQjtJQUNoQixxREFBcUQ7SUFDckQsMENBQTBDO0lBQzFDLHlDQUF5QztJQUN6QyxrQ0FBa0M7SUFDbEMsZ0VBQWdFO0lBQ2hFLHVDQUF1QztJQUN2Qyw4RUFBOEU7SUFDOUUsbUNBQW1DO0lBQ25DLHNHQUFzRztJQUN0Ryx3QkFBd0I7SUFDeEIsbUVBQW1FO0lBQ25FLHFCQUFxQjtJQUNyQixrR0FBa0c7SUFDbEcsaURBQWlEO0lBRWpELDZJQUE2STtJQUM3SSx3QkFBd0I7SUFDeEIsb0VBQW9FO0lBQ3BFLDRCQUE0QjtJQUM1Qix1SkFBdUo7SUFDdkosOEJBQThCO0lBQzlCLDRDQUE0QztJQUM1Qyw2QkFBNkI7Q0FDOUIsQ0FBQyJ9