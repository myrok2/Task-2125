<style lang="scss" scoped>
  .aa-search-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    &__pages {
      display: flex;
      list-style-type: none;
      margin: 0 25px;
      padding: 0;
    }
    &__page {
      flex: 1;
      min-width: 30px;
      text-align: center;
    }
    &__btn {
      width: 34px;
      height: 34px;
      border-radius: 100%;
      outline: none;
      border: none;
      background: #995fb6;
      color: white;
      i {
        font-size: 0;
        &:before {
          font-size: 27px;
        }
      }
      &:disabled {
        background: #DEDEDE;
        color: #B6B6B6;
      }
    }

    .dwls--loading {
      position: relative;

      &:before {
        left: -20px;
      }
    }
  }
</style>

<template>
  <div class="aa-search-pagination" v-if="totalPageCount > 1">
    <div v-observe-visibility="{
        callback: visibilityChanged,
        throttle: 500,
        intersection: {
          threshold,
          rootMargin: '400px 0px 0px 0px',
        },
      }"
         v-if="infiniteScrollOn"></div>
    <div v-if="infiniteScrollOn && (totalPageCount > currentPage)" class="dwls--loading">Loading&hellip;</div>
    <button v-if="!infiniteScrollOn"
      @click="pageChange$.next({ subject: pageChange$, data: currentPage - 1 })"
      :disabled="currentPage === 1"
      class="aa-search-pagination__btn"
    >
      <i class="fa fa-angle-left" aria-hidden="true">Prev</i>
    </button>
    <select v-if="!infiniteScrollOn"
      class="aa-search-pagination__pages"
      title="Jump to a Page"
      :value="currentPage"
      @change="pageChange$.next({ subject: pageChange$, data: $event.target.value })">
      <option v-for="n in totalPageCount" :value="n">
        Page {{n}}
      </option>
    </select>
    <button v-if="!infiniteScrollOn"
      @click="pageChange$.next({ subject: pageChange$, data: currentPage + 1 })"
      :disabled="totalPageCount === currentPage"
      class="aa-search-pagination__btn"
    >
      <i class="fa fa-angle-right" aria-hidden="true">Next</i>
    </button>
  </div>
</template>

<script>
  import { toNumber } from 'lodash';

  export default {
    name: 'Pagination',
    data() {
      return {
        pageJump: this.currentPage,
        isVisible: true,
        throttle: 0,
        threshold: 0,
        hasBeenPulled: false,
      };
    },
    props: {
      pageSize: {
        type: Number,
        default: 9,
      },
      resultCount: {
        type: Number,
        default: 1,
      },
      currentPage: {
        type: Number,
        default: 1,
      },
      maxPages: {
        type: Number,
      },
      pageChange$: Object,
      onPageChange: Function,
      infiniteScrollOn: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      visibilityChanged(isVisible) {
        if (this.infiniteScrollOn) {
          this.isVisible = isVisible;
          // check if the pagination control is coming in or leaving view.
          // also check to see if there isn't already a query going out.
          if (isVisible && !this.promise) {
            this.promise = new Promise((resolve) => {
              this.pageChange$.next({ subject: this.pageChange$, data: this.currentPage + 1 });
              resolve();
            });
            this.promise.then(() => {
              // give the query some time to resolve and display before clearing.
              setTimeout(() => {
                this.promise = null;
              }, 50);
            });
          }
        }
      },
    },
    computed: {
      totalPageCount() {
        const totalPages = Math.ceil(this.resultCount / this.pageSize);
        if (!this.maxPages) {
          return totalPages;
        }
        return totalPages <= toNumber(this.maxPages) ? totalPages : toNumber(this.maxPages);
      },
    },
  };
</script>
