var normal_keydown = function (i) {
    var linenum = cursor[0];
    var pos = cursor[1];
    if (i == 'i') {
        cursor[1] = data[linenum].length-1 < cursor[1] ? data[linenum].length-1 : cursor[1];
        cursor[1] = cursor[1] < 0 ? 0 : cursor[1];
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'a') {
        set_state('INSERT');
        cursor[1] = pos+1;
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'A') {
        cursor[1] = data[linenum].length;
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'I') {
        normal_keydown('^');
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'x') {
        data[linenum] = data[linenum].slice(0, pos) + data[linenum].slice(pos+1);
        cursor[1] = pos < data[linenum].length ? pos : data[linenum].length-1;
        pos = cursor[1];
        cursor[1] = pos < 0 ? 0 : pos;
        draw(cursor[0], 'CURSOR', cursor[1]);
        push_history();
    } else if (i == 'X') {
        if (pos > 0) {
            data[linenum] = data[linenum].slice(0, pos-1) + data[linenum].slice(pos);
            cursor[1] = 0 < pos ? pos-1 : pos;
        }
        draw(cursor[0], 'CURSOR', cursor[1]);
        push_history();
    } else if (i == 'l' || i == 'SPACE' || i == 'RIGHT') {
        cursor[1] = pos+1 < data[linenum].length ? pos+1 : pos;
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'h' || i == 'BACKSPACE' || i == 'LEFT') {
        cursor[1] = data[linenum].length-1 <= cursor[1] ? data[linenum].length-1:cursor[1];
        cursor[1] = 0 <= cursor[1] - 1 ? cursor[1]-1 : cursor[1];
        if (data[linenum].length > 1) {
            if (cursor[1] >= data[linenum].length) {
                cursor[1] = data[linenum].length-2;
            }
        }
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'k' || i == 'UP') {
        draw(cursor[0], 'NORMAL');
        cursor[0] = 0 <= linenum - 1 ? linenum-1 : linenum;
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'j' || i == 'DOWN') {
        draw(cursor[0], 'NORMAL');
        cursor[0] = linenum+1 <= data.length-1 ? linenum+1 : linenum;
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == '0' || i == '|') {
        cursor[1] = 0;
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == '^') {
        cursor[1] = get_left_spaces(linenum).length;
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == '$') {
        cursor[1] = data[linenum].length-1;
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'w') {
        var data_string = data.join('\n');
        var pos = get_data_line_pos();
        var last_type = '';
        var curr_type = '';
        var cont = true;
        while (cont) {
            last_type = char_type(data_string[pos]);
            if (pos == data_string.length - 1) {
                cont = false;
            } else {
                pos = pos + 1;
                curr_type = char_type(data_string[pos]);
                switch (last_type + '_' + curr_type) {
                    case 'SPACE_ALPHABET':
                    case 'SPACE_OTHER':
                    case 'OTHER_ALPHABET':
                    case 'ALPHABET_OTHER':
                    case 'CRLF_ALPHABET':
                    case 'CRLF_CRLF'     : cont = false; break;
                }
            }
        }
        draw(cursor[0], 'NORMAL');
        cursor = line_pos_to_cursor(pos);
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'b') {
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
                    case 'OTHER_SPACE':
                    case 'ALPHABET_OTHER':
                    case 'OTHER_ALPHABET':
                    case 'ALPHABET_CRLF':
                    case 'CRLF_CRLF'     : cont = false; break;
                }
                if (cont)
                    pos = pos - 1;
            }
        }
        draw(cursor[0], 'NORMAL');
        cursor = line_pos_to_cursor(pos);
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'e') {
        var data_string = data.join(' ');
        var pos = get_data_line_pos();
        var curr_type = '';
        var next_type = '';
        var cont = true;
        if (pos == data_string.length - 1) {
            return;
        }
        pos += 1;
        while (cont) {
            curr_type = char_type(data_string[pos]);
            if (pos == data_string.length - 1) {
                break;
            } else {
                next_type = char_type(data_string[pos+1]);
                switch (curr_type + '_' + next_type) {
                    case 'ALPHABET_SPACE':
                    case 'ALPHABET_OTHER':
                    case 'OTHER_SPACE':
                    case 'OTHER_ALPHABET': cont = false; break;
                }
                if (cont)
                    pos = pos + 1;
            }
        }
        draw(cursor[0], 'NORMAL');
        cursor = line_pos_to_cursor(pos);
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'D') {
        copy_data = [data[linenum].slice(cursor[1])];
        copy_type = 'NORMAL';
        data[linenum] = data[linenum].slice(0, cursor[1]);
        cursor[1] -= 1;
        draw(cursor[0], 'CURSOR', cursor[1]);
        push_history();
    } else if (i == 'o') {
        set_state('INSERT');
        data = data.slice(0, linenum+1).concat("").concat(data.slice(linenum+1));
        cursor[0] += 1;
        cursor[1] = 0;
        redraw();
    } else if (i == 'O') {
        set_state('INSERT');
        data = data.slice(0, linenum).concat("").concat(data.slice(linenum));
        cursor[1] = 0;
        redraw();
    } else if (i == 'f') {
        set_state('FIND');
    } else if (i == 'F') {
        set_state('DNIF');
    } else if (i == 'd') {
        set_state('DELETE');
    } else if (i == 'J') {
        if (linenum < data.length - 1) {
            var l1 = data[linenum].length;
            var l2 = data[linenum+1].length;
            var s2 = 0;
            while (data[linenum+1][s2] == ' ') {
                if (s2 == data[linenum+1].length - 1) {
                    break;
                }
                s2 += 1;
            }
            cursor[1] = l1;
            data[linenum] =
                data[linenum] + ' ' + data[linenum+1].slice(s2, l2);
            data = data.slice(0, linenum+1).concat( data.slice(linenum+2));
            redraw();
        }
        push_history();
    } else if (i == 'H') {
        draw(cursor[0], 'NORMAL');
        cursor[0] = display_start;
        normal_keydown('^');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'L') {
        draw(cursor[0], 'NORMAL');
        cursor[0] = display_start + total_lines;
        normal_keydown('^');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == '<C-l>') {
        set_message('');
        total_lines = belt_count();
        redraw();
    } else if (i == 'G') {
        draw(cursor[0], 'NORMAL');
        cursor[0] = data.length - 1;
        normal_keydown('^');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'g') {
        set_state('GO');
    } else if (i == '%') {
        pos = cursor[1];
        if (cursor[1] >= data[linenum].length) {
            pos = data[linenum].length - 1;
        }
        var temp = find_bracket('PAIR', cursor[0], pos);
        if (temp != null) {
            draw(cursor[0], 'NORMAL');
            cursor = temp;
            draw(cursor[0], 'CURSOR', cursor[1]);
        }
    } else if (i == 'v') {
        set_state('VISUAL');
        visual_cursor = [cursor[0], cursor[1]];
    } else if (i == 'V') {
        set_state('VISUAL_LINE');
        visual_cursor = [cursor[0], cursor[1]];
        draw(cursor[0], 'VISUAL', [0, 'END', cursor[1]]);
    } else if (i == '<C-v>') {
        set_state('VISUAL_BLOCK');
        visual_cursor = [cursor[0], cursor[1]];
    } else if (i == '{') {
        var a;
        for (a = cursor[0]-1; a > 0; a--) {
            if (data[a].length == 0) {
                break;
            }
        }
        if (a < 0) a = 0;
        draw(cursor[0], 'NORMAL');
        cursor[0] = a;
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == '}') {
        var a;
        for (a = cursor[0]+1; a < data.length-1; a++) {
            if (data[a].length == 0) {
                break;
            }
        }
        if (a == data.length) a = data.length - 1;
        draw(cursor[0], 'NORMAL');
        cursor[0] = a;
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 's') {
        data[linenum] = data[linenum].slice(0, pos) + data[linenum].slice(pos+1);
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'c') {
        set_state('CHANGE');
    } else if (i == 'C') {
        normal_keydown('D');
        normal_keydown('a');
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'S') {
        normal_keydown('^');
        normal_keydown('C');
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'u') {
        undo();
        redraw();
    } else if (i == '<C-r>') {
        redo();
        redraw();
    } else if (i == 'R') {
        set_state('REPLACE');
        replace_buffer = data[cursor[0]];
    } else if (i == 'y') {
        set_state('COPY');
    } else if (i == 'p') {
        update_history_cursor();
        if (copy_type == 'LINE') {
            data = data.slice(0, linenum+1)
                .concat( copy_data )
                .concat( data.slice(linenum+1) );
            cursor[0] += 1;
            normal_keydown('^');
        } else if (copy_type == 'NORMAL') {
            var copy_lines = copy_data.length;
            if (copy_lines == 1) {
                data = data.slice(0, linenum)
                    .concat(
                        data[linenum].slice(0, pos+1)
                        + copy_data[0]
                        + data[linenum].slice(pos+1)
                    )
                    .concat( data.slice(linenum+1) );
                cursor[1] += copy_data[0].length;
            } else {
                data = data.slice(0, linenum)
                    .concat( data[linenum].slice(0, pos+1) + copy_data[0] )
                    .concat( copy_data.slice(1, copy_lines-1) )
                    .concat( copy_data[copy_lines-1] + data[linenum].slice(pos+1))
                    .concat( data.slice(linenum+1) );
                cursor[1] += 1;
            }
        } else if (copy_type == 'BLOCK') {
            if (pos >= data[linenum].length) {
                pos = data[linenum].length-1;
            }
            var copy_lines = copy_data.length;
            for (var a = 0; a < copy_lines; a++) {
                if (data.length-1 < linenum+a) {
                    data = data.concat(pi314.repeat(' ', pos+1));
                } else if (data[linenum+a].length < pos) {
                    data[linenum+a] =
                        data[linenum+a] + pi314.repeat(' ', pos-data[linenum+a].length+1);
                }
                data[linenum+a] =
                    data[linenum+a].slice(0, pos+1)
                    + copy_data[a]
                    + data[linenum+a].slice(pos+1);
            }
            cursor[1] = pos + 1;
        }
        push_history();
        redraw();
    } else if (i == ':') {
        command_data = ':';
        command_cursor = 1;
        draw(cursor[0], 'NORMAL');
        set_state('COMMAND');
        draw_command(command_cursor);
    } else if (i == 'r') {
        set_state('REPLACE_CHAR');
    } else if (i == '<C-c>') {
        set_message('wvim 會把 ^C 抓走，所以得用右鍵複製內容喔');
    } else if (i == '<C-e>') {
        if (display_start < data.length - 1) {
            display_start += 1;
            if (cursor[0] < display_start) {
                cursor[0] += 1;
            }
            redraw();
        }
    } else if (i == '<C-y>') {
        if (display_start > 0) {
            display_start -= 1;
            if (cursor[0] > display_start + total_lines) {
                cursor[0] -= 1;
            }
            redraw();
        }
    } else if (i == '<') {
        set_state('SHIFT_LEFT');
    } else if (i == '>') {
        set_state('SHIFT_RIGHT');
    }
    console.log("normal keydown:", i, cursor);
}
