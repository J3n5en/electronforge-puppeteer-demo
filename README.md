缝合 electronforge && puppeteer-core， 并用内置的 electron 代替全功能的 Chromium 浏览器

👇👇👇👇👇 主要做的事情 👇👇👇👇👇

```javascript
app.commandLine.appendSwitch("remote-debugging-port", port); // 开启electron remote debugging 端口

// puppeteer 连接 electron
puppeteer.connect({
  browserURL: `http://localhost:${port}`,
});

// 实现electron中缺少的、却常用的api，如 newPage
const newPage = async (options) => {
  return new Promise((resolve, reject) => {
    const _url = `about:blank?timestamp=${+new Date()}`;
    const newPageWindow = new BrowserWindow(options);
    newPageWindow.loadURL(_url);
    newPageWindow.webContents.once("did-finish-load", async () => {
      const pages = await pptrApp.pages();
      for (const page of pages) {
        const pageUrl = await page.url();
        if (pageUrl === _url) {
          resolve(page);
        }
      }
      reject(new Error("page not found"));
    });
  });
};
```
