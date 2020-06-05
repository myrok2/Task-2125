<script>
  import { merge } from 'rxjs/observable/merge';
  import { Observable } from 'rxjs/Observable';
  import { assign, debounce, get, keys, mapValues, includes, intersection, values, toNumber, uniq } from 'lodash';
  import qs from 'querystring';
  import LocationBar from 'location-bar';
  import jsURL from 'jsurl';

  import { debouncedGA, query } from '@/helpers/api';
  import { debugLog, debugTable } from '@/helpers/log';
  import { PERMISSION_LEVEL_MAP } from '@/helpers/constants';
  import config from '@/helpers/config';
  import Filters from '@/components/Filters';
  import Loading from '@/components/Loading';
  import SearchInput from '@/components/SearchInput';
  import ResultCard from '@/components/ResultCard';
  import Pagination from '@/components/Pagination';

  const GENERIC_ERROR = 'An error has occurred. Please try again.';

  const fromConfig = (...args) => get(config, ...args);
  const locationBar = new LocationBar();
  // Debouncing to prevent too many browser history entries from getting set as the user is typing
  const updateUrl = debounce(path => locationBar.update(path, { trigger: false }), 750);

  // Emits search queries as they are inputted by the user
  function searchInput$(rxSubject) {
    return rxSubject
      .pluck('event', 'target', 'value')
      // Allow search to be cleared out but prevent searches with 1-2 chars
      .filter(t => t.length > 2 || t.length === 0)
      .debounceTime(200)
      .distinctUntilChanged()
      .do((searchTerm) => {
        this.query.page = 1;
        if (window.isAASiteSearch) {
          document.title = `${searchTerm} | Agile Alliance`;
        }
      })
      .startWith(this.query.searchTerm)
      .map(searchTerm => ({ searchTerm }));
  }

  // Triggered by presses to the prev/next button as well as changes to the page dropdown
  function pageChange$(rxSubject) {
    return rxSubject
      .pluck('data')
      .do((page) => {
        if (!this.infiniteScrollOn) {
          this.scrollUp();
        }
        this.query.page = toNumber(page);
      })
      .startWith(this.query.page)
      .map(page => ({ page }));
  }

  // Triggered by any change to filter checkboxes to the left of the search results
  function filterChange$(rxSubject) {
    /**
     * Filters can applied in a few different ways:
     *
     * 1. Set by the admin, invisible to the user and applied to every query
     * 2. Visible to the user but only as a subset of all available options
     *    - The user can select from the available options but if they don't
     *      select an option then they should only see content within the subset.
     * 3. Visible to the user will all options available
     *
     * This mapping function ensures that the above criteria is upheld.
     */
    const mergeAdminFilters = (setFilters) => {
      const { userFilters, defaultFilters } = this;
      const allPossibleFilters = uniq([
        ...userFilters,
        ...keys(defaultFilters),
      ]);
      return allPossibleFilters.reduce((carry, filterKey) => {
        const isUserAllowedToFilter = includes(userFilters, filterKey);
        const adminFilters = defaultFilters[filterKey] || [];
        const requestedFilters = setFilters[filterKey] || [];

        // Handy booleans to make the condition below more readable
        const hasAdminFilters = !!adminFilters.length;
        const hasUserFilters = !!requestedFilters.length;

        const mergedFilter = {};

        // Using an else-if chain here because I feel it makes the different options easier to follow
        if (!isUserAllowedToFilter) {
          // The filter is unavailable to the user, use the admin's
          mergedFilter[filterKey] = adminFilters;
        } else if (hasAdminFilters && hasUserFilters) {
          // The admin allowed a subset, only permit filters from the user that are within it
          mergedFilter[filterKey] = intersection(adminFilters, requestedFilters);
        } else if (hasAdminFilters && !hasUserFilters) {
          // The user has cleared all filters, fallback to the admin's (or none if none were set)
          mergedFilter[filterKey] = adminFilters;
        } else {
          // The admin hasn't set any filters, use the user's implicitly
          mergedFilter[filterKey] = requestedFilters;
        }

        return assign({}, carry, mergedFilter);
      }, setFilters);
    };

    return rxSubject
      .pluck('data')
      .debounceTime(200)
      .do(() => { this.query.page = 1; })
      .map(mergeAdminFilters.bind(this))
      .startWith(this.query.filters)
      .map(filters => ({ filters }));
  }

  // Not exposed as UI control but implemented this way in case it ever needs to be
  function sortChange$(rxSubject) {
    return rxSubject
      .startWith(this.query.sort)
      .map(sort => ({ sort }));
  }

  // Not exposed as UI control but implemented this way in case it ever needs to be
  function sortDirectionChange$(rxSubject) {
    return rxSubject
      .startWith(this.query.sortDirection)
      .map(sortDirection => ({ sortDirection }));
  }

  function mapFilters(rawValues) {
    // Some keys are objects and others arrays, mapValues should normalize them to all be arrays
    const filterValues = mapValues(rawValues, values);
    if (filterValues.permissionLevel) {
      filterValues.permissionLevel = filterValues.permissionLevel
        .map(n => PERMISSION_LEVEL_MAP[n]);
    }
    return filterValues;
  }

  export default {
    components: {
      Filters,
      Loading,
      Pagination,
      ResultCard,
      SearchInput,
    },
    data() {
      return {
        error: null,
        isLoading: true,
        result: {},
        maxPages: toNumber(fromConfig('ui.maxPages', 0)),
        displayTextSearch: fromConfig('ui.displayTextSearch', false),
        // An array of the taxonomies the user is permitted to filter by
        userFilters: fromConfig('ui.filters', []),
        infiniteScrollOn: fromConfig('ui.displayInfiniteScroll', false),
        /*
         * While initially a duplicate of `query.filters` below, this copy should be treated as
         * immutable in order to properly merge user selection with admin filters in
         * the `filterChange$` func above
         */
        defaultFilters: mapFilters(fromConfig('query.filters', {})),
        /*
         * A new search is executed whenever this property is set. There is a watch set
         * up in the mounted() hook of this component. Look for `this.$watchAsObservable('query')`
         */
        query: {
          infinite: fromConfig('ui.displayInfiniteScroll', false),
          filters: mapFilters(fromConfig('query.filters', {})),
          searchTerm: fromConfig('query.initialQuery', '').replace(/&#34;/g, '"'),
          sort: fromConfig('query.sort', false),
          sortDirection: fromConfig('query.sortDirection', 'asc'),
          page: 1,
        },
      };
    },
    // Each of these created by VueRx and available in component, they are RxJS Observables
    domStreams: ['searchTerm$', 'pageChange$', 'filters$', 'sortChange$', 'sortDirectionChange$'],
    created() {
      // Emits objects based on whatever changed (eg. `{searchTerm: 'thing' }`)
      const userInput$ = merge(
        searchInput$.call(this, this.searchTerm$),
        pageChange$.call(this, this.pageChange$),
        sortChange$.call(this, this.sortChange$),
        sortDirectionChange$.call(this, this.sortDirectionChange$),
        filterChange$.call(this, this.filters$),
      )
        // Take the new property and merge it with the rest of the query
        .map(changedThing => assign({}, this.query, changedThing));

      // Watch the URL bar to update state if back/forward is pressed
      const locationBar$ = Observable
        .create(observer => locationBar.onChange(observer.next.bind(observer)))
        .map((path) => {
          const queryString = get(qs.parse(path), 'q');
          if (!queryString) {
            return this.query;
          }
          return jsURL.tryParse(queryString, this.query);
        });

      /*
       * By merging the user input and location bar observables, both are treated equally with
       * respect to updating the query object. By overwriting `this.query` each time on each
       * user input or location bar change, the watch defined below  in the mounted() hook
       * `this.$watchAsObservable('query')` reactively fires a new search.
       */
      merge(userInput$, locationBar$)
        .subscribe(
          (q) => { this.query = q; },
          e => debugLog(e),
        );
    },
    mounted() {
      // Watch the address bar for changes
      // https://www.npmjs.com/package/location-bar
      locationBar.start({
        pushState: false,
        silent: false,
      });
      this.scroll();
      /*
       * This observable kicks off all queries to ElasticSearch. The search should be kicked
       * off reactively, anytime `this.query` is set
       */
      this.$watchAsObservable('query')
        .map(({ newValue }) => newValue)
        .do((searchParams) => {
          this.isLoading = true;
          if (config.debugMode) {
            // eslint-disable-next-line
            console.groupCollapsed(JSON.parse(JSON.stringify(searchParams)));
          }
        })
        .startWith(this.query)
        .flatMap(query)
        .pluck('data')
        .map((res) => {
          // The PHP script doesn't return an error code when ES returns an error
          if (res.error) {
            // Throw with ES error if present
            throw new Error(res.error);
          }
          return res;
        })
        .pluck('hits')
        .subscribe(
          (result) => {
            // Update hash with query state (this is debounced so will only happen after a delay)
            updateUrl(`q=${jsURL.stringify(this.query)}`);
            if (window.ga && this.searchTerm && this.result) {
              const trackArgs = ['send', 'pageview', `${location.pathname}?s=${this.searchTerm}`];
              debugLog('[GA]', ...trackArgs);
              debouncedGA(...trackArgs);
            }
            // This generates all that console.table stuff seen during local development
            if (config.debugMode) {
              debugLog('Search: Response', JSON.parse(JSON.stringify(result)));
              if (result.hits && result.hits.length) {
                const results = JSON.parse(JSON.stringify(result.hits));
                debugTable(results.map(({ _index, _score, _source }) => ({
                  _index,
                  _score,
                  ..._source,
                })), [
                  '_index', '_score', 'id', 'name', 'postType', 'permissionLevel',
                ]);
              }
              // eslint-disable-next-line
              console.groupEnd();
            }
            this.isLoading = false;
            if (result && !result.error) {
              this.result = result;
              this.error = null;
            } else {
              this.result = {};
              this.error = GENERIC_ERROR;
            }
          },
          (error) => {
            debugLog(error);
            this.isLoading = false;
            this.error = GENERIC_ERROR;
          },
        );
    },
    methods: {
      scrollUp() {
        this.$scrollTo('#aa-search', 1000, { offset: -80 });
      },
      scroll() {
        window.onscroll = () => {
          const bottomOfWindow = document.documentElement.scrollTop +
            window.innerHeight === document.documentElement.offsetHeight;

          if (bottomOfWindow) {
            // eslint-disable-next-line
            console.log('end');
          }
        };
      },
    },
    computed: {
      isSidebarVisible() {
        return !!this.userFilters.length;
      },
      pageAsNumber() {
        return toNumber(this.query.page);
      },
    },
  };
</script>

<template>
  <div
    id="aa-search"
    :class="[
      'aa-search',
      `aa-search--${isSidebarVisible ? 'sidebar' : 'no-sidebar'}`,
    ]"
  >
    <SearchInput
      v-if="displayTextSearch"
      :search-term="query.searchTerm"
      :input-stream="searchTerm$"
    ></SearchInput>
    <div class=aa-search__display>
      <div class="aa-search__result-header">
        <small v-if="result.hits">
          Displaying {{result.hits.length}} of {{result.total}} resources {{ infiniteScrollOn ? '' : '(Page ' + query.page + ')' }}
        </small>
      </div>
      <div class="aa-search__body">
        <div
          class="aa-search__sidebar"
          v-if="isSidebarVisible">
          <Filters
            :admin-filters="query.filters"
            :default-filters="defaultFilters"
            :filter-stream$="filters$"
            :user-filters="userFilters"
          ></Filters>
        </div>
        <div class="aa-search__results-wrapper" v-if="isLoading || result.total">
          <transition name="loading">
            <div class="aa-search__loading" v-if="isLoading && !infiniteScrollOn">
              <Loading></Loading>
            </div>
          </transition>
          <ul class="aa-search__results">
            <ResultCard
              v-for="result in result.hits"
              :key="result._id"
              :result="result._source"
            ></ResultCard>
          </ul>
          <Pagination
            :current-page="pageAsNumber"
            :result-count="result.total"
            :page-change$="pageChange$"
            :max-pages="maxPages"
            :infiniteScrollOn="infiniteScrollOn"
          ></Pagination>
        </div>
        <div class="aa-search__message" v-else-if="result.total === 0">
          <h1>No Results Found.</h1>
        </div>
        <div class="aa-search__message" v-else-if="error">
          <h1>{{error}}</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  $grid-gap: 25px;
  $sidebar-width: 250px;
  $single-column-breakpoint: 575px;

  .aa-search {
    max-width: 100%;
    margin: 0 auto;
    min-height: 500px;
    padding: 25px 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    &__display {
      position: relative;
    }
    &__result-header {
      border-bottom: 1px solid #EEE;
      margin-bottom: $grid-gap;
      padding-bottom: $grid-gap;
    }
    &__body {
      display: flex;
      /*overflow-x: hidden; Causing layout issues with lazy loading search results in Chrome. */
      @media screen and (max-width: $single-column-breakpoint) {
        flex-direction: column;
      }
    }
    &__sidebar {
      min-width: $sidebar-width;
      @media screen and (min-width: #{$single-column-breakpoint - 1}) {
        max-width: $sidebar-width;
      }
    }
    &__message {
      flex: 1;
      text-align: center;
    }
    &__results-wrapper {
      width: 100%;
      padding-left: $grid-gap;
      position: relative;
    }
    &__results {
      align-items: stretch;
      justify-content: flex-start;
      display: flex;
      flex-wrap: wrap;
      padding: 0;
      @media screen and (min-width: #{$single-column-breakpoint - 1}) {
        margin: 0 #{-($grid-gap / 2)};
      }
      list-style-type: none;
      text-align: left;
      > li {
        flex: 1 1 auto;
        margin: 0 #{$grid-gap / 2} $grid-gap;
        max-width: 100%;
        flex-basis: 100%;
      }
    }
    &.aa-search--no-sidebar {
      .aa-search__results-wrapper {
        padding: 0;
      }
    }
    &.aa-search--sidebar {
      .aa-search__results-wrapper {
        max-width: calc(100% - #{$sidebar-width});
        @media screen and (max-width: $single-column-breakpoint) {
          max-width: none;
          padding: 0;
        }
      }
    }
  }
  .aa-search__results > li {
    @mixin gridResponsiveness($media-query-offset: 0px) {
      @media screen and (min-width: #{1080px + $media-query-offset}) {
        $target-width: calc((100% / 3) - #{$grid-gap});
        flex-basis: $target-width;
        max-width: $target-width;
        min-height: 340px;
      }
      @media screen and (min-width: #{730px + $media-query-offset}) and (max-width: #{1079px + $media-query-offset}) {
        $target-width: calc((100% / 2) - #{$grid-gap});
        flex-basis: $target-width;
        max-width: $target-width;
      }
    }
    .aa-search--sidebar & {
      @include gridResponsiveness($sidebar-width);
    }
    .aa-search--no-sidebar & {
      @include gridResponsiveness();
    }
  }
  .aa-search__loading {
    position: absolute;
    background: rgba(255, 255, 255, 0.9);
    display: block;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
  }
  .loading-enter-active, .loading-leave-active {
    transition: opacity .5s
  }
  .loading-enter, .fade-leave-to {
    opacity: 0
  }
</style>
