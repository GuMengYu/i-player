<template>
  <v-sheet>
    <div v-if="loading">
      <cover-row-skeleton type="image" />
      <cover-row-skeleton :cols="4" type="chip" />
      <cover-row-skeleton :cols="3" grid="C" />
      <cover-row-skeleton type="image" />
    </div>
    <div v-else>
      <custom-col
        :title="$t('main.new_releases_album')"
        subtitle="new release"
        more="/new_releases/albums"
      >
        <carousel>
          <cover
            v-for="release in newRelease"
            :key="release.id"
            :data="release"
          />
        </carousel>
      </custom-col>
      <custom-col
        class="mt-4"
        :title="$t('main.moods_genres')"
        subtitle="moon"
        more="/moods_and_genres/"
      >
        <carousel :rows="3" grid-style="B">
          <m-tag
            v-for="tag in tags"
            :key="tag.name"
            :name="tag.name"
            :color="tag.color"
            class="my-2"
          />
        </carousel>
      </custom-col>
      <custom-col
        class="mt-4"
        :title="$t('main.new_releases_mv')"
        subtitle="videos"
        more="/new_releases/videos/"
      >
        <carousel grid-style="C">
          <video-cover v-for="mv in mvs" :key="mv.id" :data="mv" />
        </carousel>
      </custom-col>
      <custom-col
        class="mt-4"
        :title="$t('main.leader_board')"
        subtitle="charts"
        more="/leader_board/"
      >
        <carousel>
          <cover v-for="top in topList" :key="top.id" :data="top" />
        </carousel>
      </custom-col>
    </div>
  </v-sheet>
</template>
<script>
import { getCatList, newAlbums, getNewMv, getTopList } from '@/api';
import CustomCol from '@components/layout/Col';
import { random, filter } from 'lodash-es';
import MTag from '@components/app/Tag';
import VideoCover from '@components/app/VideoCover';
import CoverRowSkeleton from '@components/skeleton/CoverRowSkeleton';
import { getColorTable } from '@/util/metadata';
import Carousel from '@components/layout/Carousel';
import Cover from '@components/app/Cover';
export default {
  components: {
    Cover,
    Carousel,
    CoverRowSkeleton,
    CustomCol,
    MTag,
    VideoCover,
  },
  data() {
    return {
      newRelease: [],
      tags: [],
      mvs: [],
      topList: [],
      loading: false,
      colors: Object.values(getColorTable() ?? {}) ?? [],
    };
  },
  created() {
    this.fetch();
  },
  methods: {
    async fetch() {
      this.loading = true;
      const [
        { sub },
        { albums },
        { data: mvs },
        { list: topList },
      ] = await Promise.all([
        getCatList(),
        newAlbums({ limit: 6 }),
        getNewMv({ limit: 4 }),
        getTopList(),
      ]);
      this.tags = sub.slice(0, 18).map((i) => {
        i.color = this.colors[random(0, this.colors.length)];
        return i;
      });
      this.newRelease = albums;
      this.mvs = mvs;
      this.topList = filter(topList, (i) =>
        [60198, 11641012, 180106, 19723756, 2884035, 5059661515].includes(i.id),
      );
      // const groups = groupBy(sub, 'category');
      this.loading = false;
    },
  },
};
</script>
<style scoped lang="scss">
.moods_tag {
  width: 100%;
  border-left: 6px solid red;
}
</style>
