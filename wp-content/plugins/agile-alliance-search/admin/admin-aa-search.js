(function($) {
    $(function() {
        var $status = $('.js-indexing-status');
        var $reindexTrigger = $('.js-indexing-trigger');
        var $mappingTrigger = $('.js-mapping-trigger');
        var $resetTrigger = $('.js-reset-trigger');

        var $allTriggers = $reindexTrigger
            .add($mappingTrigger)
            .add($resetTrigger);

        var totalBatchSize, completedItems;

        $reindexTrigger.on('click', function(ev) {
            ev.preventDefault();
            var verifyStart = confirm('Are you sure you wish to reindex?');
            if (!verifyStart) {
                return;
            }

            totalBatchSize = 0;
            completedItems = 0;

            // Lock UI
            $allTriggers.prop('disabled', true);
            window.onbeforeunload = onBeforeUnloadWindow;

            var data = {
                'action': 'aa_search_index_update',
                'intent': 'FETCH_BATCH'
            };

            status('Initializing...');

            $.post(ajaxurl, data, parseResponse(function(res) {
                if (res.error) {
                    console.error(res);
                    return unlockUI('Error occurred. Check console for details.');
                }
                totalBatchSize = res.payload.batchItems.length;
                status('Indexing ' + totalBatchSize + ' documents.');
                triggerBatch(res.payload.batchItems, 100);
            }));

        });

        function triggerBatch(items, numberToPull) {
            if (!items.length) {
                return unlockUI('Indexing Complete.');
            }
            var job = items.slice(0, numberToPull);
            var data = {
                'action': 'aa_search_index_update',
                'intent': 'RUN_BATCH',
                'ids': job
            };
            console.log('Requesting', data);
            $.post(ajaxurl, data, parseResponse(function(res) {
                if (res.error) {
                    console.error(res);
                    return unlockUI('Error occurred. Check console for details.');
                }
                console.log('Response', res);
                completedItems += job.length;
                status('Indexing ' + totalBatchSize + ' documents. ' + completedItems + '/' + totalBatchSize + ' completed.');
                triggerBatch(items.slice(numberToPull), numberToPull);
            }));
        }

        function parseResponse(fn) {
            return function(response) {
                try {
                    var parsedResponse = JSON.parse(response);
                    fn(parsedResponse);
                } catch (exception) {
                    console.error(exception);
                    unlockUI('Error occurred. Check console for details.')
                }
            }
        }

        function status(text) {
            $status.text(text);
        }

        function unlockUI(message) {
            status(message);
            $allTriggers.prop('disabled', false);
            window.onbeforeunload = null;
        }

        function onBeforeUnloadWindow() {
            return 'You must remain on this page until re-indexing completes.';
        }

        $mappingTrigger.on('click', function(ev) {
            ev.preventDefault();
            var verifyStart = confirm('This will reset the mappings within ElasticSearch. You should probably rebuild the index afterwards.');
            if (!verifyStart) {
                return;
            }

            $allTriggers.prop('disabled', true);
            window.onbeforeunload = onBeforeUnloadWindow;

            var data = {
                'action': 'aa_search_index_update',
                'intent': 'REMAP_INDEX'
            };

            status('Re-mapping Index...');

            $.post(ajaxurl, data, parseResponse(function(res) {
                if (res.error) {
                    console.error(res);
                    return unlockUI('Error occurred. Check console for details.');
                }

                return unlockUI('Re-mapping Complete. It is advised to rebuild the index now.');
            }));
        });

        $resetTrigger.on('click', function(ev) {
            ev.preventDefault();
            var verifyStart = confirm('This will remove everything from the index. You must rebuild after this process completes.');
            if (!verifyStart) {
                return;
            }

            $allTriggers.prop('disabled', true);
            window.onbeforeunload = onBeforeUnloadWindow;

            var data = {
                'action': 'aa_search_index_update',
                'intent': 'RESET_INDEX'
            };

            status('Resetting Index...');

            $.post(ajaxurl, data, parseResponse(function(res) {
                if (res.error) {
                    console.error(res);
                    return unlockUI('Error occurred. Check console for details.');
                }

                return unlockUI('Index reset. It is advised to remap & rebuild the index now.');
            }));
        });



    })
})(jQuery);