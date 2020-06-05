<script>
  import { assign, keys, get, invert, isNumber } from 'lodash';

  import config from '@/helpers/config';
  import { PERMISSION_LEVEL_MAP } from '@/helpers/constants';

  const INVERTED_PERMISSION_LEVEL_MAP = invert(PERMISSION_LEVEL_MAP);

  export default {
    name: 'Filters',
    props: ['adminFilters', 'defaultFilters', 'userFilters', 'filterStream$'],
    watch: {
      // Since the state for the filters is so obfuscated by all the weird stuff going on here, this
      // updates the selection if adminFilters changes. This allows the appearance of the filter
      // to update when the back button is pressed.
      adminFilters() {
        this.userSelection = this.updateFilterSelections();
      },
    },
    data() {
      return {
        mappedFilters: this.userFilters.map(this.mapFilterObject),
        userSelection: this.updateFilterSelections(),
      };
    },
    methods: {
      updateFilterSelections() {
        return {
          ...this.userFilters.reduce((carry, filterKey) => {
            const userSelection = get(this, `userSelection[${filterKey}]`, []);
            const appStateSelection = get(this, `adminFilters[${filterKey}]`, []);
            const defaultSelection = get(this, `defaultFilters[${filterKey}]`, []);
            let displayedFilterState = appStateSelection;
            // If the user unchecks all the options of an admin-limited subset of filters, keep
            // the display consistent. Otherwise, all checkboxes would become checked.
            if (appStateSelection.length === defaultSelection.length && !userSelection.length) {
              displayedFilterState = [];
            }
            return assign({}, carry, { [filterKey]: displayedFilterState });
          }, {}),
        };
      },
      /**
       * This function normalized postTypes and filters to the same structure
       * @param filterName {string} the name of a filter (e.g. 'postType', 'aa_books', etc)
       * @return {object} standardized object with available options
       */
      mapFilterObject(filterName) {
        const presetOptions = get(this, `adminFilters[${filterName}]`, []);

        // Post types are "special" so handle them separately
        if (filterName === 'postType') {
          // Use the admin selected options if present, otherwise present all options
          const options = presetOptions.length
            ? presetOptions.map(name => ({
              name,
              label: get(config, `postTypeLabels[${name}].name`),
            }))
            : keys(config.postTypeLabels).map(postTypeKey => ({
              name: postTypeKey,
              label: get(config, `postTypeLabels[${postTypeKey}].name`),
            }));

          return {
            name: 'Type',
            key: filterName,
            options,
          };
        }

        // Use the admin selected options if present, otherwise present all options
        let options = presetOptions.length
          ? presetOptions
          : get(config, `taxonomies[${filterName}].terms`, []);

        options = filterName === 'permissionLevel'
          // Permission level values are int val sas opposed to labels, map the label to the val
          ? options.map((name) => {
            const value = isNumber(name) ? name : PERMISSION_LEVEL_MAP[name];
            const label = isNumber(name) ? INVERTED_PERMISSION_LEVEL_MAP[name] : name;
            return {
              label,
              name: value,
            };
          })
          : options.map(name => ({ name, label: name }));

        const taxonomyData = get(config, `taxonomies[${filterName}]`, false);
        return taxonomyData ? {
          name: taxonomyData.label,
          key: filterName,
          options,
        } : null;
      },
    },
  };
</script>

<template>
  <div class="aa-search-filters">
    <div
      class="aa-search-filters__group"
      :data-filter-key="filter.key"
      :key="filter.key"
      v-for="filter in mappedFilters"
    >
      <h2 class="aa-search-filters__name">{{filter.name}}</h2>
      <ul class="aa-search-filters__checklist">
        <li
          class="aa-search-filters__checklist-item"
          v-for="option in filter.options"
        >
          <label class="aa-search-filters__label">
            <input
              type="checkbox"
              class="aa-search-filters__checkbox"
              :id="`${filter.key}_${option.name}`"
              :value="option.name"
              v-model="userSelection[filter.key]"
              v-stream:change="{ subject: filterStream$, data: userSelection }"
            />
            <span>{{option.label}}</span>
          </label>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
  .aa-search-filters {
    display: flex;
    flex-direction: column;
    background-color: rgba(238, 238, 238, 0.38);
    border-radius: 5px;
    padding: 13px 15px 0;
    &__group {
      margin-bottom: 25px; // Can't use :last-child because of flex order
      &[data-filter-key="postType"] { order: 1; }
    }
    &__name {
      border-bottom: 1px solid #EEE;
      font-size: 20px;
      margin: 0 0 10px;
      padding-bottom: 10px;
    }
    &__checklist {
      line-height: 1;
      margin: 0;
      padding: 0;
    }
    &__checklist-item {
      list-style-type: none;
    }
  }
</style>
