(function($) {

    var doc = $(document);
    var searchInput = $('[name="search-keyword"]');
    var action = 'svc_layout_post';
    var ajaxUrl = searchObj.ajaxUrl;
    var gridId = searchObj.gridId;
    var gridResultsString = 'svc_post_grid_' + gridId;
    var gridFromString = 'svc_form_load_more_' + gridId;
    var submit = $('#search-submit');
    var gridForm = $('#' + gridFromString);
    var gridResults = $('#' + gridResultsString);
    var gridFormInputs = $('#' + gridFromString + ' > input');
    var hiddenSvcInfiniteString = 'svc_infinite_' + gridId;
    var hiddenSvcInfinite = $('#' + hiddenSvcInfiniteString);
    var hiddenQueryLoop = $('[name="query_loop"]');
    var data = {'action' : action};
    var filterPostType = $('[name="post-type"]');
    var loadingSpinner = $('<div class="loading-spinner" style="display: block;">' +
      '<div class="ui-spinner">' +
      '<span class="side side-left">' +
      '<span class="fill"></span>' +
      '</span>' +
      '<span class="side side-right">' +
      '<span class="fill"></span>' +
      '</span>' +
      '</div>' +
      '</div>');
    var sortOrder = $('[aria-labelledby="sort"]');
    var sortOrderOptions = sortOrder.find('li > a');
    var sortOrderOptionContainer = $('#current-sort-option');
    var sortDefaultOnLoad = getQueryLoopOption('order');
    var sortDefaultText = getHtmlTextBasedOnHash(sortOrderOptions, sortDefaultOnLoad).text();
    var resultsFoundContainer = $('#total-results-found');
    var resultsNumericContainer = $('#results-num');
    var resultsPluralizeCopy = $('#results-is-plural')

    data = Array.prototype.reduce.call(gridFormInputs, function(p, c, ci, a) {
        var elName =  c.getAttribute('name');
        var elValue = c.value
        p[elName] = elValue;
        return p;
    }, data);

    sortOrderOptionContainer.text(sortDefaultText);

    sortOrderOptions.on('click', function(event) {
        event.preventDefault();
        var self = $(this);
        var selectedSortOrder = getHash(self.attr('href')).toUpperCase();
        var selectedSortCopy = self.text();
        updateQueryLoopOptions('order', selectedSortOrder);
        sortOrderOptionContainer.text(selectedSortCopy);
    });

    $('.js-filter-dropdown').on('click', function(e) {
        e.stopPropagation();
    });

    searchInput.on('keypress', function(event) {
        var keyCode = event.which || event.keyCode;
        if (keyCode === 13) {
            submit.trigger('click');
        }
    });

    submit.on('click', function() {
        
        var self = $(this);
        var searchInputVal = searchInput.val();
        var hiddenSearch = gridFormInputs.filter('[name="search_keyword"]');

        var checkedPostTypes = filterPostType.filter(':checked');
        var searchAllPostTypes = checkedPostTypes.length === 0 || filterPostType.length === checkedPostTypes.length;
        var postTypesToMap = searchAllPostTypes ? filterPostType : checkedPostTypes;

        var checkedPostTypesValues = postTypesToMap
            .map(function(){
                return this.value;
            })
            .get()
            .join(',');

        updateQueryLoopOptions('post_type', checkedPostTypesValues);

        data['query_loop'] = hiddenQueryLoop.val();
        data['search_keyword'] = searchInputVal;
        hiddenSearch.val(searchInputVal);

        // Set Loading state
        gridResults
          .empty()
          .append(
            $('<nav id="svc_infinite" class="text-center" style="width: 100%;"/>')
              .append(loadingSpinner)
          );
        $('.load_more_main_div').hide();
        resultsFoundContainer.hide();

       $.post(ajaxUrl, data)
           .done(function(res) {
               var res = $(res);
               var resultsCount = res.filter('.element-item').length;
               var hasResults = resultsCount > 0;

               if (hasResults) {
                   gridResults
                     .empty()
                     .isotope('layout')
                     .append(res)
                     .isotope( 'appended', res );

                   $('.pflip').flip({
                       axis: 'y',
                       trigger: 'hover'
                   });

                   resultsFoundContainer.show();

                   if (resultsCount > 1) {
                       resultsPluralizeCopy.show();
                   } else {
                       resultsPluralizeCopy.hide();
                   }

               } else {
                   gridResults
                     .empty()
                     .isotope('layout')
                     .append(res)
                     .append(
                       $('<div class="text-center" />')
                         .append('<h1 />')
                         .find('h1')
                            .html('<i class="fa fa-exclamation-triangle" />')
                            .append(' No results found.')
                            .end()
                     );
                   $('.load_more_main_div').hide();
                   resultsFoundContainer.hide();
               }
           });

    });

    doc.on('publish', function(event, foundPosts, maxNumPages) {

        var loadMoreContainer = $('.load_more_main_div');

        gridFormInputs.filter('[name="total_paged"]').val(maxNumPages)
        gridFormInputs.filter('[name="paged"]').val(1);

        if (maxNumPages == 1) {
            loadMoreContainer.hide();
        } else {
            if (!loadMoreContainer.is(':visible')) {
                $('#svc_infinite').show();
                loadMoreContainer.show();
                hiddenSvcInfinite.val(0);
            }
        }

        resultsNumericContainer.text(foundPosts);

    });

    function getHtmlTextBasedOnHash(els, hashValue) {
        var hasHashValue = els.filter(function(){
            var self = $(this);
            return getHash(self.attr('href')).toUpperCase() === hashValue;
        });

        return hasHashValue;
    }

    function getHash(string) {
        return string.split('#')[1];
    }

    function getQueryLoopOption(option) {
        var queryLoop = parseQueryLoop();
        return queryLoop[option];
    }

    function parseQueryLoop() {
        var queryLoopOptions = hiddenQueryLoop
            .val()
            .split('|')
            .reduce(function(p, c) {
                var optionValue = c.split(':');
                p[optionValue[0]] = optionValue[1];
                return p;
            }, []);

        return queryLoopOptions;
    }

    function joinQueryLoopUpdate(queryLoop) {
        var arrayQueryLoop = [];

        for (var prop in queryLoop) {
            var arrValue = prop + ':' + queryLoop[prop];
            arrayQueryLoop.push(arrValue);
        }

        return arrayQueryLoop.join('|');
    }

    function updateQueryLoopOptions(option, value) {
        var queryLoop = parseQueryLoop();
        queryLoop[option] = value;
        var queryLoopString = joinQueryLoopUpdate(queryLoop);
        hiddenQueryLoop.val(queryLoopString);
        return queryLoop;
    }
    
})(jQuery);