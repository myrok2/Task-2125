<template>
  <div class="search-input">
    <input
      class="search-input__field"
      type="text"
      :value="searchTerm"
      v-stream:input="inputStream"
      @focus="selectAll"
      @keyup.enter="blurInput"
      placeholder="Search"
    >
  </div>
</template>

<script>
  export default {
    name: 'SearchInput',
    props: [
      'searchTerm',
      'inputStream',
    ],
    methods: {
      selectAll(event) {
        setTimeout(() => {
          event.target.select();
        }, 0);
      },
      blurInput(event) {
        setTimeout(() => {
          event.target.blur();
        }, 0);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .search-input {
    background-color: #EEEEEE;
    padding: 1em;
    margin-bottom: 25px;
    &__field {
      border: 1px solid transparent;
      border-radius: 20px;
      box-sizing: border-box;
      color: #1d1d1d;
      display: block;
      font-size: 30px;
      font-weight: 100;
      line-height: 40px;
      padding: 4px 0 5px;
      text-align: center;
      transition: 0.2s border-color;
      width: 100%;
      &:hover {
        border-color: #c4c4c4;
      }
      &:focus, &:active {
        border-color: #989898;
      }
    }
  }
</style>
