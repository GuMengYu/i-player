'use strict';
/* global __static */
import path from 'path';
import Express from 'express';
import { app, protocol, BrowserWindow } from 'electron';
import is from 'electron-is';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { createElectronMenu } from './electron/menu';
import { createTray } from './electron/tray';
import { createApiServer } from './electron/neteaseapi/apiserver';
import { registerIpcMain } from './electron/ipcMain';
import WindowManager from './electron/windowManager';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);
let appProxy = null;
let windowManager = null;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) windowManager.openWindow();
  else windowManager.window.show();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (is.dev() && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createApiServer();
  is.production() && createProxyServer();
  windowManager = new WindowManager();
  windowManager.openWindow();
  createElectronMenu(windowManager.window);
  is.windows && createTray(windowManager.window);
  registerIpcMain(windowManager.window);
});
app.setAboutPanelOptions({
  applicationName: 'VPlayer',
  iconPath: path.join(__static, 'icon.png'),
  applicationVersion: '0.1.0-alpha',
  copyright: 'Copyright © 2021',
});

// Exit cleanly on request from parent process in development mode.
if (is.dev()) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
app.on('quit', () => {
  appProxy && appProxy.close();
});
app.on('before-quit', () => {
  windowManager.willQuit = true;
});

function createProxyServer() {
  const app = new Express();
  app.use('/', Express.static(__dirname + '/'));
  appProxy = app.listen(12137, '', () => {
    console.log('app run in port 12137');
  });
}

export const getWin = () => {
  return windowManager.window;
};
