<template>
  <v-sheet class="frame">
    <div class="frame-header mt-6" @click="close" />
    <v-row class="frame-content d-flex align-center" no-gutters>
      <v-col class="frame-content-left d-flex justify-center align-center">
        <div class="left-container">
          <v-card class="rounded-lg album-cover">
            <v-img class="cover-img" :src="albumPicUrl" />
          </v-card>
          <div
            class="control_bar d-flex flex-column mt-12 justify-space-between"
          >
            <div class="d-flex justify-space-between mt-4">
              <div class="left d-flex flex-column text-body-1 font-weight-bold">
                <span>{{ track.name }}</span>
                <span>{{ $ochain(track, 'ar', '0', 'name') }}</span>
              </div>
              <div class="right d-flex align-center">
                <v-btn icon>
                  <v-icon>
                    {{ icon.mdiDotsHorizontal }}
                  </v-icon>
                </v-btn>
              </div>
            </div>
            <div class="control_process mt-2">
              <vue-slider
                ref="vueLyricSlider"
                v-model="currentTime"
                class="playing-progress"
                :max="~~(track.dt / 1000) || 0"
                :min="0"
                :interval="1"
                :duration="0"
                :drag-on-click="true"
                :dot-size="10"
                :height="2"
                tooltip="none"
                @drag-end="handleSlideChange"
              />
              <div class="time-info d-flex justify-space-between text-caption">
                <span>{{ (currentTime * 1000) | formatDuring }}</span>
                <span>{{ track.dt | formatDuring }}</span>
              </div>
            </div>
            <control />
            <div class="d-flex justify-space-between mt-4">
              <v-btn @click="showLyric = !showLyric" icon>
                <v-icon>
                  {{ icon.mdiPodcast }}
                </v-icon>
              </v-btn>
              <v-btn
                v-if="lyric.length"
                @click="showLyric = !showLyric"
                icon
                :color="showLyric ? 'accent' : void 0"
              >
                <v-icon>
                  {{ icon.mdiCommentQuoteOutline }}
                </v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>
      <v-col v-if="enableLyric" class="frame-content-right px-4">
        <v-list ref="lyricContainer" class="frame-lyrics" nav>
          <div class="first"></div>
          <v-list-item
            v-for="(item, index) in lyric"
            :key="index"
            :aria-time="item.time"
            :aria-index="index"
            :class="{ active: index === activeIdx }"
            class="py-2"
            v-html="item.sentence"
            @click="jump(item.time)"
          >
            {{ item.sentence }}
          </v-list-item>
          <div class="last mb-10"></div>
        </v-list>
      </v-col>
    </v-row>
    <div class="frame-bg" v-if="showLyricsPage && dynamicBg">
      <v-img :src="albumPicUrl" class="bg-color album-artwork"></v-img>
      <v-img :src="albumPicUrl" class="bg-black album-artwork"></v-img>

      <!--      <img class="bg-color album-artwork" :src="albumPicUrl" />-->
      <!--      <img class="bg-black album-artwork" :src="albumPicUrl" />-->
    </div>
  </v-sheet>
</template>

<script>
import {
  mdiSkipPrevious,
  mdiDotsHorizontal,
  mdiPauseCircle,
  mdiSkipNext,
  mdiShuffle,
  mdiRepeat,
  mdiPodcast,
  mdiCommentQuoteOutline,
} from '@mdi/js';
import { get, sync } from 'vuex-pathify';
import { formatLyric } from '@/util/fn';
import VueSlider from 'vue-slider-component';
import { findIndex } from 'lodash-es';
import Control from '@components/app/Control';
export default {
  name: 'DefaultTrackDetail',
  components: {
    Control,
    VueSlider,
  },
  data: () => ({
    icon: {
      mdiDotsHorizontal,
      mdiShuffle,
      mdiSkipPrevious,
      mdiSkipNext,
      mdiRepeat,
      mdiPauseCircle,
      mdiPodcast,
      mdiCommentQuoteOutline,
    },
    activeIdx: -1,
    interval: null,
    showLyric: true,
  }),
  computed: {
    isCurrentFm: get('music/isCurrentFm'),
    albumPicUrl() {
      return `${this.track.al?.picUrl}?param=512y512`;
    },
    lyric() {
      const { tlyric, lrc } = this.track.lyric ?? {};
      let lyric = lrc?.lyric ? formatLyric(lrc.lyric) : [];
      let _tlyric = tlyric?.lyric ? formatLyric(tlyric.lyric) : [];
      if (_tlyric.length) {
        return lyric.map((i) => {
          const _t = _tlyric.find((t) => t.time === i.time);
          return {
            sentence: `${i.sentence}${
              _t?.sentence ? `<br>${_t?.sentence}` : ''
            }`,
            time: i.time,
          };
        });
      } else {
        return lyric;
      }
    },
    currentTime: sync('music/currentTime'),
    track: get('music/track'),
    showLyricsPage: sync('music/showLyricsPage'),
    dynamicBg: sync('settings/dynamicBg'),
    enableLyric() {
      return this.lyric.length && this.showLyric;
    },
  },
  watch: {
    showLyricsPage(val) {
      if (val) {
        this.initInterval();
      } else {
        clearInterval(this.interval);
      }
    },
  },
  mounted() {
    this.initInterval();
  },
  destroyed() {
    clearInterval(this.interval);
  },
  methods: {
    initInterval() {
      if (this.enableLyric) {
        this.interval = setInterval(() => {
          this.calculate();
        }, 500);
      }
    },
    // 计算歌词位置并滚动
    calculate() {
      const current = this.currentTime;
      const prevActiveIdx = this.activeIdx;
      const activeIdx = findIndex(this.lyric, (o, idx) => {
        const next = this.lyric[idx + 1];
        return (next ? current < next.time : true) && current >= o.time;
      });
      this.activeIdx = activeIdx;
      // 当前歌词渲染后计算滚动位置
      this.$nextTick(async () => {
        if (activeIdx >= 0 && prevActiveIdx !== activeIdx) {
          const container = this.$refs.lyricContainer;
          const activeEl = document.querySelector('.frame-lyrics .active');
          if (activeEl) {
            const newY = activeEl.offsetTop - activeEl.clientHeight * 2;
            const offset = await this.$vuetify.goTo(newY, {
              container,
              duration: 1000,
            });
            console.log('scroll to ' + offset);
          }
        }
      });
    },
    jump(time) {
      this.currentTime = time;
    },
    close() {
      this.$emit('close');
    },
    handleSlideChange() {
      this.currentTime = this.$refs['vueLyricSlider'].getValue();
    },
  },
};
</script>

<style lang="scss" scoped>
.frame {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  .frame-header {
    -webkit-app-region: no-drag;
    z-index: 1;
    display: flex;
    justify-content: center;
    width: 100%;
    &:before {
      content: '';
      display: block;
      background: #fff;
      filter: brightness(0.7);
      width: 4em;
      height: 0.3em;
      margin: 1em auto;
      z-index: 1;
      border-radius: 15em;
      mix-blend-mode: overlay;
      cursor: pointer;
    }
  }
  .frame-content {
    z-index: 1;
    height: calc(100% - 2.6em - 15px);
    .frame-content-left {
      flex: 1;
      .left-container {
        max-width: 30vw;
        //.album-cover {
        //  box-shadow: 4px 9px 20px #403e3e, -7px -6px 20px #565454;
        //}
      }
    }
    .frame-content-right {
      height: 85vh;
      flex: 1;
      .frame-lyrics {
        height: 100%;
        position: relative;
        z-index: 1;
        font-size: 1.7rem;
        overflow-y: auto;
        .active {
          font-weight: 700;
        }
        .first {
          margin-top: 50%;
        }
        .last {
          margin-bottom: 50%;
        }
        & > .v-list-item {
          transition: all 0.25s;
        }
        & > .v-list-item {
          &:not(.active) {
            filter: blur(1px) brightness(0.8);
          }
        }
      }
    }
  }
  .frame-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
    .album-artwork {
      width: 200%;
      position: absolute;
      border-radius: 100em;
      animation: rotate 100s ease-in-out infinite;
      filter: blur(70px) brightness(0.5);
      mix-blend-mode: multiply;
      z-index: 1;
    }
    .bg-color {
      right: 0;
      top: 0;
    }
    .bg-black {
      left: 0;
      bottom: 0;
      animation-direction: reverse;
    }
  }
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
