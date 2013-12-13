var undo = function () {
    console.log('undo');
    console.log(history_pos);
    if (history_pos > 0) {
        history_pos -= 1;
        console.log('history_pos', history_pos);
        recover();
        set_message('');
    } else {
        set_message('Already at oldest change');
    }
}

var redo = function () {
    console.log('redo');
    if (history_pos < history.length - 1) {
        history_pos += 1;
        recover();
        set_message('');
    } else {
        set_message('Already at newest change');
    }
}

var recover = function () {
    cursor_data = history[history_pos];
    old_cursor = cursor_data[0];
    old_data   = cursor_data[1];
    cursor = [old_cursor[0], old_cursor[1]];
    data = [];
    for (var a = 0; a < old_data.length; a++) {
        data.push(old_data[a]);
    }
}

var update_history_cursor = function () {
    history[history.length-1][0] = [cursor[0], cursor[1]];
}

var push_history = function () {
    console.log('push_history');
    var current_data = [];
    var current_cursor = [cursor[0], cursor[1]];
    for (var a = 0; a < data.length; a++) {
        current_data.push(data[a]);
    }
    if (history_pos < history.length - 1) {
        history = history.slice(0, history_pos+1);
    }
    history.push([current_cursor, current_data]);
    history_pos += 1;
    console.log(history);
}

var data_dirty = function () {
    return pi314.ary_ne(history[history.length-1][1], data);
}
