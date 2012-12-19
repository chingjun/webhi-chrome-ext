function inject(name) {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(name);
    s.onload = function() {
        this.parentNode.removeChild(this);
    };
    (document.head||document.documentElement).appendChild(s);
}
inject("smiley.js");
inject("util.js");
inject("webhi-notification.js");

function ev_callback(data, cb) {
    chrome.extension.sendMessage(data, function(response) {
        cb(response);
    });
}

document.addEventListener("WEBHI_CHANNEL", function(e) {
    var from = e.target;
    if (from) {
        // Deserialize the string
        var inData = JSON.parse(from.value);
        // Trigger callback, to finish the event, so that the temporary element can be removed
        ev_callback(inData, function(data) {
            var o_event = document.createEvent('Events');
            o_event.initEvent('action', true, false);
            from.value = JSON.stringify(data);
            from.dispatchEvent(o_event);
        });
    }
}, true);
