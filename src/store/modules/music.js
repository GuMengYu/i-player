import { getTrackDetail } from '@/api/music';
import { favTrack, getLikeList, personalFM } from '@/api';
import { getUserPlaylist } from '@/api/user';
import { make } from 'vuex-pathify';
import { uniqWith, isEqual } from 'lodash-es';
const PLAY_MODE = {
  ORDER: 0,
  CYCLE: 1,
  SINGLE_CYCLE: 2,
  RANDOM: 3,
};
const state = {
  playing: false,
  track: {},
  currentTrackId: localStorage.getItem('currentTrackId') ?? '',
  currentTime: localStorage.getItem('currentTime') ?? 0,
  playingList: JSON.parse(localStorage.getItem('playingList')) ?? [],
  showList: false,
  showLyricsPage: false,
  mode: PLAY_MODE.CYCLE,
  loadAudio: false,
  likes: [],
  playlist: [],
  recent: JSON.parse(localStorage.getItem('recent')) ?? [],
  isCurrentFm: false,
  fmTrack: {},
  fmList: [], // 私人fm列表（3首）
};

export default {
  namespaced: true,
  state,
  getters: {
    index(state) {
      return state.playingList.findIndex(
        (track) => track.id === state.track.id,
      );
    },
    nextFmTrackId() {
      return state.fmList[0]?.id;
    },
    nextTrackId(state, getters) {
      const index = getters['index'];
      let id = state.track.id;
      const len = state.playingList.length;
      const { mode, playingList } = state;
      if (
        mode === PLAY_MODE.CYCLE ||
        (mode === PLAY_MODE.ORDER && len - 1 !== index)
      ) {
        // 顺序播放（非最后一曲），或 循环播放，否则下一曲都是当前歌曲
        id = playingList[index + 1 === playingList.length ? 0 : index + 1]?.id;
      }
      return id;
    },
    prevTrackId(state, getters) {
      const index = getters['index'];
      return state.playingList[
        index === 0 ? state.playingList.length - 1 : index - 1
      ]?.id;
    },
    liked: (state) => (id) => !!state.likes.find((i) => i === id),
  },
  actions: {
    async fetch({ commit, rootGetters }) {
      if (rootGetters['settings/logged']) {
        const [likesRes, playlistRes] = await Promise.all([
          getLikeList(),
          getUserPlaylist({
            timestamp: new Date().getTime(),
            uid: rootGetters['settings/userId'] ?? '',
          }),
        ]);
        commit('likes', likesRes.ids);
        commit('playlist', playlistRes.playlist);
      }
    },
    async updatePlayingList({ commit, dispatch }, payload) {
      const { autoplay = false, list } = payload;
      localStorage.setItem('playingList', JSON.stringify(list));
      commit('isCurrentFm', false);
      commit('playingList', list);
      if (autoplay) {
        await dispatch('updateTrack', list?.[0]);
      }
    },
    async updatePersonalFmList({ commit, state }) {
      let originList = [...state.fmList];
      let pop;
      if (originList.length <= 1) {
        let { data } = await personalFM();
        if (originList.length === 1) {
          pop = originList.shift();
        } else {
          pop = data?.shift();
        }
        commit('fmList', data);
      } else {
        pop = originList.shift();
        commit('fmList', originList);
      }
      return pop;
    },
    async updateTrack(
      { rootGetters, commit, dispatch, getters, rootState },
      payload,
    ) {
      const { id, option = { autoplay: true, resetProgress: true } } = payload;
      commit('playing', false);
      commit('loadAudio', true);
      // await sleep();
      const track = await getTrackDetail(
        id,
        rootState.settings.quality,
        rootGetters['settings/logged'],
      );
      if (option.resetProgress) {
        commit('currentTime', 0);
      }
      commit('track', track);
      if (state.isCurrentFm) {
        commit('fmTrack', track);
      }
      commit('currentTrackId', track?.id);
      localStorage.setItem('currentTrackId', track?.id);
      if (!track.url) {
        dispatch(
          'snackbar/show',
          { text: '歌曲暂时不可用', type: 'warning' },
          { root: true },
        );
        const next = getters['nextTrackId'] ?? '';
        if (next && getters['nextTrackId'] !== state.currentTrackId)
          dispatch('updateTrack', { id: getters['nextTrackId'] });
      } else {
        if (option.autoplay) {
          commit('playing', true);
        }
      }
      return track;
    },
    async favSong({ rootGetters, commit, dispatch, state }, { id, like }) {
      let likes = state.likes;
      if (!rootGetters['settings/logged']) {
        dispatch(
          'snackbar/show',
          { text: '需要登录', type: 'warning' },
          { root: true },
        );
      } else {
        await favTrack({ id, like });
        if (like) {
          likes.push(id);
        } else {
          likes = likes.filter((i) => i !== id);
        }
        commit('likes', likes);
      }
    },
    pushRecent({ state, commit }, payload) {
      const recent = uniqWith([payload, ...state.recent], isEqual);
      const limit = 100,
        len = recent.length;
      if (len > limit) {
        recent.splice(limit, len - limit);
      }
      try {
        localStorage.setItem('recent', JSON.stringify(recent));
      } catch (e) {
        console.error(e);
      }
      commit('recent', recent);
    },
  },
  mutations: {
    ...make.mutations(state),
    playingList(state, list) {
      state.playingList = list;
    },
    UPDATE_PLAYER(state, payload) {
      Object.keys(payload).map((key) => {
        state[key] = payload[key];
      });
    },
  },
};
