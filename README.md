# puppeteer-real-browser
This package prevents Puppeteer from being detected as a bot in services like Cloudflare and allows you to pass captchas without any problems. It behaves like a real browser.
## Warnings
1) The fingerprints of the browsers created with this package are the same.
https://fingerprint.com/demo/
You can check with services like. If you are using it for a service that checks fingerprints, you can get caught.
2) It serves on a port on localhost to act like a real browser. The port must be closed when the process is finished. To close it, simply call browser.close(). In this method, operations to close the port are performed.
3) Currently only available with windows. 
# Usage