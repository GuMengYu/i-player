import { download } from 'electron-dl';
import { getWin } from '../../background';
import { app } from 'electron';
export const downloadFile = (data) => {
  const win = getWin();
  const downloadLocation = app.getPath('downloads');
  const fileName = data.fileName.replaceAll('/', '');
  download(win, data.url, {
    directory: downloadLocation,
    showBadge: false,
    filename: fileName,
    onStarted(item) {
      win.webContents.send('startDownload', { name: item.getFilename() });
    },
    onProgress(progress) {
      progress.percent =
        (progress.transferredBytes / progress.totalBytes) * 100;
      win.webContents.send('downloadProgress', progress);
    },
    onCompleted(file) {
      file.aliasName = data.fileName;
      win.webContents.send('downloadCompleted', file);
    },
  });
};
