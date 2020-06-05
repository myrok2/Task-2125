<style lang="scss" scoped>
  @import '../assets/sprites/cpt_icons/icons.css';

  $name-line-clamp: 2;
  $name-line-height: 25px;
  $description-line-clamp: 5;
  $description-line-height: 20px;

  @mixin truncate-fade($line-height: 20px, $number-of-lines: 3) {
    &:after {
      content: '';
      text-align: right;
      position: absolute;
      bottom: 0;
      right: 0;
      top: ($number-of-lines - 1) * $line-height;
      width: 70%;
      height: $line-height + 3; // Added bump to height to cover any descenders on the text being overlaid
      background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 50%);
    }
  }
  .wrap {
    display: flex;
    padding-top: 0;
  }
  .aa-result-card {
    align-self: stretch;
    width: 100%;
    border: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    text-decoration: none;
    transition: 0.5s border-color;
    &:not(.aa-result-card--restricted):hover {
      text-decoration: none;
      transition: 0.2s border-color;
      border-color: rgba(0, 0, 0, 0.2);
      box-shadow: 1px 1px 0 0 rgba(0, 0, 0, 0.1);
    }
    > * {
      padding: 0 10px;
    }
    &__image-wrapper,
    &__image {
      padding: 0;
      height: 90px;
      position: relative;
      @media screen and (max-width: 729px) {
        height: auto;
        min-height: 90px;
      }
    }
    &__signup-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    &__image {
      background: white no-repeat;
      background-size: cover;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    &__signup-overlay {
      align-items: center;
      background-color: rgba(0, 0, 0, 0.75);
      display: flex;
      font-size: 16px;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.7);
      p {
        color: white;
        margin: 0;
        line-height: 20px;
        font-size: 1em;
        &.signup-overlay__small {
          font-size: 0.8em;
        }
      }
      a {
        color:white;
        text-decoration: underline;
      }
    }
    &__category {
      background-color: #525151;
      border-top: 4px solid transparent;
      color: white;
      font-size: 12px;
      height: 26px;
      margin-bottom: 15px;
      position: relative;
      text-transform: uppercase;
      span {
        position: relative;
        top: -5px;
      }
      i {
        height: 20px;
        width: 20px;
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto 5px auto;
        transform: scale(0.8);
      }
    }
    &__body {
      display: flex;
      flex-direction: column;
      flex: 2 1 auto;
      padding-bottom: 10px;
    }
    &__meta {
      color: #999999;
      display: flex;
      font-size: 13px;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: space-between;
      margin: 0;
      span, time {
        font-size: 13px;
        height: 15px;
        overflow: hidden;
        line-height: 13px;
      }
      time {
        flex: 1 0 auto;
        text-align: right;
        min-width: 70px;
      }
    }
    &__name,
    &__name-content {
      font-size: 21px;
      line-height: $name-line-height;
      padding-bottom: 3px;
      margin: 0;
    }
    &__name {
      max-height: $name-line-clamp * $name-line-height + 4;
      overflow: hidden;
      position: relative;
      &--overflowing {
        @include truncate-fade($name-line-height, $name-line-clamp);
      }
    }
    &__name-content {
      display: block;
    }
    &__spacer {
      flex: 2 1 auto;
    }
    &__description,
    &__description-content {
      color: #333333;
      font-size: 15px;
      line-height: $description-line-height;
    }
    &__description {
      max-height: $description-line-clamp * $description-line-height + 5;
      overflow: hidden;
      position: relative;
      &--overflowing {
        @include truncate-fade($description-line-height, $description-line-clamp);
      }
    }
    &__description-content {
      display: block;
    }
    &__tags {
      color: #333333;
      justify-self: flex-end;
    }
    &--page,
    &--aa_story,
    &----third-party-event,
    &--aa_organizations,
    &--aa_community_groups {
      .aa-result-card__meta {
        display: none;
      }
    }
    // &__footer {}
  }
</style>

<style lang="scss">
  .tooltip {
    display: none;
    opacity: 0;
    transition: opacity .15s;
    pointer-events: none;
    padding: 4px;
    z-index: 10000;

    .tooltip-content {
      background: #FFFFFF;
      border: 1px solid #999999;
      box-shadow: 0 2px 4px 0 rgba(0,0,0,0.20);
      color: #666666;
      padding: 7px;
      position: relative;
      font-size: 12px;
      &:before {
        content: '';
        position: absolute;
        background-color: white;
        top: 50%;
        width: 11.2px;
        height: 11.2px;
        border: 1px solid transparent;
      }
    }

    &.tooltip-element-attached-left .tooltip-content {
      left: 5px;
      &:before {
        right: 100%;
        left: -5px;
        border-top-color: #a3a3a3;
        border-left-color: #a3a3a3;
        transform: translateY(-50%) rotate(-45deg);
      }
    }

    &.tooltip-element-attached-right .tooltip-content {
      right: 5px;
      &:before {
        left: 100%;
        border-bottom-color: #a3a3a3;
        border-right-color: #a3a3a3;
        transform: translate(-5px, -50%) rotate(-45deg);
      }
    }

    &.tooltip-open-transitionend {
      display: block;
    }

    &.tooltip-after-open {
      opacity: 1;
    }
  }

  // Scoped styles dont work when the targeted markup is injected with `v-html`
  .attachment-aa_search_2x {
    height: auto;
    width: auto;
    .aa-result-card__image--portrait & { height: 100%; }
    .aa-result-card__image--landscape & { width: 100%; }
  }
  .aa-result-card--aa_organizations {
    .aa-result-card__image--portrait .attachment-aa_search_2x {
      width: 90%;
      height: auto;
    }
    .aa-result-card__image--landscape .attachment-aa_search_2x {
      height: 90%;
      width: auto;
    }
  }
</style>

<template>
  <li class="wrap">
    <a :class="[
        'aa-result-card',
        `aa-result-card--${result.postType}`,
        {'aa-result-card--restricted': isRestrictedContent}
      ]"
       :href="isRestrictedContent ? null : result.documentUri"
       @click.prevent="isToolTip">
      <div class="aa-result-card__image-wrapper">
        <div
          :class="[
          'aa-result-card__image',
          `aa-result-card__image--${previewImage ? previewImageOrientation : 'no-image'}`
        ]"
          :style="{ backgroundImage: !previewImage && `url(${placeholderImage})` }"
          v-html="previewImage"
        ></div>
        <div class="aa-result-card__signup-overlay" v-if="isRestrictedContent">
          <img class="signup-overlay__icon" :src="lockIcon" alt="Insufficient Access Level">
          <p class="signup-overlay__big">
            <a :href="'/membership-pricing/?redirect_id=' + result.id">Become a {{requiredUserLevel}}</a> to access
          </p>
          <p class="signup-overlay__small">
            Already a {{requiredUserLevel}}? <a @click="openLoginModal" href="#">Sign In</a>
          </p>
        </div>
      </div>
      <div class="aa-result-card__category" :style="{ borderTopColor: postTypeColor }">
        <span>{{categories}}</span>
        <i :class="iconPath" v-tooltip.right-middle="singularPostTypeName"></i>
      </div>
      <div class="aa-result-card__body">
        <p class="aa-result-card__meta" v-if="isPost || (result.relatedUsers && result.relatedUsers.length)">
          <span>{{authors}}</span>
          <time
            class="aa-result-card__created"
            v-if="isPost"
            :title="formattedDateLong"
            :datetime="result.createdDate"
          >{{formattedDateShort}}</time>
        </p>
        <h2
          ref="name"
          :class="[
            'aa-result-card__name',
            { 'aa-result-card__name--overflowing': isNameOverflowing }
          ]"
          :title="decodeHtml(result.name)"
          :style="{ color: postTypeColor }"
        ><span ref="nameContent" class="aa-result-card__name-content" v-html="result.name"></span></h2>
        <p
          ref="description"
          :class="[
            'aa-result-card__description',
            { 'aa-result-card__description--overflowing': isDescriptionOverflowing }
          ]"
        ><span ref="descriptionContent" class="aa-result-card__description-content" v-html="description"></span></p>
        <div class="aa-result-card__spacer"></div>
        <LimitedList
          class="aa-result-card__tags"
          :items="result.tags"
        ></LimitedList>
      </div>
      <!--<div class="aa-result-card__footer"></div>-->
    </a>
  </li>
</template>

<script>
  import fecha from 'fecha';
  import { debounce, get, includes, toNumber } from 'lodash';

  import { getUserData } from '@/helpers/api';
  import { colorByPostType } from '@/helpers/colors';
  import { getCalcWidth } from '@/helpers/dom';
  import config from '@/helpers/config';
  import LimitedList from './LimitedList';

  const placeholderImage = require('@/assets/images/pixel-placeholder.svg');
  const lockIcon = require('@/assets/images/lock.svg');

  const USER_LEVEL_MAP = {
    0: 'Subscriber',
    1: 'Member',
    2: 'Member',
    fallback: 'Member',
  };

  export default {
    name: 'ResultCard',
    props: ['result'],
    components: {
      LimitedList,
    },
    data() {
      return {
        isDescriptionOverflowing: false,
        isNameOverflowing: false,
        userData: null,
      };
    },
    computed: {
      categories() {
        return this.result.categories ? this.result.categories.join(', ') : '&nbsp;';
      },
      description() {
        const { shortDescription, longDescription } = this.result;
        const text = shortDescription || longDescription;
        return text ? text.replace(/\s+/g, ' ').trim() : '';
      },
      authors() {
        return this.result.relatedUsers ? this.result.relatedUsers.join(', ') : '';
      },
      formattedDateShort() {
        const date = new Date(this.result.createdDate);
        return date ? fecha.format(date, 'shortDate') : '';
      },
      formattedDateLong() {
        const date = new Date(this.result.createdDate);
        return date ? fecha.format(date, 'default') : '';
      },
      iconPath() {
        return `icon-${this.result.postType}`;
      },
      previewImage() {
        const { previewImageUri } = this.result;
        return (previewImageUri && !includes(previewImageUri, 'resource_fallback'))
          ? previewImageUri : '';
      },
      previewImageOrientation() {
        const TARGET_RATIO = 340 / 90;
        const { previewImageUri } = this.result;
        const [, width, height] = previewImageUri.match(/<img width="(\d+)" height="(\d+)"/);
        const ratio = toNumber(width) / toNumber(height);
        return ratio < TARGET_RATIO ? 'landscape' : 'portrait';
      },
      placeholderImage() {
        return placeholderImage;
      },
      isPost() {
        return this.result.postType === 'post';
      },
      postTypeColor() {
        return colorByPostType(this.result.postType);
      },
      singularPostTypeName() {
        return get(config, `postTypeLabels[${this.result.postType}].singular_name`);
      },
      isRestrictedContent() {
        // const resultLevel = this.result.permissionLevel === null
        // ? -1 : this.result.permissionLevel;
        // return this.userAccessLevel < resultLevel;
        // removing this from the app's responsibility
        return false;
      },
      requiredUserLevel() {
        return USER_LEVEL_MAP[this.result.permissionLevel]
          ? USER_LEVEL_MAP[this.result.permissionLevel]
          : USER_LEVEL_MAP.fallback;
      },
      lockIcon() {
        return lockIcon;
      },
      userAccessLevel() {
        if (!this.userData) {
          return -1;
        }
        // Admins should be regarded as level 2 members
        const isAdmin = get(this, 'userData.user.caps.administrator', false);
        return isAdmin ? 2 : get(this, 'userData.permissionLevel', -1);
      },
    },
    methods: {
      openLoginModal() {
        const $ = window.jQuery;
        if (!$) {
          return false;
        }
        $('#loginModal').modal('show');
        return false;
      },
      isOverflowing(parent, child) {
        const parentHeight = getCalcWidth(parent, 'height');
        const contentHeight = getCalcWidth(child, 'height');
        return contentHeight > parentHeight;
      },
      isToolTip(event) {
        const $ = window.jQuery;
        const target = $(event.target);
        const currentTarget = $(event.currentTarget);
        const currentTargetHref = currentTarget.attr('href');
        const { location } = window;
        const targetIsAnchor = target.is('a');
        const targetAnchorHasHref = target.attr('href');
        const targetAnchorHrefIsHash = targetAnchorHasHref === '#';

        if (targetIsAnchor && targetAnchorHasHref) {
          location.href = targetAnchorHasHref;
        } else if (targetIsAnchor && targetAnchorHrefIsHash) {
          target.click();
        } else if (!target.hasClass('limited-list__item--remainder-count') && !target.hasClass('aa-result-card__tags')) {
          if (currentTargetHref) {
            location.href = currentTargetHref;
          }
        }
      },
      decodeHtml(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
      },
    },
    created() {
      this.checkOverflows = debounce(function _checkOverflows() {
        // Evaluate description text
        const { description, descriptionContent } = get(this, '$refs', {});
        this.isDescriptionOverflowing = (description && descriptionContent)
          ? this.isOverflowing(description, descriptionContent)
          : false;
        // Evaluate name text
        const { name, nameContent } = get(this, '$refs', {});
        this.isNameOverflowing = (name && nameContent)
          ? this.isOverflowing(name, nameContent)
          : false;
      }, 500).bind(this);
      getUserData()
        .then(({ payload }) => { this.userData = payload; })
        .catch(() => { this.userData = 'anon'; });
    },
    mounted() {
      this.$nextTick(this.checkOverflows);
      window.addEventListener('resize', this.checkOverflows);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.checkOverflows);
    },
  };

</script>
