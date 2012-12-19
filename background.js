var count = 0;
var handler = {
    inc_badge_text: {
        func: function() {
            count += 1;
            chrome.browserAction.setBadgeText({
                text: '' + count
            });
            return {};
        },
        type: 'ret'
    },
    clear_badge_text: {
        func: function() {
            count = 0;
            chrome.browserAction.setBadgeText({
                text: ''
            });
            return {};
        },
        type: 'ret'
    },
    add_to_log: {
        func: function(data) {
            msglog.add(data);
            return null;
        },
        type: 'ret'
    },
};
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.method in handler) {
            var f = handler[request.method];
            if (f.type == 'ret') {
                sendResponse(f.func(request.data));
            } else if (f.type == 'cb') {
                f.func(request.data, sendResponse);
            } else {
                sendResponse({});
            }
        } else {
            sendResponse({});
        }
    });
