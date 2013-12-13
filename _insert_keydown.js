var insert_keydown = function (i) {
    if (i == 'ESC') {
        cursor[1] = data[cursor[0]].length <= cursor[1] ? data[cursor[0]].length-1:cursor[1] - 1;
        cursor[1] = cursor[1] < 0 ? 0 : cursor[1];
        draw(cursor[0], 'CURSOR', cursor[1]);
        set_state('NORMAL');
    } else if (i == 'BACKSPACE') {
        normal_keydown('X');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'UP') {
        normal_keydown('k');
    } else if (i == 'LEFT') {
        normal_keydown('h');
    } else if (i == 'RIGHT') {
        normal_keydown('l');
    } else if (i == 'DOWN') {
        normal_keydown('j');
    } else {
        var linenum = cursor[0];
        var pos = cursor[1];
        if (i == 'BACKSLASH')  i = '\\';
        else if (i == 'SPACE') i = ' ';
        else if (i == 'TAB')   i = '    ';
        if (i == 'ENTER') {
            var cut_left = data[linenum].slice(0, pos);
            var cut_right = data[linenum].slice(pos);
            var left_spaces = get_left_spaces(cursor[0]);
            data = data.slice(0, linenum)
                .concat(cut_left)
                .concat(left_spaces + cut_right)
                .concat(data.slice(linenum+1));
            cursor[0] += 1;
            cursor[1] = left_spaces.length;
            redraw();
        } else {
            data[linenum] = data[linenum].slice(0, pos) + i + data[linenum].slice(pos);
            cursor[1] += i.length;
            draw(cursor[0], 'CURSOR', cursor[1]);
        }
    }
}
