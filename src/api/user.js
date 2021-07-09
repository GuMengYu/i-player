import { musicXhr as xhr } from '@/util/xhr';
import { now } from 'lodash-es';
export const getUserPlaylist = (params) => {
  return xhr.get('/user/playlist', {
    params: {
      ...params,
      timestamp: now(),
    },
  });
};

/**
 * 获取收藏的专辑
 * @returns {*}
 */
export const favAlbums = () =>
  xhr.get('/album/sublist', { params: { timestamp: now() } });
/**
 * 获取收藏的MV
 * @returns {*}
 */
export const favMVs = () =>
  xhr.get('/mv/sublist', { params: { timestamp: now() } });
/**
 * 获取收藏的歌手
 * @returns {*}
 */
export const favArtists = () =>
  xhr.get('/artist/sublist', { params: { timestamp: now() } });

/**
 * 获取用户电台
 * @returns {*}
 */

export const getUserAudio = () => xhr.get('/dj/sublist');
