var find_keydown = function (i, direction, next_state) {
    var linenum = cursor[0];
    var pos = cursor[1];
    if (i == 'ESC') {
        set_state('NORMAL');
    } else {
        if (i == 'SPACE') {
            i = ' ';
        }
        var dir = (direction == 'FORWARD')? 1 : -1;
        for (var a = pos + dir; 0 <= a && a < data[linenum].length; a += dir) {
            if (data[linenum][a] == i) {
                cursor[1] = a;
                break;
            }
        }
        set_state(next_state);
        switch (get_state()) {
        case 'NORMAL':
            draw(cursor[0], 'CURSOR', cursor[1]);
            break;
        case 'VISUAL_LINE':
        case 'VISUAL':
        case 'VISUAL_BLOCK':
            redraw_visual();
            break;
        }
    }
}

var delete_find_keydown = function (i, direction) {
    if (i == 'ESC') {
        set_state('NORMAL');
    } else {
        var cover = 1;
        if (direction == 'TO') {
            cover = 0;
            direction = 'FORWARD';
        }
        delete_cursor = [cursor[0], cursor[1]];
        find_keydown(i, direction, 'NORMAL');
        console.log(delete_cursor, cursor);
        delete_diff(cover);
        delete_cursor = null;
        set_state('NORMAL');
        draw(cursor[0], 'CURSOR', cursor[1]);
    }
}

var change_find_keydown = function (i, direction) {
    if (i == 'ESC') {
        set_state('NORMAL');
    } else {
        var cover = 1;
        if (direction == 'TO') {
            cover = 0;
            direction = 'FORWARD';
        }
        delete_cursor = [cursor[0], cursor[1]];
        find_keydown(i, direction, 'NORMAL');
        console.log(delete_cursor, cursor);
        delete_diff(cover);
        delete_cursor = null;
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    }
}
