var insert_block_keydown = function (i) {
    if (i == 'ESC') {
        cursor[1] = cursor[1] - 1;
        cursor[1] = cursor[1] < 0 ? 0 : cursor[1];
        var insert_str = data[cursor[0]].slice(visual_cursor[1], cursor[1]+1);
        console.log('insert_str', insert_str);
        for (var a = cursor[0]+1; a <= visual_cursor[0]; a++) {
            data[a] = data[a].slice(0, visual_cursor[1])
                + insert_str + data[a].slice(visual_cursor[1]);
            draw(a, 'NORMAL');
        }
        draw(cursor[0], 'CURSOR', cursor[1]);
        set_state('NORMAL');
    } else if (i == 'BACKSPACE') {
        normal_keydown('X');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else {
        var linenum = cursor[0];
        var pos = cursor[1];
        if (i == 'BACKSLASH') i = '\\';
        else if (i == 'SPACE') i = ' ';
        if (i == 'ENTER') {
            var cut_left = data[linenum].slice(0, pos);
            var cut_right = data[linenum].slice(pos);
            data = data.slice(0, linenum)
                .concat(cut_left)
                .concat(cut_right)
                .concat(data.slice(linenum+1));
            cursor[0] += 1;
            cursor[1] = 0;
            redraw();
        } else {
            data[linenum] = data[linenum].slice(0, pos) + i + data[linenum].slice(pos);
            cursor[1] += 1;
            draw(cursor[0], 'CURSOR', cursor[1]);
        }
    }
}
