// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, ipcRenderer } = require("electron");
const path = require("path");

let mainWindow, newWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 335,
    minWidth: 320,
    height: 840,
    icon: __dirname + "./assets/images/note.png",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: true, // turn off remote
    },
  });

  // and load the index.html of the app.
  // mainWindow.removeMenu();
  mainWindow.loadFile("./src/index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on("note-list", (event, arg) => {
  mainWindow.webContents.send("note-val", arg);
});

let noteEleId;

ipcMain.handle("newWindow", async (event, arg) => {
  noteEleId = arg.data.id;
  let windowId;
  function windowsBrowser() {
    newWindow = new BrowserWindow({
      width: 305,
      height: 315,
      icon: __dirname + "./assets/images/note.png",
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false, // is default value after Electron v5
        contextIsolation: true, // protect against prototype pollution
        enableRemoteModule: true, // turn off remote
      },
    });
    // newWindow.removeMenu();
    newWindow.loadURL(arg.file);
    windowId = newWindow.id;
  }
  await windowsBrowser();
  return windowId;
});

ipcMain.on("update-specific-note", (event, arg) => {
  mainWindow.webContents.send("specific-note-val", {
    id: noteEleId,
    value: arg,
  }); // arg has object id for targeting element
  newWindow.webContents.send("id-val", { id: noteEleId, value: arg });
});

ipcMain.on("an-action", (event, arg) => {
  newWindow.webContents.send("test-val", arg);
});

ipcMain.on("remove-div-action", (event, arg) => {
  mainWindow.webContents.send("textarea-val", arg);
})

ipcMain.on("close-window-action", (event, arg) => {
  let windowClose = BrowserWindow.fromId(arg)
  console.log(windowClose);
  if (windowClose !== null) {
    windowClose.close();
  }
})