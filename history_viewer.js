var list_ul = $('#list-ul');
function _add_to_left_pane(el) {
    list_ul.append(el);
}

function add_header_to_left_pane(text) {
    var l = document.createElement('li');
    l.className = 'nav-header';
    l.innerText = text;
    _add_to_left_pane(l);
    return $(l);
}

function add_link_to_left_pane(text, href) {
    var l = document.createElement('li');
    var a = document.createElement('a');
    a.href = href;
    a.innerText = text;
    l.appendChild(a);
    _add_to_left_pane(l);
    return $(l);
}

function time_to_str(time) {
    var f = function(s) {
        if (s <= 9) return '0'+s;
        return s;
    }
    var y = time.getFullYear();
    var m = f(time.getMonth() + 1);
    var d = f(time.getDay());
    var H = f(time.getHours());
    var M = f(time.getMinutes());
    var S = f(time.getSeconds());
    return y+'-'+m+'-'+d+' '+H+':'+M+':'+S;
}

function generate_click_event(name, text) {
    return (function(e) {
        var id = 'msgs---'+name;
        if ($('#' + id).length > 0) {
            $('#link-of-' + id).tab('show');
            return;
        }
        var l = $(document.createElement('li'));
        var a = $(document.createElement('a'));
        a.attr('id', 'link-of-' + id);
        a.attr('href', '#' + id);
        a.attr('data-toggle', 'tab');
        a.text(text);
        l.append(a);

        var c = $(document.createElement('div'));
        c.addClass('tab-pane');
        c.attr('id', id);
        c.text('Loading...');

        $('#tab-pane').append(l);
        $('#tab-contents').append(c);

        msglog.get(name, function(data) {
            var d = $(document.createElement('div'));
            for (i = data.length-1; i >= 0; i--) {
                var time = new Date(data[i].time * 1000);
                var timestr = time_to_str(time);
                var author_display = data[i].author.display;
                var author_uname = data[i].author.uname;

                var post = $(document.createElement('div'));
                post.addClass('messageBlock');
                var title = $(document.createElement('p'));
                var contentwrap = $(document.createElement('p'));
                var content = $(document.createElement('p'));

                if (data[i].isself) {
                    title.addClass('selfMessageTitle');
                } else {
                    title.addClass('messageTitle');
                }
                if (author_display == author_uname) {
                    title.text(author_display + ' ' + timestr);
                } else {
                    title.text(author_display + ' <' + author_uname + '> ' + timestr);
                }

                if (data[i].isself) {
                    content.addClass('selfMessageText');
                } else {
                    content.addClass('messageText');
                }
                content.html(data[i].msg);

                contentwrap.append(content);
                post.append(title);
                post.append(contentwrap);

                d.append(post);
            }
            c.html('');
            c.append(d);
        }, null, null);
        a.tab('show');
    });
}

function fill_list(arr) {
    for (i in arr) {
        var name = arr[i].name;
        var text = arr[i].text;
        var el = add_link_to_left_pane(text, arr[i].href);
        el.click(generate_click_event(name, text));
    }
}

msglog.getlist(function(list) {
    var groups = [];
    var privs = [];
    for (i in list) {
        var d = {
            text: list[i].name,
            href: '#',
            name: list[i].db,
        };
        if (list[i].type == 'group') {
            groups.push(d);
        } else {
            privs.push(d);
        }
    }
    add_header_to_left_pane('私人对话');
    fill_list(privs);
    add_header_to_left_pane('群消息');
    fill_list(groups);
});
