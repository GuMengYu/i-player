import { musicXhr as xhr } from '@/util/xhr';
import { now } from 'lodash-es';

/**
 * 登录
 * - phone: 手机号
 * - md5_password: md5加密密码
 * @param {Object} params: {
 *   phone: String,
 *   md5_password: String
 * }
 */
export const login = (params) => {
  return xhr.post(`/login/cellphone?timestamp=${now()}`, params);
};
/**
 * banner
 * 返回轮播图信息
 */
export const getBanner = () => {
  return xhr.get('/banner');
};

/**
 * 获取歌曲详情
 * @param ids[]
 * 根据歌曲id返回歌曲详细信息
 */
export const getSongData = (ids = []) =>
  xhr.get(`/song/detail?ids=${ids.join()}`);
/**
 * 获取歌曲可播放url
 * @param params
 * 根据歌曲id返回歌曲详细信息
 */
export const getSongUrl = (params) =>
  xhr.get('/song/url', {
    params,
  });

/**
 * 解锁灰色不可播放歌曲
 * @param id
 */
export const getSongUrlFromUnlockMusic = (id) =>
  xhr.get('/unlockmusic', { params: { id }, timeout: 4000 });

/**
 * 获取歌单详情
 * @param id
 * 根据歌单id返回歌单详细信息
 */
export const getPlayList = (id) => xhr.get(`/playlist/detail?id=${id}`);

/**
 * 新建歌单
 * - name : 歌单名
 * - privacy : 是否设置为隐私歌单，默认否，'10' 为隐私歌单
 * - type : 歌单类型
 * @param {Object} params
 * @param {string} params.name
 * @param {number} params.privacy
 * @param {string} params.type
 */
export const createPlaylist = (params) =>
  xhr.post('/playlist/create', {
    ...params,
    timestamp: now(),
  });

/**
 * 获取专辑详情
 * @param id
 * 根据歌单id返回歌单详细信息
 */
export const getAlbum = (id) => xhr.get('/album', { params: { id } });

/**
 * 获取推荐歌单列表
 * 根据歌单id返回歌单详细信息
 */
export const getPersonalized = (limit) =>
  xhr.get('/personalized', {
    params: { limit },
  });

export const topArtists = () => xhr.get('/toplist/artist?type=2');
/**
 * 获取网友精选碟歌单
 * 可选参数 : order: 可选值为 'new' 和 'hot', 分别对应最新和最热 , 默认为 'hot'
 cat:cat: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为 "全部",可从歌单分类接口获取(/playlist/catlist)
 limit: 取出歌单数量 , 默认为 50
 offset: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)*50, 其中 50 为 limit 的值
 */
export const getTopPlaylist = (
  params = { limit: 20, cat: '全部', offset: 0 },
) => xhr.get('/top/playlist', { params });

/**
 * 推荐歌曲
 */
export const getNewRelease = (params) =>
  xhr.get('/personalized/newsong', { params });

/**
 * 新专辑
 */
export const newAlbums = (params) => {
  return xhr.get('/album/new', {
    params,
  });
};
/**
 * 新碟上架
 * @returns {AxiosPromise}
 */
export const newestAlbums = () => {
  return xhr('/album/newest');
};

/**
 * 最新专辑
 * @returns {AxiosPromise}
 */
export const hotAlbums = () => {
  return xhr('/album/newest');
};

/**
 * 新歌
 * @returns {AxiosPromise}
 */
export const topSongs = () => {
  return xhr('/top/songs', {
    params: {
      limit: 20,
      area: 'ALL',
      type: 'hot',
    },
  });
};

/**
 * 获取新歌
 */
export const getDailyRecommend = () => xhr.get('/recommend/songs');

/**
 * 获取所有榜单
 */
export const getTopList = () => xhr.get('/toplist');

export const getLyric = (id) => xhr.get(`/lyric?id=${id}`);

export const getArtist = (id) => xhr.get(`/artists?id=${id}`);

export const getArtistAlbum = (id) =>
  xhr.get('/artist/album', {
    params: {
      id,
      limit: 200,
    },
  });

export const getArtistMv = (id) =>
  xhr.get('/artist/mv', {
    params: { id },
  });
/**
 * 标记|取消 喜欢音乐
 * id, like: true/false
 * @param {Object} params
 * @returns Promise
 */
export const favTrack = (params) => {
  params['timestamp'] = new Date().getTime();
  return xhr.get('/like', {
    params,
  });
};
/**
 * 获取喜欢列表
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getLikeList = () => xhr.get('/likelist');

export const getCatList = () => xhr.get('/playlist/catlist');
/**
 * 获取推荐mv
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getMv = () => xhr.get('/personalized/mv');

/**
 * 获取新mv
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getNewMv = (params) => xhr.get('/mv/first', { params });

/**
 * 获取 mv 数据
 * @param mvid
 * @returns {Promise<AxiosResponse<any>>}
 */
export const mvDetail = (mvid) => {
  return xhr.get('/mv/detail', {
    params: {
      mvid,
      timestamp: now(),
    },
  });
};

/**
 * mv 地址
 * 说明 : 调用此接口 , 传入 mv id,可获取 mv 播放地址
 * - id: mv id
 * @param {Object} params
 * @param {number} params.id
 * @param {number=} params.r
 */
export const getMvUrl = (params) => {
  return xhr.get('/mv/url', {
    params,
  });
};

/**
 * 相似 mv
 * 说明 : 调用此接口 , 传入 mvid 可获取相似 mv
 * @param {number} mvid
 */
export const simiMv = (mvid) => {
  return xhr('/simi/mv', {
    params: {
      mvid,
    },
  });
};

/**
 * 收藏 | 取消收藏 MV
 * - mvid: mv id
 * - t: 1 为收藏,其他为取消收藏
 * @param {Object} params
 * @param {number} params.mvid
 * @param {number=} params.t
 */

export function subMV(params) {
  return xhr.get('/mv/sub', {
    params: {
      ...params,
      timestamp: now(),
    },
  });
}

/**
 * 私人fm
 */

export const personalFM = () =>
  xhr.get('/personal_fm', { params: { timestamp: now() } });

/**
 * 私人fm 不喜欢
 */
export const fmToTrash = (id) => xhr.get('/fm_trash', { params: { id } });
