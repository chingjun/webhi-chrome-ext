var dd = '';
var ll = '';
var pp = '';
var _config = '';
var _sandbox = '';
var me = '';
var ginfo = '';

function _merge() {
    var funcs = arguments;
    return function() {
        var args = arguments;
        for (var i = funcs.length - 1; i >= 0; i--) {
            funcs[i].apply(this, args);
        }
    };
}

var inc_badge_text = make_function('inc_badge_text');
var clear_badge_text = make_function('clear_badge_text');
var add_to_log = make_function('add_to_log');

notification = function(sandbox) {
    var selfInfo = null;
    var gdict = {};
    var gnamedict = {};
    function destroy(){};
    function init() {
        _sandbox = sandbox;
        _config = sandbox.getConfig();
        //MessageBox-ReceiveMessage
        var msg_received = function(method) {
            return  function(data) {
                var msg = {
                    event: method,
                    data: data
                };
                inc_badge_text(data, null);
                dd = data;
            };
        };
        var log_message = function(data) {
            ll = data;
            var msg = parse_message(data.content.message.content);
            var author = '';
            var display_name = '';
            var db = null;
            var type = '';
            var time = data.content.message.time;
            var isself = false;
            if (!!data.content.message.gid) {
                // group message
                author = {uname: data.content.friend.username, display: data.content.friend.showname};
                display_name = gnamedict[data.content.message.gid];
                if (display_name == null) {
                    display_name = data.content.message.gid;
                }
                db = '__group__' + data.content.message.gid;
                type = 'group';
            } else {
                author = {uname: data.content.friend.username, display: data.content.friend.showname};
                db = data.content.friend.username;
                display_name = data.content.friend.showname;
                type = 'private';
            }
            if (data.content.isSelf == true) {
                author = {uname: selfInfo.username, display: selfInfo.showname};
                isself = true;
            }
            pp = {db: db, author: author, msg: msg, time: time};
            add_to_log({db: db, author: author, msg: msg, time: time, display: display_name, type: type, isself: isself}, null);
        }
        sandbox.on('DataCenter-Message', _merge(msg_received('DataCenter-Message'), log_message));
        sandbox.on('DataCenter-GroupMessage', _merge(msg_received('DataCenter-GroupMessage'), log_message));
        sandbox.on('MessageBox-ReceiveMessage', log_message);
        sandbox.on('DataCenter-UpdateGroup', function(data) {
            gdict[data.group_id] = data;
            gnamedict[data.group_id] = data.group_name;
            ginfo = data;
        });

        sandbox.on('DataCenter-Initialized',
            function(data) {
            selfInfo = data.content.selfInfo;
            me = data;
        });

    }
    
    return {
        init: init,
        destroy: destroy
    };
};
registerModule = setInterval(function() {
    if (window.application != undefined) {
        clearInterval(registerModule);
        window.application.Core.registerModule("DesktopNotification", notification);
    }
}, 100);

window.onfocus = function() {
    clear_badge_text();
}
