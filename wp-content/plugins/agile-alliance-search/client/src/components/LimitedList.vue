<script>
  import { debounce, isArray, some } from 'lodash';
  import { getCalcWidth } from '@/helpers/dom';

  export default {
    name: 'LimitedList',
    props: {
      items: {
        default: [],
        type: Array,
      },
      limit: {
        default: 99,
        type: Number,
      },
    },
    data() {
      return {
        listItems: isArray(this.items) ? this.items : [],
        calculatedLimit: this.limit,
      };
    },
    computed: {
      hasOverflow() {
        return this.listItems.length && this.listItems.length > this.calculatedLimit;
      },
      remainder() {
        return this.listItems.slice(this.calculatedLimit);
      },
    },
    created() {
      this.determineLimit = debounce(function _determineLimit() {
        // Allow all items to display before calculating anything
        this.calculatedLimit = this.limit;
        if (this.$el.children.length >= this.limit) {
          return null;
        }
        let limitCount = 0;
        let totalWidth = 39;
        const targetWidth = getCalcWidth(this.$el);

        some(this.$el.children, (el) => {
          const elWidth = getCalcWidth(el);
          if (targetWidth > (totalWidth + elWidth)) {
            limitCount += 1;
            totalWidth += elWidth;
            return false;
          }
          return true;
        });
        this.calculatedLimit = limitCount;
        return null;
      }, 500).bind(this);
    },
    mounted() {
      this.$nextTick(this.determineLimit);
      window.addEventListener('resize', this.determineLimit);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.determineLimit);
    },
  };
</script>

<template>
  <ul :class="{
    'limited-list': true,
    'limited-list--has-overflow': hasOverflow
  }">
    <li class="limited-list__item" v-for="i in listItems.slice(0, calculatedLimit)">{{i}}</li>
    <li class="limited-list__item limited-list__item--remainder-count" v-if="hasOverflow" v-tooltip.right-middle="remainder.join('<br />')">
      ...+{{remainder.length}}
    </li>
  </ul>
</template>

<style lang="scss" scoped>
  .limited-list {
    padding: 0;
    &__item {
      list-style-type: none;
      font-size: 12px;
      text-indent: 0;
      display: inline-block;
      border: 1px solid #EEE;
      padding: 5px 5px;
      line-height: 12px;
      border-radius: 2px;
      &:not(:last-child) {
        margin-right: 5px;
      }
      &--remainder-count {
        background-color: #525151;
        color: white;
      }
    }
  }
</style>
