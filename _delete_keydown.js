var delete_keydown = function (i) {
    var linenum = cursor[0];
    var pos = cursor[1];
    if (i == 'ESC') {
        set_state('NORMAL');
    } else if (i == 'd') {
        if (data.length == 1) {
            data[0] = '';
            copy_data = [data[0]];
            copy_type = 'LINE';
        } else {
            if (linenum == data.length-1) {
                cursor[0] -= 1;
            }
            copy_data = [data[linenum]];
            copy_type = 'LINE';
            data = data.slice(0, linenum).concat( data.slice(linenum+1) );
            normal_keydown('^');
        }
        set_state('NORMAL');
        redraw();
    } else if (i == 'i') {
        set_state('DELETE_IN');
    } else if (i == 'l' || i == 'SPACE' || i == 'RIGHT') {
        normal_keydown('x');
        set_state('NORMAL');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'h' || i == 'BACKSPACE' || i == 'LEFT') {
        normal_keydown('X');
        set_state('NORMAL');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'j' || i == 'DOWN') {
        delete_keydown('d');
        delete_keydown('d');
        normal_keydown('^');
        set_state('NORMAL');
        redraw();
    } else if (i == 'k' || i == 'UP') {
        delete_keydown('d');
        normal_keydown('k');
        delete_keydown('d');
        normal_keydown('^');
        set_state('NORMAL');
        redraw();
    } else if (i == '0' || i == '|') {
        data[linenum] = data[linenum].slice(cursor[1]);
        cursor[1] = 0;
        set_state('NORMAL');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == '^') {
        normal_keydown('^');
        data[linenum] = data[linenum].slice(0, cursor[1]) + data[linenum].slice(pos);
        set_state('NORMAL');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == '$') {
        normal_keydown('$');
        data[linenum] = data[linenum].slice(0, pos);
        cursor[1] = data[linenum].length - 1;
        set_state('NORMAL');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'w') {
        delete_cursor = [cursor[0], cursor[1]];
        normal_keydown('w');
        var cover = cursor[1] == data[cursor[0]].length - 1 ? 1 : 0;
        delete_diff(cover);
        set_state('NORMAL');
        redraw();
    } else if (i == 'b') {
        delete_cursor = [cursor[0], cursor[1]];
        normal_keydown('b');
        delete_diff(0);
        set_state('NORMAL');
        redraw();
    } else if (i == 'e') {
        delete_cursor = [cursor[0], cursor[1]];
        normal_keydown('e');
        delete_diff(1);
        set_state('NORMAL');
        redraw();
    } else if (i == 'f') {
        set_state('DELETE_FIND');
    } else if (i == 'F') {
        set_state('DELETE_DNIF');
    } else if (i == 't') {
        set_state('DELETE_TO');
    } else {
        set_state('NORMAL');
    }
}

var delete_diff = function (cover) {
    console.log('delete_diff');
    var a = pi314.ary_lt(delete_cursor, cursor) ? delete_cursor : cursor;
    console.log(delete_cursor, cursor);
    var b = pi314.ary_lt(delete_cursor, cursor) ? cursor : delete_cursor;
    var left_linenum = a[0];
    var left_pos = a[1];
    var right_linenum = b[0];
    var right_pos = b[1];
    console.log(a, b);
    data =
        data.slice(0, left_linenum)
        .concat(
            data[left_linenum].slice(0, left_pos)
            + data[right_linenum].slice(right_pos + cover) )
        .concat( data.slice(right_linenum+1) )
        ;
    cursor = [left_linenum, left_pos];
}
