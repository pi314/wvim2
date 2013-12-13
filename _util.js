var char_type = function (i) {
    if (i in char_set) return 'ALPHABET';
    if (i == ' ') return 'SPACE';
    if (i == '\n') return 'CRLF';
    return 'OTHER';
}

var get_data_line_pos = function () {
    var sum = 0;
    var pos = 0;
    for (var a = 0; a < data.length; a++) {
        if (a == cursor[0]) {
            pos = sum + cursor[1];
        }
        sum += data[a].length + 1;
    }
    return pos;
}

var line_pos_to_cursor = function (pos) {
    var new_cursor = [0, 0];
    console.log(pos);
    for (var a = 0; a < data.length; a++) {
        if (pos < data[a].length + 1) {
            new_cursor[0] = a;
            new_cursor[1] = pos;
            break;
        } else {
            pos -= data[a].length + 1;
        }
    }
    console.log(new_cursor);
    return new_cursor;
}

var get_left_spaces = function (linenum) {
    return pi314.repeat(' ', data[linenum].length - data[linenum].trimLeft().length);
}

var set_message = function (message) {
    message_data = message;
    message_type = 'NORMAL';
}

var set_alert = function (message) {
    message_data = message;
    message_type = 'ALERT';
}

var show_message = function () {
    if (get_state() == 'COMMAND') return;
    if (message_type == 'NORMAL') {
        $('#wvim_status').text(message_data);
    } else if (message_type == 'ALERT') {
        $('#wvim_status').html('<span id="alert">' + message_data + '</span>');
    }
}
