var replace_char_keydown = function (i, orig_state) {
    if (i == 'ESC' || i == 'BACKSPACE') {
        set_state('NORMAL');
    } else {
        set_state('NORMAL');
        switch (orig_state) {
        case 'NORMAL':
            data[cursor[0]] = data[cursor[0]].slice(0, cursor[1])
                + i + data[cursor[0]].slice(cursor[1]+1);
            draw(cursor[0], 'CURSOR', cursor[1]);
            break;
        case 'VISUAL_LINE':
            var up   = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
            var down = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
            for (var a = up; a <= down; a++) {
                data[a] = pi314.repeat(i, data[a].length);
                draw(a, 'NORMAL');
            }
            draw(cursor[0], 'CURSOR', cursor[1]);
        case 'VISUAL':
            var a = pi314.ary_lt(visual_cursor, cursor) ? visual_cursor : cursor;
            var b = pi314.ary_lt(visual_cursor, cursor) ? cursor : visual_cursor;
            var left_linenum = a[0];
            var left_pos = a[1];
            var right_linenum = b[0];
            var right_pos = b[1];
            if (left_linenum == right_linenum) {
                data[left_linenum] =
                    data[left_linenum].slice(0, left_pos)
                    + pi314.repeat(i, right_pos - left_pos + 1)
                    + data[left_linenum].slice(right_pos + 1);
                draw(cursor[0], 'CURSOR', cursor[1]);
            } else {
                data[left_linenum] =
                    data[left_linenum].slice(0, left_pos)
                    + pi314.repeat(i, data[left_linenum].length - left_pos)
                draw(left_linenum, 'NORMAL');
                for (var a = left_linenum + 1; a < right_linenum; a++) {
                    data[a] = pi314.repeat(i, data[a].length);
                    draw(a, 'NORMAL');
                }
                data[right_linenum] =
                    pi314.repeat(i, right_pos+1)
                    + data[right_linenum].slice(right_pos+1);
                draw(right_linenum, 'NORMAL');
                draw(cursor[0], 'CURSOR', cursor[1]);
            }
        case 'VISUAL_BLOCK':
            var up    = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
            var down  = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
            var left  = visual_cursor[1] <= cursor[1] ? visual_cursor[1] : cursor[1];
            var right = visual_cursor[1] <= cursor[1] ? cursor[1] : visual_cursor[1];
            for (var a = up; a <= down; a++) {
                if (right < data[a].length) {
                    data[a] =
                        data[a].slice(0, left)
                        + pi314.repeat(i, right-left+1)
                        + data[a].slice(right+1);
                } else {
                    data[a] = 
                        data[a].slice(0, left)
                        + pi314.repeat(i, data[a].length-left+1);
                }
                draw(a, 'NORMAL');
            }
            draw(cursor[0], 'CURSOR', cursor[1]);
            break;
        }
    }
}
