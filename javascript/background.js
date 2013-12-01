var queryId = -1,
    defaultQueryInterval = 10 * 1000,
    loopQueryBuilder = function (query) {
        return function () {
            chrome.runtime.sendMessage({type: "QUERY_FEEDBACK", data: query()});
        }
    };

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request.type == "QUERY_START") {
            var query = ticketto.buildQueryFunction(request.trainInfo), loopQuery = loopQueryBuilder(query);
            loopQuery();
            queryId = setInterval(loopQuery, request.queryInterval === undefined ? defaultQueryInterval : request.queryInterval);

            sendResponse({message: "Started."});

        } else if (request.type == "QUERY_STOP") {
            clearInterval(queryId);
            sendResponse({message: "Stopped."});
        }

    });