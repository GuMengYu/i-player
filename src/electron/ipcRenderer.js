import { ipcRenderer } from 'electron';
import { noop, once } from 'lodash-es';

export const registerIpcRenderer = (store) => {
  const showDownloadComplete = once((name) => {
    store.dispatch('snackbar/show', {
      text: `下载成功 ${name}`,
      type: 'success',
      timeout: 4000,
    });
  });

  ipcRenderer.on('open-settings', () => {
    store.commit('app/showSettings', true);
  });
  ipcRenderer.on('next', () => {
    const id = store.getters['music/nextTrackId'];
    store.dispatch('music/updateTrack', { id });
  });
  ipcRenderer.on('up', () => {
    const id = store.getters['music/prevTrackId'];
    store.dispatch('music/updateTrack', { id });
  });
  ipcRenderer.on('playOrPause', () => {
    const playing = store?.state.music.playing;
    store.commit('music/playing', !playing);
  });
  ipcRenderer.on('volumeUp', () => {
    const { volume } = store?.state.settings;
    const tem = volume + 0.1;
    if (tem < 1) {
      store.commit('settings/volume', tem);
    }
  });
  ipcRenderer.on('volumeDown', () => {
    const { volume } = store?.state.settings;
    const tem = volume - 0.1;
    if (tem >= 0) {
      store.commit('settings/volume', tem);
    }
  });
  ipcRenderer.on('like', () => {});
  ipcRenderer.on('fullscreen', (e, fullscreen) => {
    store.commit('music/showLyricsPage', fullscreen);
  });
  ipcRenderer.on('startDownload', (e, data) => {
    console.log('startDownload', e, data);
    store.dispatch('snackbar/show', {
      text: `开始下载 ${data.name}`,
      type: 'info',
    });
  });
  ipcRenderer.on('downloadProgress', (e, data) => {
    const { percent } = data;
    console.log(percent);
    store.commit('app/downloadprogress', percent);
  });
  ipcRenderer.on('downloadCompleted', (e, file) => {
    const { aliasName } = file;
    console.log(file);
    showDownloadComplete(aliasName);
    store.commit('app/downloadprogress', 0);
  });
  return ipcRenderer;
};

export default {
  async invoke(channel, data = {}, cb = noop) {
    const res = ipcRenderer.invoke(channel, data);
    cb(res);
  },
  subscribe: (channel, cb = noop) => {
    ipcRenderer.on(channel, cb);
  },
  remove(channel) {
    ipcRenderer.removeAllListeners(channel);
  },
};
