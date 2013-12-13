var visual_line_keydown = function (i) {
    var linenum = cursor[0];
    var pos = cursor[1];
    if (i == 'ESC') {
        cursor[1] = data[linenum].length <= pos ? data[linenum].length-1 : pos;
        cursor[1] = cursor[1] < 0 ? 0 : cursor[1];
        set_state('NORMAL');
        redraw();
    } else if (i == 'v') {
        set_state('VISUAL');
        redraw();
    } else if (i == 'V') {
        set_state('NORMAL');
        redraw();
    } else if (i == '<C-v>') {
        set_state('VISUAL_BLOCK');
        redraw();
    } else if (i in pi314.set(['i', 'a'])) {
        // disable
    } else if (i in pi314.set('xXdD')) {
        copy_visual_line();
        delete_visual_line();
    } else if (i == 'l' || i == 'SPACE' || i == 'RIGHT') {
        cursor[1] = pos < data[linenum].length ? pos+1 : pos;
        draw(cursor[0], 'VISUAL', [0, 'END', cursor[1]]);
    } else if (i == 'h' || i == 'BACKSPACE' || i == 'LEFT') {
        cursor[1] = data[linenum].length-1 < cursor[1] ? data[linenum].length:cursor[1];
        cursor[1] = 0 <= cursor[1] - 1 ? cursor[1]-1 : cursor[1];
        if (data[linenum].length > 1) {
            if (cursor[1] >= data[linenum].length) {
                cursor[1] = data[linenum].length-1;
            }
        }
        draw(cursor[0], 'VISUAL', [0, 'END', cursor[1]]);
    } else if (i == 'k' || i == 'UP') {
        if (cursor[0] > visual_cursor[0]) {
            draw(cursor[0], 'NORMAL');
        } else {
            draw(cursor[0], 'VISUAL', [0, 'END']);
        }
        cursor[0] = 0 <= linenum - 1 ? linenum-1 : linenum;
        draw(cursor[0], 'VISUAL', [0, 'END', cursor[1]]);
    } else if (i == 'j' || i == 'DOWN') {
        if (cursor[0] >= visual_cursor[0]) {
            draw(cursor[0], 'VISUAL', [0, 'END']);
        } else {
            draw(cursor[0], 'NORMAL');
        }
        cursor[0] = linenum+1 <= data.length-1 ? linenum+1 : linenum;
        draw(cursor[0], 'VISUAL', [0, 'END', cursor[1]]);
    } else if (i == '0' || i == '|') {
        cursor[1] = 0;
        draw(cursor[0], 'VISUAL', [0, 'END', cursor[1]]);
    } else if (i == '^') {
        normal_keydown('^');
        draw(cursor[0], 'VISUAL', [0, 'END', cursor[1]]);
    } else if (i == '$') {
        cursor[1] = data[linenum].length;
        draw(cursor[0], 'VISUAL', [0, 'END', cursor[1]]);
    } else if (i in pi314.set('wbe%')) {
        normal_keydown(i);
        redraw();
    } else if (i == 'f') {
        set_state('VISUAL_LINE_FIND');
    } else if (i == 'F') {
        set_state('VISUAL_LINE_DNIF');
    } else if (i == 's' || i == 'c') {
        visual_line_keydown('x');
        set_state('INSERT');
        redraw();
    } else if (i == 'S' || i == 'C' || i == 'R') {
        var up   = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
        var down = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
        var left_spaces = get_left_spaces(up);
        data = data.slice(0, up).concat( left_spaces ).concat( data.slice(down+1) );
        cursor = [up, left_spaces.length];
        set_state('INSERT');
        redraw();
    } else if (i == 'I') {
        if (visual_cursor[0] <= cursor[0]) {
            cursor = [visual_cursor[0], 0];
        }
        set_state('INSERT');
        redraw();
    } else if (i == 'A') {
        if (cursor[0] < visual_cursor[0]) {
            cursor = [visual_cursor[0], 0];
        } else {
            cursor[1] += 1;
        }
        set_state('INSERT');
        redraw();
    } else if (i == 'o' || i == 'O') {
        var temp = cursor;
        cursor = visual_cursor;
        visual_cursor = temp;
        redraw();
    } else if (i == 'y') {
        copy_visual_line();
        set_state('NORMAL');
        redraw();
        set_message('已複製 ' + (down-up+1) + ' 行');
    } else if (i == '>') {
        var up   = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
        var down = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
        var left_spaces = pi314.repeat(' ', 4);
        set_state('NORMAL');
        for (var a = up; a <= down; a++) {
            data[a] = left_spaces + data[a];
            draw(a, 'NORMAL');
        }
        cursor[0] = up;
        normal_keydown('^');
        draw(cursor[0], 'CURSOR', cursor[1]);
        set_message( (down-up+1) + ' 行 > 過一次');
    } else if (i == '<') {
        var up   = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
        var down = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
        set_state('NORMAL');
        for (var a = up; a <= down; a++) {
            var left_spaces = get_left_spaces(a).slice(4);
            data[a] = left_spaces + data[a].trimLeft();
            draw(a, 'NORMAL');
        }
        cursor[0] = up;
        normal_keydown('^');
        draw(cursor[0], 'CURSOR', cursor[1]);
        set_message( (down-up+1) + ' 行 < 過一次');
    } else if (i == 'p') {
        delete_visual_line();
        cursor[1] -= 1;
        normal_keydown('p');
    } else if (i == 'r') {
        set_state('VISUAL_LINE_REPLACE_CHAR');
    }
}

var copy_visual_line = function () {
    var up   = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
    var down = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
    copy_data = data.slice(up, down + 1);
    copy_type = 'LINE';
}

var delete_visual_line = function () {
    var linenum = cursor[0];
    var pos = cursor[1];
    var up   = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
    var down = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
    data = data.slice(0, up).concat(data.slice(down+1));
    if (data.length == 0) data = [""];
    cursor[0] = up;
    cursor[0] = up > data.length-1 ? data.length-1 : up;
    normal_keydown('^');
    set_state('NORMAL');
    redraw();
}
