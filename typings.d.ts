declare module "puppeteer-real-browser" {
	import type { Browser, Page } from "puppeteer-core-patch";
	import type { GhostCursor } from "ghost-cursor";

	export function connect(options: Options): Promise<ConnectResult>;

	interface PageWithCursor extends Page {
		realClick: GhostCursor["click"];
		realCursor: GhostCursor;
	}

	type ConnectResult = {
		browser: Browser;
		page: PageWithCursor;
	};

	interface Options {
		args?: string[];
		headless?: boolean;
		customConfig?: import("chrome-launcher").Options;
		proxy?: ProxyOptions;
		turnstile?: boolean;
		connectOption?: import("puppeteer-core-patch").ConnectOptions;
		disableXvfb?: boolean;
		plugins?: import("puppeteer-extra").PuppeteerExtraPlugin[];
		ignoreAllFlags?: boolean;
	}

	interface ProxyOptions {
		host: string;
		port: number;
		username?: string;
		password?: string;
	}
}
