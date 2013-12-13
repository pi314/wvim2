var visual_block_keydown = function (i) {
    var linenum = cursor[0];
    var pos = cursor[1];
    var up    = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
    var down  = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
    var left  = visual_cursor[1] <= cursor[1] ? visual_cursor[1] : cursor[1];
    var right = visual_cursor[1] <= cursor[1] ? cursor[1] : visual_cursor[1];
    if (i == 'ESC') {
        cursor[1] = data[linenum].length <= pos ? data[linenum].length-1 : pos;
        cursor[1] = cursor[1] < 0 ? 0 : cursor[1];
        set_state('NORMAL');
        redraw();
    } else if (i == 'v') {
        set_state('VISUAL');
        redraw();
    } else if (i == 'V') {
        set_state('VISUAL_LINE');
        redraw();
    } else if (i == '<C-v>') {
        set_state('NORMAL');
        redraw();
    } else if (i in pi314.set(['i', 'a'])) {
        // disable
    } else if (i == 'x' || i == 'X' || i == 'd') {
        copy_visual_block();
        delete_visual_block();
        set_state('NORMAL');
        redraw();
    } else if (i == 'D') {
        copy_data = [];
        for (var a = up; a <= down; a++) {
            copy_data[a-up] = data[a].slice(left);
        }
        copy_type = 'BLOCK';

        for (var a = up; a <= down; a++) {
            data[a] = data[a].slice(0, left);
        }
        cursor = [up, left];
        set_state('NORMAL');
        redraw();
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
        set_state('VISUAL_BLOCK_FIND');
    } else if (i == 'F') {
        set_state('VISUAL_BLOCK_DNIF');
    } else if (i == 'S' || i == 'R') {
        visual_line_keydown('S');
    } else if (i == 'o') {
        var temp = cursor;
        cursor = visual_cursor;
        visual_cursor = temp;
        redraw();
    } else if (i == 'O') {
        var temp = cursor[1];
        cursor[1] = visual_cursor[1];
        visual_cursor[1] = temp;
        redraw();
    } else if (i == 's' || i == 'c') {
        for (var a = up; a <= down; a++) {
            data[a] = data[a].slice(0, left) + data[a].slice(right+1);
        }
        cursor = [up, left];
        visual_cursor = [down, left];
        set_state('INSERT_BLOCK');
        redraw();
    } else if (i == 'S' || i == 'R') {
        visual_line_keydown('S');
    } else if (i == 'C') {
        for (var a = up; a <= down; a++) {
            data[a] = data[a].slice(0, left);
        }
        cursor = [up, left];
        visual_cursor = [down, left];
        set_state('INSERT_BLOCK');
        redraw();
    } else if (i == 'I') {
        cursor = [up, left];
        visual_cursor = [down, left];
        set_state('INSERT_BLOCK');
        redraw();
    } else if (i == 'A') {
        cursor = [up, right+1];
        visual_cursor = [down, right+1];
        set_state('INSERT_BLOCK');
        redraw();
    } else if (i == 'y') {
        copy_visual_block();
        set_state('NORMAL');
        redraw();
        set_message('已複製 ' + (down-up+1) + ' 行');
    } else if (i == '>') {
        visual_line_keydown('>');
    } else if (i == '<') {
        visual_line_keydown('<');
    } else if (i == 'p') {
        delete_visual_block();
        cursor[1] -= 1;
        normal_keydown('p');
    } else if (i == 'r') {
        set_state('VISUAL_BLOCK_REPLACE_CHAR');
    }
}

var copy_visual_block = function () {
    var up    = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
    var down  = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
    var left  = visual_cursor[1] <= cursor[1] ? visual_cursor[1] : cursor[1];
    var right = visual_cursor[1] <= cursor[1] ? cursor[1] : visual_cursor[1];
    copy_data = [];
    for (var a = up; a <= down; a++) {
        copy_data[a-up] = data[a].slice(left, right+1);
    }
    copy_type = 'BLOCK';
}

var delete_visual_block = function () {
    var linenum = cursor[0];
    var pos = cursor[1];
    var up    = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
    var down  = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
    var left  = visual_cursor[1] <= cursor[1] ? visual_cursor[1] : cursor[1];
    var right = visual_cursor[1] <= cursor[1] ? cursor[1] : visual_cursor[1];
    for (var a = up; a <= down; a++) {
        data[a] = data[a].slice(0, left) + data[a].slice(right+1);
    }
    cursor = [up, left];
}
