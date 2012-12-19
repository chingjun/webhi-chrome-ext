var msglog = (function() {
    var ver = 1;

    var idb = window.indexedDB || window.webkitIndexedDB;
    var idb_transaction = window.IDBTransaction || window.webkitIDBTransaction;
    var idb_keyrange = window.IDBKeyRange || window.webkitIDBKeyRange;
    var idb_cursor = window.IDBCursor || window.webkitIDBCursor;

    var logdb = {};
    var db = null;

    var loaded = false;
    var req_queue = [];

    var on_error = function(){};

    var obj_store = "msgs";
    var list_store = "list_test";

    logdb.open = function() {
        var logdb_open = idb.open("webhi-log");
        logdb_open.onsuccess = function(e) {
            db = logdb_open.result;
            if (ver != db.version) {
                var set_v_req = db.setVersion(ver);
                set_v_req.onerror = on_error;
                set_v_req.onsuccess = function(e) {
                    var store2 = db.createObjectStore(list_store, {keyPath: "db"});//TODO
                    var store = db.createObjectStore(obj_store, {autoIncrement: true});//TODO
                    store.createIndex('index', 'index', {unique: false});
                    e.target.transaction.oncomplete = function() {
                        //we're done
                        loaded = true;
                        for (i in req_queue) {
                            req_queue[i]();
                        }
                        req_queue = [];
                    }
                };
            } else {
                //logdb_open.transaction.oncomplete = function() {
                    loaded = true;
                    for (i in req_queue) {
                        req_queue[i]();
                    }
                    req_queue = [];
                //}
            }
        };
        logdb_open.onfailure = on_error;
        logdb_open.onerror = function(e) {
            //maybe we should handle error here
        };
    };

    logdb.add = function(data) {
        data.index = data.db + '\000' + data.time;
        if (!loaded) {
            req_queue.push(function() {logdb.add(data);});
            return;
        }
        var list_data = {
            db: data.db,
            name: data.display,
            type: data.type,
        };
        delete(data.display);
        var trans = db.transaction([obj_store, list_store], "readwrite");
        var store = trans.objectStore(obj_store);
        store.put(data);

        var store2 = trans.objectStore(list_store);
        store2.put(list_data);
    }

    logdb.getlist = function(cb) {
        if (!loaded) {
            req_queue.push(function() {logdb.getlist(cb);});
            return;
        }
        var trans = db.transaction([list_store], "readonly");
        var store = trans.objectStore(list_store);
        var cur_res = [];
        var res = store.openCursor();
        res.onsuccess = function(e) {
            var cursor = e.target.result;
            if (cursor) {
                cur_res.push(cursor.value);
                cursor.continue();
            } else {
                if (cb != null) 
                    cb(cur_res);
            }
        };
        res.onerror = function(e) {
            //error here
            if (cb != null) 
                cb(null);
        }
    }
    logdb.get = function(_db, cb, count, time) {
        var trans = db.transaction([obj_store], "readonly");
        var store = trans.objectStore(obj_store);
        var index = store.index("index");
        var keyrange = null;
        if (time == null) {
            keyrange = idb_keyrange.bound(_db, _db + "\001", true, true);
        } else {
            keyrange = idb_keyrange.bound(_db, _db + "\000" + time, true, true);
        }
        var cur_count = 0;
        var cur_res = [];
        var res = index.openCursor(keyrange, "prev");
        res.onsuccess = function(e) {
            cur_count++;
            var cursor = e.target.result;
            if ((!count || cur_count <= count) && cursor) {
                cur_res.push(cursor.value);
                cursor.continue();
            } else {
                if (cb != null) 
                    cb(cur_res);
            }
        };
        res.onerror = function(e) {
            //error here
            if (cb != null) 
                cb(null);
        }
    }

    return logdb;
})();
msglog.open();
