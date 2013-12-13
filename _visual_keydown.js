var visual_keydown = function (i) {
    var linenum = cursor[0];
    var pos = cursor[1];
    if (i == 'ESC') {
        cursor[1] = data[linenum].length <= pos ? data[linenum].length-1 : pos;
        cursor[1] = cursor[1] < 0 ? 0 : cursor[1];
        set_state('NORMAL');
        redraw();
    } else if (i == 'v') {
        set_state('NORMAL');
        redraw();
    } else if (i == 'V') {
        set_state('VISUAL_LINE');
        redraw();
    } else if (i == '<C-v>') {
        set_state('VISUAL_BLOCK');
        redraw();
    } else if (i in pi314.set(['i', 'a'])) {
        // disable
    } else if (i == 'x' || i == 'd') {
        copy_visual();
        delete_visual();
    } else if (i == 'X' || i == 'D') {
        visual_line_keydown('X');
    } else if (i == 'l' || i == 'SPACE' || i == 'RIGHT') {
        cursor[1] = pos < data[linenum].length ? pos+1 : pos;
        redraw();
    } else if (i == 'h' || i == 'BACKSPACE' || i == 'LEFT') {
        cursor[1] = data[linenum].length-1 < cursor[1] ? data[linenum].length:cursor[1];
        cursor[1] = 0 <= cursor[1] - 1 ? cursor[1]-1 : cursor[1];
        if (data[linenum].length > 1) {
            if (cursor[1] >= data[linenum].length) {
                cursor[1] = data[linenum].length-1;
            }
        }
        redraw();
    } else if (i == 'k' || i == 'UP') {
        if (cursor[0] > visual_cursor[0]) {
            draw(cursor[0], 'NORMAL');
        } else {
            draw(cursor[0], 'VISUAL', [0, 'END']);
        }
        cursor[0] = 0 <= linenum - 1 ? linenum-1 : linenum;
        redraw();
    } else if (i == 'j' || i == 'DOWN') {
        if (cursor[0] >= visual_cursor[0]) {
            draw(cursor[0], 'VISUAL', [0, 'END']);
        } else {
            draw(cursor[0], 'NORMAL');
        }
        cursor[0] = linenum+1 <= data.length-1 ? linenum+1 : linenum;
        redraw();
    } else if (i == '0' || i == '|') {
        cursor[1] = 0;
        redraw();
    } else if (i == '^') {
        normal_keydown('^');
        redraw();
    } else if (i == '$') {
        cursor[1] = data[linenum].length;
        redraw();
    } else if (i in pi314.set('wbe%')) {
        normal_keydown(i);
        redraw();
    } else if (i == 'f') {
        set_state('VISUAL_FIND');
    } else if (i == 'F') {
        set_state('VISUAL_DNIF');
    } else if (i == 's' || i == 'c') {
        visual_keydown('x');
        set_state('INSERT');
        redraw();
    } else if (i == 'S' || i == 'C' || i == 'R') {
        visual_line_keydown('S');
    } else if (i == 'I') {
        visual_line_keydown('I');
    } else if (i == 'A') {
        visual_line_keydown('A');
    } else if (i == 'o' || i == 'O') {
        visual_line_keydown('o');
    } else if (i == 'y') {
        copy_visual();
        set_state('NORMAL');
        redraw();
        set_message('已複製 ' + (right_linenum-left_linenum+1) + ' 行');
    } else if (i == '>') {
        visual_line_keydown('>');
    } else if (i == '<') {
        visual_line_keydown('<');
    } else if (i == 'p') {
        delete_visual();
        cursor[1] -= 1;
        normal_keydown('p');
    } else if (i == 'r') {
        set_state('VISUAL_REPLACE_CHAR');
    }
}

var copy_visual = function () {
    var a = pi314.ary_lt(visual_cursor, cursor) ? visual_cursor : cursor;
    var b = pi314.ary_lt(visual_cursor, cursor) ? cursor : visual_cursor;
    var left_linenum = a[0];
    var left_pos = a[1];
    var right_linenum = b[0];
    var right_pos = b[1];
    if (left_linenum == right_linenum) {
        copy_data = [ data[left_linenum].slice(left_pos, right_pos+1) ]
    } else {
        copy_data =
            [data[left_linenum].slice(left_pos)]
            .concat( data.slice(left_linenum+1, right_linenum) )
            .concat( data[right_linenum].slice(0, right_pos+1) );
    }
    copy_type = 'NORMAL';
}

var delete_visual = function () {
    var linenum = cursor[0];
    var pos = cursor[1];
    var a = pi314.ary_lt(visual_cursor, cursor) ? visual_cursor : cursor;
    var b = pi314.ary_lt(visual_cursor, cursor) ? cursor : visual_cursor;
    var left_linenum = a[0];
    var left_pos = a[1];
    var right_linenum = b[0];
    var right_pos = b[1];
    console.log(a, b);
    data =
        data.slice(0, left_linenum)
        .concat(
            data[left_linenum].slice(0, left_pos)
            + data[right_linenum].slice(right_pos+1) )
        .concat( data.slice(right_linenum+1) )
        ;
    cursor = [left_linenum, left_pos];
    set_state('NORMAL');
    redraw();
}
