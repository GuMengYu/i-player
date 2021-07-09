import { Howl } from 'howler';
import { sync } from 'vuex-pathify';
import { throttle } from 'lodash-es';
export default {
  name: 'Player',
  data: () => ({
    progressThrottle: null,
    saveCurrentTimeThrottle: null,
    howler: null,
  }),
  computed: {
    volume: sync('settings/volume'),
    currentTime: sync('music/currentTime'),
  },
  watch: {
    track(newTrack, oldTrack) {
      if (newTrack.id !== oldTrack.id) {
        this.init(newTrack.url);
        console.log('song changed', this);
        this.$player();
      } else {
        this.loadAudio = false;
      }
    },
    volume(val) {
      this.howler.volume(val);
    },
  },
  mounted() {
    this.progressThrottle = throttle(this.runProgress, 1000);
    this.saveCurrentTimeThrottle = throttle(this.saveCurrentTime, 2000);
    this.track?.url && this.init(this.track.url);
  },
  methods: {
    initHowler(src) {
      const sound = new Howl({
        src: [src],
        html5: true,
        preload: 'metadata',
        format: ['mp3', 'flac'],
        onplay: () => {
          requestAnimationFrame(this.step);
          this.saveToRecent();
        },
        // onend: function() {
        //   // Stop the wave animation.
        // },
        // onpause: function() {
        //   // Stop the wave animation.
        // },
        // onstop: function() {
        //   // Stop the wave animation.
        // },
        onseek: () => {
          // Start updating the progress of the track.
          requestAnimationFrame(this.step);
        },
        onload: () => {
          this.loadAudio = false;
        },
        onloaderror: () => {
          console.log('歌曲加载失败');
          this.loadAudio = false;
        },
      });
      sound.once('end', this.endCb);
      sound.seek(this.currentTime);
      return sound;
    },
    init(url) {
      this.initMediaSession();
      this.howler = this.initHowler(url);
      this.howler.volume(this.volume);
    },
    pause() {
      this.howler?.pause();
    },
    play() {
      this.howler?.play();
    },
    runProgress() {
      this.currentTime = Math.ceil(this.howler.seek());
    },
    setSeek(val) {
      this.howler.seek(val);
    },
    step() {
      if (this.howler.playing()) {
        this.progressThrottle();
        this.saveCurrentTimeThrottle();
      }
      requestAnimationFrame(this.step);
    },
    endCb() {
      // todo update 听歌记录
      this.playNext();
    },
    initMediaSession() {
      // https://developers.google.com/web/updates/2017/02/media-session
      if ('mediaSession' in navigator) {
        /* global MediaMetadata */
        navigator.mediaSession.metadata = new MediaMetadata({
          title: this.track.name,
          artist: this.track.ar?.[0]?.name,
          album: this.track.al?.name,
          artwork: [
            {
              src: this.albumPicUrl,
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        });
        [
          ['play', this.playPause],
          ['pause', this.playPause],
          ['previoustrack', this.playPrev],
          ['nexttrack', this.playNext],
        ].map(([name, fn]) =>
          navigator.mediaSession.setActionHandler(name, fn),
        );
      }
    },
    saveCurrentTime() {
      localStorage.setItem('currentTime', this.currentTime);
    },
    saveToRecent() {
      this.$store.dispatch('music/pushRecent', this.track.id);
    },
  },
};
