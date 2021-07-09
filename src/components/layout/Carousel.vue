<template>
  <v-hover v-slot="{ hover }">
    <div class="shelf-grid" :data-grid="gridStyle" v-resize.self="onResize">
      <div class="shelf-grid-nav">
        <v-btn
          fab
          x-small
          color="white"
          class="previous-items-btn carousel"
          @click="scrollTo(true)"
          v-show="showPrevious && hover"
        >
          <v-icon color="black">
            {{ mdiChevronLeft }}
          </v-icon>
        </v-btn>
        <v-btn
          fab
          x-small
          color="white"
          class="next-items-btn carousel"
          @click="scrollTo(false)"
          v-show="showNext && hover"
        >
          <v-icon color="black">
            {{ mdiChevronRight }}
          </v-icon>
        </v-btn>
      </div>
      <div class="shelf-grid-body">
        <ul
          ref="coverCardList"
          class="shelf-grid__list px-0 py-1"
          :style="`--grid-rows: ${rows}; --grid-column-gap: 20px;`"
          v-scroll.self="onScroll"
        >
          <slot></slot>
        </ul>
      </div>
    </div>
  </v-hover>
</template>

<script>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { throttle } from 'lodash-es';

export default {
  name: 'Carousel',
  props: {
    rows: {
      type: Number,
      default: 1,
    },
    gridStyle: {
      type: String,
      default: 'B',
    },
  },
  data() {
    return {
      mdiChevronRight,
      mdiChevronLeft,
      scrollLeft: 0,
      scrollWidth: 0,
      clientWidth: 0,
      resizeThrottle: null,
    };
  },
  methods: {
    scrollTo(forward) {
      const container = this.$refs['coverCardList'];
      this.goto(container, forward ? 0 : this.overflowX);
    },
    goto(container, targetLocation) {
      const startTime = performance.now();
      const startLocation = container.scrollLeft;

      const ease = (t) =>
        t < 0.5 ? 4 * t ** 3 : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

      return new Promise((resolve) =>
        requestAnimationFrame(function step(currentTime) {
          const timeElapsed = currentTime - startTime;
          const progress = Math.abs(Math.min(timeElapsed / 500, 1));

          container.scrollLeft = Math.floor(
            startLocation + (targetLocation - startLocation) * ease(progress),
          );

          const clientWidth = container.clientWidth;
          if (
            progress === 1 ||
            clientWidth + container.scrollLeft === container.scrollWidth
          ) {
            return resolve(targetLocation);
          }

          requestAnimationFrame(step);
        }),
      );
    },
    onScroll(e) {
      this.scrollLeft = e.target.scrollLeft;
    },
    onResize(e) {
      this.resizeThrottle?.(e);
    },
    init() {
      console.debug('init carousel');
      this.$nextTick(() => {
        this.scrollWidth = this.$refs['coverCardList'].scrollWidth;
        this.clientWidth = this.$refs['coverCardList'].clientWidth;
      });
    },
  },
  computed: {
    overflowX() {
      return this.scrollWidth - this.clientWidth;
    },
    showPrevious() {
      return this.scrollLeft > 0 && this.scrollWidth > this.clientWidth;
    },
    showNext() {
      return (
        this.scrollWidth > this.clientWidth &&
        (this.scrollLeft === 0 ||
          this.scrollLeft + this.clientWidth < this.scrollWidth)
      );
    },
  },
  mounted() {
    this.init();
    this.resizeThrottle = throttle(this.init, 1000, {
      leading: false,
      trailing: true,
    });
  },
  updated() {
    this.init();
  },
};
</script>

<style scoped lang="scss">
@mixin --grid-rows-gap-columns($cols) {
  grid-template-rows: repeat(var(--grid-rows), max-content);
  grid-column-gap: var(--grid-column-gap);
  grid-auto-columns: calc(
    (100% - #{$cols - 1} * var(--grid-column-gap)) / #{$cols}
  );
}

.shelf-grid__list {
  // xs
  @media (max-width: 599px) {
    [data-grid='A'] & {
      @include --grid-rows-gap-columns(1);
    }
    [data-grid='C'] & {
      @include --grid-rows-gap-columns(1);
    }
    [data-grid='B'] & {
      @include --grid-rows-gap-columns(2);
    }
    [data-grid='1-1-2-3'] & {
      @include --grid-rows-gap-columns(1);
    }
  }
  // sm
  @media (min-width: 600px) and (max-width: 959px) {
    [data-grid='A'] & {
      @include --grid-rows-gap-columns(2);
    }
    [data-grid='C'] & {
      @include --grid-rows-gap-columns(1);
    }
    [data-grid='B'] & {
      @include --grid-rows-gap-columns(3);
    }
    [data-grid='1-1-2-3'] & {
      @include --grid-rows-gap-columns(1);
    }
  }
  // md
  @media (min-width: 960px) and (max-width: 1263px) {
    [data-grid='A'] & {
      @include --grid-rows-gap-columns(3);
    }
    [data-grid='C'] & {
      @include --grid-rows-gap-columns(2);
    }
    [data-grid='B'] & {
      @include --grid-rows-gap-columns(4);
    }
    [data-grid='1-1-2-3'] & {
      @include --grid-rows-gap-columns(1);
    }
  }
  // lg
  @media (min-width: 1264px) and (max-width: 1904px) {
    [data-grid='A'] & {
      @include --grid-rows-gap-columns(4);
    }
    [data-grid='C'] & {
      @include --grid-rows-gap-columns(3);
    }
    [data-grid='B'] & {
      @include --grid-rows-gap-columns(5);
    }
    [data-grid='1-1-2-3'] & {
      @include --grid-rows-gap-columns(2);
    }
  }
  // xl
  @media screen and (min-width: 1905px) {
    [data-grid='A'] & {
      @include --grid-rows-gap-columns(5);
    }
    [data-grid='B'] & {
      @include --grid-rows-gap-columns(6);
    }
    [data-grid='C'] & {
      @include --grid-rows-gap-columns(4);
    }
    [data-grid='1-1-2-3'] & {
      @include --grid-rows-gap-columns(3);
    }
  }
}
.shelf-grid {
  position: relative;
  .shelf-grid__list {
    display: grid;
    grid-auto-flow: column;
    overflow: hidden;
    overflow-x: scroll;
    white-space: nowrap;
    &::-webkit-scrollbar {
      height: 0;
    }
  }
  .shelf-grid-nav {
    .carousel {
      position: absolute;
      z-index: 10;
      top: calc(50% - 32px);
    }
    .next-items-btn {
      right: 0;
      transform: translateX(50%);
    }
    .previous-items-btn {
      left: 0;
      transform: translateX(-50%);
    }
  }
}
</style>
