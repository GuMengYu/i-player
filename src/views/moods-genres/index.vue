<template>
  <v-sheet>
    <page :title="$t('main.moods_genres')">
      <custom-col
        v-for="(item, index) in items"
        :key="item.title"
        :class="index !== 0 ? 'mt-4' : void 0"
        :title="item.title"
      >
        <v-row>
          <v-col v-for="tag in item.value" :key="tag.name" cols="2">
            <m-tag :name="tag.name" :color="tag.color" />
          </v-col>
        </v-row>
      </custom-col>
    </page>
  </v-sheet>
</template>
<script>
import { getCatList } from '@/api';
import { groupBy, entries, random } from 'lodash-es';
import CustomCol from '@components/layout/Col';
import MTag from '@components/app/Tag';
import { getColorTable } from '@util/metadata';
import Page from '@components/layout/Page';

export default {
  name: 'MoodsGenres',
  components: {
    Page,
    CustomCol,
    MTag,
  },
  data: () => ({
    items: [],
    colors: Object.values(getColorTable() ?? {}) ?? [],
  }),
  created() {
    this.fetch();
  },
  methods: {
    async fetch() {
      const { sub, categories } = await getCatList();
      const items = sub.map((i) => {
        i.color = this.colors[random(0, this.colors.length)];
        return i;
      });
      const group = groupBy(items, 'category') ?? {};
      this.items = entries(group).map(([k, v]) => ({
        title: categories[k],
        value: v,
      }));
    },
  },
};
</script>
