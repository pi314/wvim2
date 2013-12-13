var change_keydown = function (i) {
    var linenum = cursor[0];
    var pos = cursor[1];
    if (i == 'ESC') {
        set_state('NORMAL');
    } else if (i == 'i') {
        set_state('CHANGE_IN');
    } else if (i == 'l' || i == 'SPACE' || i == 'RIGHT') {
        data[linenum] = data[linenum].slice(0, pos) + data[linenum].slice(pos+1);
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'h' || i == 'BACKSPACE' || i == 'LEFT') {
        if (pos > 0) {
            data[linenum] = data[linenum].slice(0, pos-1) + data[linenum].slice(pos);
            cursor[1] = 0 < pos ? pos-1 : pos;
        }
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == '0' || i == '|') {
        data[linenum] = data[linenum].slice(pos);
        cursor[1] = 0;
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == '^') {
        normal_keydown('^');
        data[linenum] = data[linenum].slice(0, cursor[1]) + data[linenum].slice(pos);
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'j') {
        data = data.slice(0, linenum)
            .concat( get_left_spaces(linenum) )
            .concat( data.slice(linenum+2) );
        normal_keydown('^');
        set_state('INSERT');
        redraw();
    } else if (i == 'k') {
        if (linenum > 1) {
            data = data.slice(0, linenum - 1)
                .concat( get_left_spaces(linenum - 1) )
                .concat( data.slice(linenum+1) );
            cursor[0] = linenum - 1;
            normal_keydown('^');
            set_state('INSERT');
            redraw();
        } else {
            set_state('NORMAL');
        }
    } else if (i in pi314.set('jk')) {
        set_state('INSERT');
        redraw();
    } else if (i == '$') {
        normal_keydown('C');
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'w') {
        delete_cursor = [cursor[0], cursor[1]];
        var data_string = data.join('\n');
        var pos = get_data_line_pos();
        var curr_type = '';
        var next_type = '';
        var cont = true;
        if (pos == data_string.length - 1) {
            cont = false;
        }

        while (cont) {
            curr_type = char_type(data_string[pos]);
            if (pos == data_string.length - 1) {
                break;
            } else {
                next_type = char_type(data_string[pos+1]);
                switch (curr_type + '_' + next_type) {
                case 'ALPHABET_OTHER':
                case 'ALPHABET_SPACE':
                case 'ALPHABET_CRLF':
                case 'SPACE_ALPHABET':
                case 'SPACE_OTHER':
                case 'SPACE_CRLF':
                case 'OTHER_SPACE':
                case 'OTHER_ALPHABET':
                case 'OTHER_CRLF':
                    cont = false; break;
                }
                if (cont)
                    pos = pos + 1;
            }
        }
        set_state('INSERT');
        cursor = line_pos_to_cursor(pos);
        delete_diff(1);
        redraw();
    } else if (i == 'b') {
        delete_cursor = [cursor[0], cursor[1]];
        var cover = 0;
        var data_string = data.join('\n');
        var pos = get_data_line_pos();
        var next_type = '';
        var curr_type = '';
        var cont = true;
        if (pos == 0) {
            return;
        }
        pos -= 1;
        while (cont) {
            curr_type = char_type(data_string[pos]);
            if (pos == 0) {
                break;
            } else {
                next_type = char_type(data_string[pos-1]);
                console.log(curr_type, next_type);
                switch (curr_type + '_' + next_type) {
                case 'ALPHABET_SPACE':
                case 'ALPHABET_OTHER':
                case 'ALPHABET_CRLF':
                case 'OTHER_SPACE':
                case 'OTHER_ALPHABET':
                case 'CRLF_CRLF':
                    cont = false; break;
                }
                if (cont)
                    pos = pos - 1;
            }
        }
        set_state('INSERT');
        cursor = line_pos_to_cursor(pos);
        delete_diff(cover);
        redraw();
    } else if (i == 'e') {
        delete_cursor = [cursor[0], cursor[1]];
        normal_keydown('e');
        set_state('INSERT');
        delete_diff(1);
        redraw();
    } else if (i == 'f') {
        set_state('CHANGE_FIND');
    } else if (i == 'F') {
        set_state('CHANGE_DNIF');
    } else if (i == 'c') {
        normal_keydown('S');
        set_state('INSERT');
    } else if (i == 't') {
        set_state('CHANGE_TO');
    } else if (i == 'c') {
        normal_keydown('^');
        normal_keydown('D');
        normal_keydown('A');
        set_state('INSERT');
    } else {
        set_state('NORMAL');
    }
}
