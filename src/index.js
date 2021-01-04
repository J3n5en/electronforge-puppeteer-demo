const { app, BrowserWindow } = require("electron");
const path = require("path");
const puppeteer = require("puppeteer-core");
const port = 9200;
let pptrApp;

app.commandLine.appendSwitch("remote-debugging-port", port);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

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

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  pptrApp = await puppeteer.connect({
    browserURL: `http://localhost:${port}`,
  });

  const iPhone = puppeteer.devices["iPhone 6"];
  const page = await newPage({ show: false });
  await page.emulate(iPhone);
  await page.goto("http://arh.antoinevastel.com/bots/areyouheadless");
  await page.screenshot({ path: "fullpage.png", fullPage: true });
  await page.close();
  const page2 = await newPage();
  await page2.emulate(iPhone);
  await page2.goto(
    "https://www.whatismybrowser.com/detect/what-is-my-user-agent"
  );
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
