<template>
  <v-navigation-drawer
    permanent
    class="nav"
    app
    fixed
    :mini-variant="drawermini"
  >
    <v-list nav dense class="system_nav">
      <v-list-item
        class="d-flex px-0 drag-area"
        :class="drawermini ? 'justify-center' : 'justify-end'"
      >
        <download-progress />
        <reload-btn class="no-drag-area" />
        <b-f class="no-drag-area" />
      </v-list-item>
      <v-list-item
        class="d-flex"
        :class="drawermini ? 'justify-center' : 'justify-space-between'"
      >
        <default-account :class="drawermini ? 'mb-4' : undefined" />
        <div class="nav_actions">
          <setting-toggle />
          <theme-toggle />
        </div>
      </v-list-item>
      <v-list-item-group>
        <v-subheader
          v-show="!drawermini"
          class="font-weight-bold text-uppercase"
        >
          {{ $t('main.nav.music') }}
        </v-subheader>
        <default-list-item v-for="i in defaultNav1" :key="i.title" :item="i" />
        <v-subheader
          v-show="!drawermini"
          class="font-weight-bold text-uppercase"
        >
          {{ $t('main.nav.library') }}
        </v-subheader>
        <default-list-item v-for="i in defaultNav2" :key="i.title" :item="i" />
      </v-list-item-group>
    </v-list>
    <default-list v-show="!drawermini" :items="nav" />
  </v-navigation-drawer>
</template>

<script>
import {
  mdiRadio,
  mdiPlaylistMusicOutline,
  mdiAlbum,
  mdiMusicNoteHalfDotted,
  mdiLibrary,
  mdiRadioFm,
  mdiAppleFinder,
  mdiChevronLeft,
  mdiChevronRight,
  mdiHandHeart,
  mdiMagnify,
} from '@mdi/js';
import DefaultList from '@components/default/List';
import { sync, get } from 'vuex-pathify';
import { groupBy, filter } from 'lodash';
import DefaultListItem from '@components/default/ListItem';
import SettingToggle from '@components/layout/SettingToggle';
import DefaultAccount from '@components/app/Account';
import ThemeToggle from '@components/layout/ThemeToggle';
import BF from '@components/layout/BF';
import ReloadBtn from '@components/layout/ReloadBtn';
import DownloadProgress from './DownloadProgress.vue';
export default {
  name: 'DefaultNavBar',
  components: {
    ReloadBtn,
    BF,
    ThemeToggle,
    DefaultAccount,
    SettingToggle,
    DefaultListItem,
    DefaultList,
    DownloadProgress,
  },
  data: function () {
    const _t = (key) => this.$i18n.t(`main.nav.${key}`);
    return {
      icon: { mdiChevronLeft, mdiChevronRight, mdiMagnify },
      defaultNav1: [
        {
          icon: mdiMusicNoteHalfDotted,
          val: 'discover',
          title: _t('discover'),
          to: '/discover',
        },
        {
          icon: mdiAppleFinder,
          val: 'explore',
          title: _t('explore'),
          to: '/explore',
        },
        {
          icon: mdiHandHeart,
          val: 'daily',
          title: _t('daily'),
          to: '/daily',
        },
      ],
      defaultNav2: [
        {
          icon: mdiLibrary,
          val: 'stars',
          title: _t('stars'),
          to: '/library',
        },
        // { icon: mdiAlbum, val: 'cloud_disk', title: _t('disk'), to: '/cloud_disk' },
        // { icon: mdiRadio, val: 'radio', title: _t('radio'), to: '/radio' },
      ],
      defaultNav3: [],
      defaultNav: [
        { title: _t('music'), heading: 'Music' },
        {
          icon: mdiMusicNoteHalfDotted,
          val: 'discover',
          title: _t('discover'),
          to: '/discover',
        },
        {
          icon: mdiAppleFinder,
          val: 'explore',
          title: _t('explore'),
          to: '/explore',
        },
        { icon: mdiRadioFm, val: 'fm', title: _t('fm'), to: '/fm' },
        {
          icon: mdiHandHeart,
          val: 'daily',
          title: _t('daily'),
          to: '/daily',
        },
        { title: _t('library'), heading: 'Library' },
        {
          icon: mdiLibrary,
          val: 'stars',
          title: _t('stars'),
          to: '/library',
        },
        { icon: mdiAlbum, val: 'disk', title: _t('disk'), to: '/disk' },
        {
          icon: mdiRadio,
          val: 'radio',
          title: _t('radio'),
          to: '/radio',
        },
      ],
      mini: true,
    };
  },
  computed: {
    drawermini: sync('app/drawermini'),
    isMobile() {
      return this.$vuetify.breakpoint.mobile;
    },
    playlist: get('music/playlist'),
    nav() {
      const { false: created, true: subscribed } = groupBy(
        this.playlist,
        'subscribed',
      );
      const create = created?.length
        ? {
            title: this.$t('main.nav.created_list'),
            open: true,
            items: created.slice(0, 10).map((i) => {
              let title = i.name;
              i['specialType'] === 5 && (title = this.$t('main.my_fav'));
              return {
                title,
                to: `/playlist/${i.id}`,
                icon: mdiPlaylistMusicOutline,
              };
            }),
          }
        : void 0;
      const sub = subscribed?.length
        ? {
            title: this.$t('main.nav.start_list'),
            open: false,
            items: subscribed.slice(0, 10).map((i) => {
              return {
                title: i.name,
                to: `/playlist/${i.id}`,
                icon: mdiPlaylistMusicOutline,
              };
            }),
          }
        : void 0;
      // this.defaultNav[9].items = this.playlist;
      const _new = filter([create, sub]);
      return this.defaultNav3.concat(_new);
    },
  },
};
</script>
<style lang="scss" scoped>
.v-navigation-drawer {
  bottom: 60px !important;
  //background: linear-gradient(209.21deg, rgb(255, 115, 115) 13.57%, rgb(73, 30, 184) 98.38%);
  ::v-deep .v-navigation-drawer__content {
    &::-webkit-scrollbar {
      width: 0;
    }
  }
  ::v-deep .v-navigation-drawer__border {
    width: 0;
  }
  .system_nav {
    .nav_actions {
      position: absolute;
      right: 0;
    }
    .drag-area {
      -webkit-app-region: drag;
    }
    .no-drag-area {
      -webkit-app-region: no-drag;
    }
  }
  .v-list-item {
    min-height: 32px !important;
  }
}
</style>
