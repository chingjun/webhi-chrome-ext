function bgcall(data, f_callback) {
    var d = document.createElement("textarea"),
        e = document.createEvent("Events");
    d.style.cssText = "display:none;";
    d.value = data == null ? "" : JSON.stringify(data);
    d.addEventListener("action", function() {
        f_callback && f_callback(JSON.parse(d.value));
        d.parentNode.removeChild(d);
    }, true)
    document.body.appendChild(d);

    // Fire events, to notify the Content script
    e.initEvent("WEBHI_CHANNEL", false, true);
    d.dispatchEvent(e);
}

function make_function(method) {
    return function(data, cb) {
        var call_data = {
            method: method,
            data: data
        };
        bgcall(call_data, cb);
    }
}

function format(str) {
    return str.replace(/\&/g, '&#38;').replace(/\>/g, '&#62;').replace(/\</g, '&#60;').replace(/\"/g, '&#34;').replace(/\'/g, '&#39;');       
}

function parseUrl(content) {
    var regexp = /((((https?|ftp):\/\/[\w-]+)|\bwww)(\.[\w-]+)+(:\d+)?(\/[\w\u4e00-\u9fa5\uf900-\ufa2d%-]+){0,}(\/|\.[\w-]+)?(\?[\w-]*(=[^&=< >\r\n]*)?(&[\w-;]*(=[^&=< >\r\n]*)?){0,})?)/gi;
    return content.replace(regexp,
    function(string, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12) {
        return ("www" == _2 ? "http://": "") + _1;
    });
}


function parse_message(message) {
    var msgStr = '';
    for (var i = 0; i < message.length; i++) {
        var curContent = message[i];
        if (curContent.type == 'text') {
            msgStr += format(curContent.c);
        }
        if (curContent.type == 'face') {
            var url = 'http://st0.im.baidu.com/popup/resources/common/images/sysface/';
            for (i in smiley) {
                if (smiley[i].n == curContent.n) {
                    msgStr += '<img src="'+url+smiley[i].f+'/'+smiley[i].m+'.gif">';
                }
            }
            //msgStr += getFaceUI(curContent.n).dom;
        }
        if (curContent.type == 'url') {
            var link = format(parseUrl(curContent.ref));
            var text = format(curContent.ref);
            msgStr += '<a href="'+link+'" target="_blank>'+text+'</a>';
        }
        if (curContent.type == 'reply') {
            if (curContent.t == 1) { // huifu
                msgStr += '<span class="reply">回复&nbsp;<span>'+format(curContent.n || '')+'</span><br/><span class="replyText">'+format(curContent.c)+'</span></span>';
            } else { //yinyong
                msgStr += '<span class="reply"><span>引用：</span><br/><span class="replyText">'+format(curContent.c)+'</span></span>';
            }
        }
        if (curContent.type == 'cface' || curContent.type == 'img') {
            var md5 = curContent.md5.replace(/[^a-z0-9]/ig, "").substr(0, 32);
            var url = 'http://file.im.baidu.com/get/file/content/old_image/' + md5 + '?from=page';
            msgStr += '<img src="'+url+'">';
        }
    }
    return msgStr;
}
