var replace_keydown = function (i) {
    if (i == 'ESC') {
        cursor[1] = cursor[1] - 1;
        cursor[1] = cursor[1] < 0 ? 0 : cursor[1];
        draw(cursor[0], 'CURSOR', cursor[1]);
        set_state('NORMAL');
    } else if (i == 'BACKSPACE') {
        if (cursor[1] > 0) {
            if (cursor[1] > replace_buffer.length) {
                data[cursor[0]] = data[cursor[0]].slice(0, cursor[1]-1)
            } else {
                data[cursor[0]] = data[cursor[0]].slice(0, cursor[1]-1)
                    + replace_buffer[cursor[1]-1] + data[cursor[0]].slice(cursor[1]);
            }
            cursor[1] -= 1;
            draw(cursor[0], 'CURSOR', cursor[1]);
        }
    } else {
        if (i.length == 1) {
            data[cursor[0]] = data[cursor[0]].slice(0, cursor[1])
                + i + data[cursor[0]].slice(cursor[1]+1);
            cursor[1] += 1;
            draw(cursor[0], 'CURSOR', cursor[1]);
        }
    }
}
