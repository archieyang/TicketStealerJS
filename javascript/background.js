var queryId = -1;

chrome.runtime.onConnect.addListener(function (port) {
    if (port.name == "optionPort") {
        port.onMessage.addListener(function (msg) {
            if (msg.type == "QUERY_START") {
                var query = ticketto.buildQueryFunction(msg.trainInfo),
                    responseWithData = function () {
                        port.postMessage(query())
                    };
                responseWithData();
                queryId = setInterval(responseWithData, 5 * 1000);

            } else if (msg.type == "QUERY_STOP") {
                clearInterval(queryId);
            }
        });
    }
});