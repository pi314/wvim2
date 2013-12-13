var shift_left_keydown = function (i) {
    if (i == '<') {
        var left_spaces = get_left_spaces(cursor[0]).slice(4);
        data[cursor[0]] = left_spaces + data[cursor[0]].trimLeft();
        normal_keydown('^');
        draw(cursor[0], 'CURSOR', cursor[1]);
        set_state('NORMAL');
    } else {
        set_state('NORMAL');
    }
}

var shift_right_keydown = function (i) {
    if (i == '>') {
        var left_spaces = pi314.repeat(' ', 4);
        data[cursor[0]] = left_spaces + data[cursor[0]];
        normal_keydown('^');
        draw(cursor[0], 'CURSOR', cursor[1]);
        set_state('NORMAL');
    } else {
        set_state('NORMAL');
    }
}
