$(function () {

wvim = (function () {
    var data = [''];


    var copy_data = [''];
    var copy_type = '';

    var history = [ [ [0,0], [''] ] ];
    var history_pos = 0;
    var replace_buffer = '';

    var command_data = ';';
    var command_cursor = 0;

    var message_data = '';
    var message_type = '';

    var total_lines = 1;
    var display_start = 0;

    var cursor = [0, 0];
    var visual_cursor = null;
    var pair_bracket_cursor = null;
    var delete_cursor = null;
    var cover = 0;
    var state = 'NORMAL';
    var char_set = pi314.set(ALPHABET + NUMBER + '_');
    var bracket_set = {
            '(':')', ')':'(', '[':']', ']':'[', '{':'}', '}':'{',
            '<':'>', '>':'<'
        };
    var left_bracket_set = pi314.set('([{<');

    var bind_command_list = {};

    var wvim_global_vars = {'nu': true};

var wrap_v_bracket = function (i) {
    var ret = '';
    for (var a = 0; a < i.length; a++) {
        if (i[a] == '<') {
            ret += '<span><</span>';
        } else {
            ret += i[a];
        }
    }
    return ret;
}
var wrap_visual = function (i) {
    var ret = '';
    for (var a = 0; a < i.length; a++) {
        ret += '<span class="visual">' + i[a] + '</span>';
    }
    return ret;
}
var char_type = function (i) {
    if (i in char_set) return 'ALPHABET';
    if (i == ' ') return 'SPACE';
    if (i == '\n') return 'CRLF';
    return 'OTHER';
}

var get_data_line_pos = function () {
    var sum = 0;
    var pos = 0;
    for (var a = 0; a < data.length; a++) {
        if (a == cursor[0]) {
            pos = sum + cursor[1];
        }
        sum += data[a].length + 1;
    }
    return pos;
}

var line_pos_to_cursor = function (pos) {
    var new_cursor = [0, 0];
    console.log(pos);
    for (var a = 0; a < data.length; a++) {
        if (pos < data[a].length + 1) {
            new_cursor[0] = a;
            new_cursor[1] = pos;
            break;
        } else {
            pos -= data[a].length + 1;
        }
    }
    console.log(new_cursor);
    return new_cursor;
}

var get_left_spaces = function (linenum) {
    return pi314.repeat(' ', data[linenum].length - data[linenum].trimLeft().length);
}

var set_message = function (message) {
    message_data = message;
    message_type = 'NORMAL';
}

var set_alert = function (message) {
    message_data = message;
    message_type = 'ALERT';
}

var show_message = function () {
    if (get_state() == 'COMMAND') return;
    if (message_type == 'NORMAL') {
        $('#wvim_status').text(message_data);
    } else if (message_type == 'ALERT') {
        $('#wvim_status').html('<span id="alert">' + message_data + '</span>');
    }
}
var find_bracket = function (type, linenum, pos, bracket) {
    var forward = '';
    if (type == 'NEXT') {
        bracket = bracket.replace('(', ')').replace('[', ']')
            .replace('{', '}').replace('<', '>');
        dir = 'FORWARD';
    } else if (type == 'LAST') {
        dir = 'BACKWARD';
    } else if (type == 'PAIR') {
        bracket = bracket_set[data[linenum][pos]];
        if (data[linenum][pos] in left_bracket_set) {
            dir = 'FORWARD';
        } else {
            dir = 'BACKWARD';
        }
    }

    if (dir == 'FORWARD') {
        while (true) {
            if (data[linenum][pos] == bracket) {
                return [linenum, pos];
            }
            console.log(linenum, pos);
            pos += 1;
            if (pos >= data[linenum].length) {
                linenum += 1;
                if (linenum == data.length) {
                    break;
                } else {
                    pos = 0;
                }
            }
        }
    } else {
        while (true) {
            if (data[linenum][pos] == bracket) {
                return [linenum, pos];
            }
            console.log(linenum, pos);
            pos -= 1;
            if (pos <= -1) {
                linenum -= 1;
                if (linenum == -1) {
                    break;
                } else {
                    pos = data[linenum].length - 1;
                }
            }
            if (data[linenum][pos] == bracket) {
                return [linenum, pos];
            }
        }
    }
    return null;
}
var set_state = function (s) {
    if (get_state() != 'NORMAL' && s == 'NORMAL') {
        if (data_dirty()) {
            push_history();
            console.log('dirty');
        }
    }
    if (s == 'NORMAL') {
        visual_cursor = null;
        delete_cursor = null;
        pair_bracket_cursor = null;
    }
    state = s;
    var message = ''
    switch (state) {
        case 'NORMAL':       message = '';               break;
        case 'INSERT':       message = '--插入--';       break;
        case 'DELETE_FIND':
        case 'VISUAL_LINE_FIND':
        case 'VISUAL_FIND':
        case 'VISUAL_BLOCK_FIND':
        case 'CHANGE_FIND':
        case 'FIND':         message = '--向右尋找--';   break;
        case 'DELETE_DNIF':
        case 'VISUAL_LINE_DNIF':
        case 'VISUAL_DNIF':
        case 'VISUAL_BLOCK_DNIF':
        case 'CHANGE_DNIF':
        case 'DNIF':         message = '--向左尋找--';   break;
        case 'DELETE':       message = '--刪除--';       break;
        case 'DELETE_IN':    message = '--刪除括號內--'; break;
        case 'DELETE_DNIF':  message = '--向左尋找--';   break;
        case 'GO':           message = '';               break;
        case 'VISUAL_LINE':  message = '--[行]--';       break;
        case 'VISUAL':       message = '--選取--';       break;
        case 'VISUAL_BLOCK': message = '--[區塊]--';     break;
        case 'INSERT_BLOCK': message = '--插入--';       break;
        case 'CHANGE':       message = '--更改--';       break;
        case 'VISUAL_REPLACE':
        case 'VISUAL_LINE_REPLACE':
        case 'VISUAL_BLOCK_REPLACE':
        case 'REPLACE_CHAR':
        case 'REPLACE':      message = '--取代--';       break;
        case 'COPY':         message = '--複製--';       break;
        case 'DELETE_TO':    message = '--刪除至--';     break;
        case 'CHANGE_TO':    message = '--更改至--';     break;
        case 'SHIFT_LEFT':   message = '--左移--';       break;
        case 'SHIFT_RIGHT':  message = '--右移--';       break;
    }
    set_message(message);
}

get_state = function () {
    return state;
}
var redraw = function () {
    var lines = data.length;
    var line_wrap_e = '</tr>';
    var linenum_wrap_s = '<td class="linenum">';
    var linenum_wrap_e = '</td>'
    var text_wrap_e = '</td>';
    var a;

    $('#wvim_text').html('');
    for (a = display_start; a < lines && a < display_start + total_lines; a++) {
        var line_wrap_s = '<tr class="line" id="line_' + a + '">';
        var text_wrap_s = '<td class="text" id="text_' + a + '">';
        var linenum_str = linenum_wrap_s + (a+1) + linenum_wrap_e;
        if (!get_wvim_global_var('nu')) {
            linenum_str = '';
        }
        $('#wvim_text').append(
            line_wrap_s +
                linenum_str +
                text_wrap_s + text_wrap_e +
            line_wrap_e
        );
        draw(a, 'NORMAL');
    }
    draw(cursor[0], 'CURSOR', cursor[1]);

    redraw_visual();

    var empty_line = '<tr class="line"><td class="empty">~</td><td class="text"></td></tr>';
    for (; a < display_start + total_lines; a++) {
        $('#wvim_text').append(empty_line);
    }
}
var draw = function (linenum, type, pos) {
    if (linenum < 0) return;
    if (linenum >= data.length) return;

    switch (type) {
        case 'NORMAL': draw_normal(linenum);        break;
        case 'CURSOR': draw_cursor(linenum, pos);   break;
        case 'VISUAL': draw_visual(linenum, pos);   break;
        case 'BRACKET': draw_bracket(linenum, pos); break;
        default: alert("warning"); break;
    }
    
    return;
}

var draw_command = function (pos) {
    var cursor_str = ' ';
    if (pos <= command_data.length - 1) {
        cursor_str = command_data[pos];
    }
    var data1 = wrap_v_bracket( command_data.slice(0, pos) );
    var data2 = wrap_v_bracket( command_data.slice(pos+1)  );
    var line_content =
        data1 + 
        '<span class="cursor">' + cursor_str + '</span>' +
        data2;
    $('#wvim_status').html(line_content);
}
var draw_normal = function (linenum) {
    //$($('.line')[linenum]).text(line_content);
    if (data[linenum] == '') {
        $('#text_'+linenum+'').text(' ');
    } else {
        $('#text_'+linenum+'').text(data[linenum]);
    }
}
var draw_cursor = function (linenum, pos) {
    var cursor_str = '';

    if (data[linenum].length == 0) {
        cursor_str = ' ';
    } else if (data[linenum].length <= pos) {
        if (state == 'NORMAL') {
            pos = data[linenum].length-1;
            cursor_str = data[linenum][pos];
        } else {
            cursor_str = ' ';
        }
    } else {
        cursor_str = data[linenum][pos];
    }

    var data1 = wrap_v_bracket(data[linenum].slice(0, pos));
    var data2 = wrap_v_bracket(data[linenum].slice(pos+1));
    var line_content =
            data1 +
            '<span class="cursor">' + cursor_str + '</span>' +
            data2
        ;
    //$($('.line')[linenum]).html(line_content);

    $('#text_'+linenum+'').html(line_content);
}
var draw_visual = function (linenum, pos_ary) {
    if (pos_ary == null) return;

    if (pos_ary[1] == 'END') {
        pos_ary[1] = data[linenum].length;
    }

    var from = pos_ary[0] < pos_ary[1] ? pos_ary[0] : pos_ary[1];
    var to   = pos_ary[0] < pos_ary[1] ? pos_ary[1] : pos_ary[0];
    var pos  = pos_ary.length == 3 ? pos_ary[2] : -1;
    var line_content = '';

    if (pos == -1) {
        line_content += data[linenum].slice(0, from);
        line_content += wrap_visual(data[linenum].slice(from, to+1));
        line_content += data[linenum].slice(to+1);
    } else {
        var cursor_str = data[linenum].length <= pos ? ' ' : data[linenum][pos];
        line_content += wrap_v_bracket(data[linenum].slice(0, from));
        line_content += wrap_visual(data[linenum].slice(from, pos));
        line_content += '<span class="cursor">' + cursor_str + '</span>';
        line_content += wrap_visual(data[linenum].slice(pos+1, to+1));
        line_content += wrap_v_bracket(data[linenum].slice(to+1));
    }
    console.log(pos_ary, from, to, pos);
    $('#text_'+linenum+'').html(line_content);
}
var draw_bracket = function (linenum, pos_ary) {
    var pos = pos_ary[0];
    var cur0 = pos_ary.length == 2 ? pos_ary[1] : -1;
    var line_content = '';
    var visual_range = get_visual_range(linenum);
    var visual_from = visual_range[0];
    var visual_to   = visual_range[1];
    console.log('draw_bracket');
    console.log(visual_range);
    console.log(pos);
    console.log(cur0);

    if (visual_from == -1 && visual_to == -1) {
        if (cur0 == -1) {
            var data1 = wrap_v_bracket(data[linenum].slice(0, pos));
            var data2 = wrap_v_bracket(data[linenum].slice(pos+1));
            var bra_str = '<span class="bracket">' + data[linenum][pos] + '</span>';
            line_content = data1 + bra_str + data2;
        } else {
            var a = cur0 < pos ? cur0 : pos;
            var b = cur0 < pos ? pos : cur0;
            var data1 = wrap_v_bracket(data[linenum].slice(0, a));
            var data2 = wrap_v_bracket(data[linenum].slice(a+1, b));
            var data3 = wrap_v_bracket(data[linenum].slice(b+1));
            var cur_str = '<span class="cursor">' + data[linenum][cur0] + '</span>';
            var bra_str = '<span class="bracket">' + data[linenum][pos] + '</span>';
            if (cur0 < pos) {
                line_content = data1 + cur_str + data2 + bra_str + data3;
            } else {
                line_content = data1 + bra_str + data2 + cur_str + data3;
            }
        }
    } else {
        if (cur0 == -1) {
            if (pos < visual_from) {
                var data1 = wrap_v_bracket(data[linenum].slice(0, pos));
                var bra_str = '<span class="bracket">' + data[linenum][pos] + '</span>';
                var data2 = wrap_v_bracket(data[linenum].slice(pos+1, visual_from));
                var data3 = wrap_visual(data[linenum].slice(visual_from, visual_to+1));
                var data4 = wrap_v_bracket(data[linenum].slice(visual_to+1));
                line_content = data1 + bra_str + data2 + data3 + data4;
            } else if (visual_to < pos) {
                var data1 = wrap_v_bracket(data[linenum].slice(0, visual_from));
                var data2 = wrap_visual(data[linenum].slice(visual_from, visual_to+1));
                var data3 = wrap_v_bracket(data[linenum].slice(visual_to+1, pos));
                var bra_str = '<span class="bracket">' + data[linenum][pos] + '</span>';
                var data4 = wrap_v_bracket(data[linenum].slice(pos+1));
                line_content = data1 + data2 + data3 + bra_str + data4;
            } else {
                var data1 = wrap_v_bracket(data[linenum].slice(0, visual_from));
                var data2 = wrap_visual(data[linenum].slice(visual_from, visual_to+1));
                var data3 = wrap_v_bracket(data[linenum].slice(visual_to+1));
                line_content = data1 + data2 + data3;
            }
        } else {
            if (pos < visual_from) {
                var data1 = wrap_v_bracket(data[linenum].slice(0, pos));
                var bra_str = '<span class="bracket">' + data[linenum][pos] + '</span>';
                var data2 = wrap_v_bracket(data[linenum].slice(pos+1, visual_from));
                var data3 = wrap_visual(data[linenum].slice(visual_from, cur0));
                var cur_str = '<span class="cursor">' + data[linenum][cur0] + '</span>';
                var data4 = wrap_visual(data[linenum].slice(cur0+1, visual_to+1));
                var data5 = wrap_v_bracket(data[linenum].slice(visual_to+1));
                line_content = data1 + bra_str + data2 + data3 + cur_str + data4 + data5;
            } else if (visual_to < pos) {
                var data1 = wrap_v_bracket(data[linenum].slice(0, visual_from));
                var data2 = wrap_visual(data[linenum].slice(visual_from, cur0));
                var cur_str = '<span class="cursor">' + data[linenum][cur0] + '</span>';
                var data3 = wrap_visual(data[linenum].slice(cur0+1, visual_to+1));
                var data4 = wrap_v_bracket(data[linenum].slice(visual_to+1, pos));
                var bra_str = '<span class="bracket">' + data[linenum][pos] + '</span>';
                var data5 = wrap_v_bracket(data[linenum].slice(pos+1));
                line_content = data1 + data2 + cur_str + data3 + data4 + bra_str + data5;
            } else {
                var data1 = wrap_v_bracket(data[linenum].slice(0, visual_from));
                var data2 = wrap_visual(data[linenum].slice(visual_from, cur0));
                var cur_str = '<span class="cursor">' + data[linenum][cur0] + '</span>';
                var data3 = wrap_visual(data[linenum].slice(cur0+1, visual_to+1));
                var data4 = wrap_v_bracket(data[linenum].slice(visual_to+1));
                line_content = data1 + data2 + cur_str + data3 + data4;
            }
        }
    }
    $('#text_'+linenum+'').html(line_content);
}
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
var find_keydown = function (i, direction, next_state) {
    var linenum = cursor[0];
    var pos = cursor[1];
    if (i == 'ESC') {
        set_state('NORMAL');
    } else {
        if (i == 'SPACE') {
            i = ' ';
        }
        var dir = (direction == 'FORWARD')? 1 : -1;
        for (var a = pos + dir; 0 <= a && a < data[linenum].length; a += dir) {
            if (data[linenum][a] == i) {
                cursor[1] = a;
                break;
            }
        }
        set_state(next_state);
        switch (get_state()) {
        case 'NORMAL':
            draw(cursor[0], 'CURSOR', cursor[1]);
            break;
        case 'VISUAL_LINE':
        case 'VISUAL':
        case 'VISUAL_BLOCK':
            redraw_visual();
            break;
        }
    }
}

var delete_find_keydown = function (i, direction) {
    if (i == 'ESC') {
        set_state('NORMAL');
    } else {
        var cover = 1;
        if (direction == 'TO') {
            cover = 0;
            direction = 'FORWARD';
        }
        delete_cursor = [cursor[0], cursor[1]];
        find_keydown(i, direction, 'NORMAL');
        console.log(delete_cursor, cursor);
        delete_diff(cover);
        delete_cursor = null;
        set_state('NORMAL');
        draw(cursor[0], 'CURSOR', cursor[1]);
    }
}

var change_find_keydown = function (i, direction) {
    if (i == 'ESC') {
        set_state('NORMAL');
    } else {
        var cover = 1;
        if (direction == 'TO') {
            cover = 0;
            direction = 'FORWARD';
        }
        delete_cursor = [cursor[0], cursor[1]];
        find_keydown(i, direction, 'NORMAL');
        console.log(delete_cursor, cursor);
        delete_diff(cover);
        delete_cursor = null;
        set_state('INSERT');
        draw(cursor[0], 'CURSOR', cursor[1]);
    }
}
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
var go_keydown = function (i) {
    if (i == 'g') {
        draw(cursor[0], 'NORMAL');
        cursor[0] = 0;
        normal_keydown('^');
        draw(cursor[0], 'CURSOR', cursor[1]);
        set_state('NORMAL');
    } else {
        set_state('NORMAL');
    }
    console.log("go keydown:", i, cursor);
}
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
var delete_in_keydown = function (i) {
    if (i == 'ESC') {
        set_state('NORMAL');
    } else if (i in pi314.set("()[]{}<>'\"bB")) {
        if (i == '(' || i == ')' || i == 'b') {
            i = '(';
        } else if (i == '[' || i == ']') {
            i = '[';
        } else if (i == '{' || i == '}' || i == 'B') {
            i = '{';
        } else if (i == '<' || i == '>') {
            i = '<';
        }
        left_bracket_pos = find_bracket('LAST', cursor[0], cursor[1], i);
        right_bracket_pos = find_bracket('NEXT', cursor[0], cursor[1], i);
        if (left_bracket_pos == null || right_bracket_pos == null) {
            console.log('bracket not found');
            set_state('NORMAL');
            return;
        }
        var left_linenum = left_bracket_pos[0];
        var left_pos =     left_bracket_pos[1];
        var right_linenum = right_bracket_pos[0];
        var right_pos =     right_bracket_pos[1];
        if (left_linenum == right_linenum) {
            copy_data = [ data[left_linenum].slice(left_pos+1, right_pos) ]
        } else {
            copy_data =
                [data[left_linenum].slice(left_pos+1)]
                .concat( data.slice(left_linenum+1, right_linenum) )
                .concat( data[right_linenum].slice(0, right_pos) );
        }
        copy_type = 'NORMAL';
        console.log(left_bracket_pos, right_bracket_pos);
        data =
            data.slice(0, left_linenum)
            .concat(
                data[left_linenum].slice(0, left_pos+1)
                + data[right_linenum].slice(right_pos) )
            .concat( data.slice(right_linenum+1) )
            ;
        cursor[0] = left_linenum;
        cursor[1] = left_pos + 1;
        redraw();
        set_state('NORMAL');
    } else {
        set_state('NORMAL');
    }
}

var change_in_keydown = function (i) {
    if (i == 'ESC') {
        set_state('NORMAL');
    } else if (i in pi314.set("()[]{}<>'\"bB")) {
        delete_in_keydown(i);
        set_state('INSERT');
    }
}
var redraw_visual = function (type) {
    if (!type) type = get_state();
    switch (type) {
    case 'VISUAL_LINE':
        var a = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
        var b = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
        redraw_bracket();
        for (var i = a; i <= b; i++) {
            draw(i, 'VISUAL', [0, 'END']);
        }
        draw(cursor[0], 'VISUAL', [0, 'END', cursor[1]]);
        break;
    case 'VISUAL':
        var a = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
        var b = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
        redraw_bracket();
        for (var i = a+1; i < b; i++) {
            draw(i, 'VISUAL', [0, 'END']);
        }
        var cursor_line_range = [];
        var visual_line_range = [];
        if (cursor[0] < visual_cursor[0]) {
            cursor_line_range = [cursor[1], 'END', cursor[1]];
            visual_line_range = [0, visual_cursor[1]];
        } else if (visual_cursor[0] < cursor[0]) {
            visual_line_range = [visual_cursor[1], 'END'];
            cursor_line_range = [0, cursor[1], cursor[1]];
        } else {
            cursor_line_range = [cursor[1], visual_cursor[1], cursor[1]];
            visual_line_range = null;
        }
        draw(cursor[0], 'VISUAL', cursor_line_range);
        draw(visual_cursor[0], 'VISUAL', visual_line_range);
        break;
    case 'VISUAL_BLOCK':
        var eq_cursor = [cursor[0], cursor[1]];
        if (eq_cursor[1] >= data[cursor[0]].length) {
            eq_cursor[1] = data[cursor[0]].length;
        }

        var up    = visual_cursor[0] <= eq_cursor[0] ? visual_cursor[0] : eq_cursor[0];
        var down  = visual_cursor[0] <= eq_cursor[0] ? eq_cursor[0] : visual_cursor[0];
        var left  = visual_cursor[1] <= eq_cursor[1] ? visual_cursor[1] : eq_cursor[1];
        var right = visual_cursor[1] <= eq_cursor[1] ? eq_cursor[1] : visual_cursor[1];
        redraw_bracket();
        for (var i = up; i <= down; i++) {
            draw(i, 'VISUAL', [left, right]);
        }
        draw(cursor[0], 'VISUAL', [left, right, cursor[1]]);
        break;
    }
}
var redraw_bracket = function () {
    var check_pos = cursor[1];
    if (check_pos >= data[cursor[0]].length) {
        if (get_state() == 'NORMAL') {
            check_pos = data[cursor[0]].length - 1;
        }
    }
    if (data[cursor[0]][check_pos] in bracket_set) {
        pair_bracket_cursor = find_bracket('PAIR', cursor[0], check_pos);
        if (pair_bracket_cursor != null) {
            if (pair_bracket_cursor[0] == cursor[0]) {
                draw(pair_bracket_cursor[0], 'BRACKET', [pair_bracket_cursor[1], check_pos]);
            } else {
                draw(pair_bracket_cursor[0], 'BRACKET', [pair_bracket_cursor[1]]);
            }
        }
    } else {
        if (pair_bracket_cursor != null) {
            if (pair_bracket_cursor[0] == cursor[0]) {
                draw(cursor[0], 'CURSOR', cursor[1]);
            } else {
                draw(pair_bracket_cursor[0], 'NORMAL');
            }
            pair_bracket_cursor = null;
        }
    }
}
var get_visual_range = function (linenum) {
    if (visual_cursor == null) return [-1, -1];
    var a = pi314.ary_lt(cursor, visual_cursor) ? cursor : visual_cursor;
    var b = pi314.ary_lt(cursor, visual_cursor) ? visual_cursor : cursor;
    var a_linenum = a[0];
    var a_pos = a[1];
    var b_linenum = b[0];
    var b_pos = b[1];

    switch(get_state()) {
        case 'VISUAL':
            if (a_linenum == b_linenum && linenum == a_linenum) {
                return [a_pos, b_pos];
            } else if (a_linenum < linenum && linenum < b_linenum) {
                return [ 0, data[linenum].length-1 ];
            } else if (a_linenum == linenum) {
                return [ a_pos, data[a_linenum].length-1 ];
            } else if (b_linenum == linenum) {
                return [0, b_pos];
            } else {
                return [-1, -1];
            }
            break;
        case 'VISUAL_LINE':
            if (a_linenum <= linenum || linenum <= b_linenum) {
                return [ 0, data[linenum].length-1 ];
            } else {
                return [-1, -1];
            }
            break;
        default:
            return [-1, -1];
    }
}
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
var undo = function () {
    console.log('undo');
    console.log(history_pos);
    if (history_pos > 0) {
        history_pos -= 1;
        console.log('history_pos', history_pos);
        recover();
        set_message('');
    } else {
        set_message('Already at oldest change');
    }
}

var redo = function () {
    console.log('redo');
    if (history_pos < history.length - 1) {
        history_pos += 1;
        recover();
        set_message('');
    } else {
        set_message('Already at newest change');
    }
}

var recover = function () {
    cursor_data = history[history_pos];
    old_cursor = cursor_data[0];
    old_data   = cursor_data[1];
    cursor = [old_cursor[0], old_cursor[1]];
    data = [];
    for (var a = 0; a < old_data.length; a++) {
        data.push(old_data[a]);
    }
}

var update_history_cursor = function () {
    history[history.length-1][0] = [cursor[0], cursor[1]];
}

var push_history = function () {
    console.log('push_history');
    var current_data = [];
    var current_cursor = [cursor[0], cursor[1]];
    for (var a = 0; a < data.length; a++) {
        current_data.push(data[a]);
    }
    if (history_pos < history.length - 1) {
        history = history.slice(0, history_pos+1);
    }
    history.push([current_cursor, current_data]);
    history_pos += 1;
    console.log(history);
}

var data_dirty = function () {
    return pi314.ary_ne(history[history.length-1][1], data);
}
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
var copy_keydown = function (i) {
    var linenum = cursor[0];
    if (i == 'ESC') {
        set_state('NORMAL');
    } else if (i == 'y') {
        copy_data = [data[linenum]];
        copy_type = 'LINE';
        set_state('NORMAL');
        set_message('已複製 1 行');
    } else {
        set_state('NORMAL');
    }
}
var command_keydown = function (i) {
    if (i == 'ESC' || i == '<C-c>') {
        set_state('NORMAL');
        draw(cursor[0], 'CURSOR', cursor[1]);
    } else if (i == 'ENTER') {
        set_state('NORMAL');
        draw(cursor[0], 'CURSOR', cursor[1]);
        command_data_list = command_data.split(/ +/);
        command = command_data_list[0];
        if (command in bind_command_list) {
            (bind_command_list[command])(command_data_list.slice(1), data);
        } else {
            set_alert('這個功能沒有被實作唷');
        }
    } else if (i == 'BACKSPACE') {
        if (command_cursor > 1) {
            command_data =
                command_data.slice(0, command_cursor-1)
                + command_data.slice(command_cursor);
            command_cursor -= 1;
            draw_command(command_cursor);
        } else {
            set_state('NORMAL');
            draw(cursor[0], 'CURSOR', cursor[1]);
        }
    } else if (i == 'LEFT') {
        command_cursor = command_cursor > 1 ? command_cursor-1 : command_cursor;
        draw_command(command_cursor);
    } else if (i == 'RIGHT') {
        command_cursor = command_cursor < command_data.length ? command_cursor+1 : command_cursor;
        draw_command(command_cursor);
    } else {
        if (i == 'SPACE') {
            i = ' ';
        }
        command_data += i;
        command_cursor += 1;
        draw_command(command_cursor);
    }
}
var set_wvim_global_var = function (args) {
    if (args.length == 1) {
        switch (args[0]) {
        case 'nu':
            wvim_global_vars['nu'] = true;
            redraw();
            break;
        case 'nu!':
        case 'nonu':
            wvim_global_vars['nu'] = false;
            redraw();
            break;
        }
    }
    console.log(wvim_global_vars);
}

var get_wvim_global_var = function (key) {
    if (key in wvim_global_vars) return wvim_global_vars[key];
    return false;
}
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
var copy_in_keydown = function (i) {
    if (i == 'ESC') {
        set_state('NORMAL');
    } else if (i in pi314.set("()[]{}<>'\"bB")) {
        if (i == '(' || i == ')' || i == 'b') {
            i = '(';
        } else if (i == '[' || i == ']') {
            i = '[';
        } else if (i == '{' || i == '}' || i == 'B') {
            i = '{';
        } else if (i == '<' || i == '>') {
            i = '<';
        }
        left_bracket_pos = find_bracket('LAST', cursor[0], cursor[1], i);
        right_bracket_pos = find_bracket('NEXT', cursor[0], cursor[1], i);
        if (left_bracket_pos == null || right_bracket_pos == null) {
            console.log('bracket not found');
            set_state('NORMAL');
            return;
        }
        var left_linenum = left_bracket_pos[0];
        var left_pos =     left_bracket_pos[1];
        var right_linenum = right_bracket_pos[0];
        var right_pos =     right_bracket_pos[1];
        if (left_linenum == right_linenum) {
            copy_data = [ data[left_linenum].slice(left_pos+1, right_pos) ]
        } else {
            copy_data =
                [data[left_linenum].slice(left_pos+1)]
                .concat( data.slice(left_linenum+1, right_linenum) )
                .concat( data[right_linenum].slice(0, right_pos) );
        }
        copy_type = 'NORMAL';
        console.log(left_bracket_pos, right_bracket_pos);
        //data =
        //    data.slice(0, left_linenum)
        //    .concat(
        //        data[left_linenum].slice(0, left_pos+1)
        //        + data[right_linenum].slice(right_pos) )
        //    .concat( data.slice(right_linenum+1) )
        //    ;
        cursor[0] = left_linenum;
        cursor[1] = left_pos + 1;
        redraw();
        set_state('NORMAL');
    } else {
        set_state('NORMAL');
    }
}
var shift_left_keydown = function (i) {
    if (i == '<') {
        var left_spaces = get_left_spaces(cursor[0]).slice(4);
        data[cursor[0]] = left_spaces + data[cursor[0]].trimLeft();
        normal_keydown('^');
        draw(cursor[0], 'CURSOR', cursor[1]);
        set_state('NORMAL');
    } else {
        set_state('NORMAL');
    }
}

var shift_right_keydown = function (i) {
    if (i == '>') {
        var left_spaces = pi314.repeat(' ', 4);
        data[cursor[0]] = left_spaces + data[cursor[0]];
        normal_keydown('^');
        draw(cursor[0], 'CURSOR', cursor[1]);
        set_state('NORMAL');
    } else {
        set_state('NORMAL');
    }
}

    var _keydown = function (i) {
        switch (state) {
        case 'NORMAL':      normal_keydown(i);       break;
        case 'INSERT':      insert_keydown(i);       break;
        case 'FIND':        find_keydown(i, 'FORWARD', 'NORMAL'); break;
        case 'DNIF':        find_keydown(i, 'BACKWARD','NORMAL'); break;
        case 'DELETE':      delete_keydown(i);       break;
        case 'DELETE_IN':   delete_in_keydown(i);    break;
        case 'DELETE_FIND': delete_find_keydown(i, 'FORWARD');  break;
        case 'DELETE_DNIF': delete_find_keydown(i, 'BACKWARD'); break;
        case 'GO':          go_keydown(i);           break;
        case 'VISUAL_LINE': visual_line_keydown(i);  break;
        case 'VISUAL':      visual_keydown(i);       break;
        case 'VISUAL_BLOCK':visual_block_keydown(i); break;
        case 'INSERT_BLOCK':insert_block_keydown(i); break;
        case 'VISUAL_LINE_FIND':  find_keydown(i, 'FORWARD', 'VISUAL_LINE'); break;
        case 'VISUAL_LINE_DNIF':  find_keydown(i, 'BACKWARD','VISUAL_LINE'); break;
        case 'VISUAL_FIND':       find_keydown(i, 'FORWARD', 'VISUAL'); break;
        case 'VISUAL_DNIF':       find_keydown(i, 'BACKWARD','VISUAL'); break;
        case 'VISUAL_BLOCK_FIND': find_keydown(i, 'FORWARD', 'VISUAL_BLOCK'); break;
        case 'VISUAL_BLOCK_DNIF': find_keydown(i, 'BACKWARD','VISUAL_BLOCK'); break;
        case 'CHANGE':      change_keydown(i);       break;
        case 'CHANGE_FIND': change_find_keydown(i, 'FORWARD');  break;
        case 'CHANGE_DNIF': change_find_keydown(i, 'BACKWARD'); break;
        case 'DELETE_TO':   delete_find_keydown(i, 'TO'); break;
        case 'CHANGE_TO':   change_find_keydown(i, 'TO'); break;
        case 'CHANGE_IN':   change_in_keydown(i);    break;
        case 'REPLACE':     replace_keydown(i);      break;
        case 'COPY':        copy_keydown(i);         break;
        case 'COMMAND':     command_keydown(i);      break;
        case 'REPLACE_CHAR':replace_char_keydown(i, 'NORMAL'); break;
        case 'VISUAL_LINE_REPLACE_CHAR':  replace_char_keydown(i, 'VISUAL_LINE');  break;
        case 'VISUAL_REPLACE_CHAR':       replace_char_keydown(i, 'VISUAL');       break;
        case 'VISUAL_BLOCK_REPLACE_CHAR': replace_char_keydown(i, 'VISUAL_BLOCK'); break;
        case 'SHIFT_LEFT':  shift_left_keydown(i);  break;
        case 'SHIFT_RIGHT': shift_right_keydown(i); break;
        }

        show_message();
 
        redraw_bracket();
        check_display_range(total_lines);

        console.log(i, state);
        console.log(data);
    };

var belt_count = function () {
    var available_height = $(window).height();
    console.log(available_height);
    var empty_line = '<tr class="line"><td class="empty">~</td><td class="text"></td></tr>';
    $('#wvim_text').append(empty_line);
    //var line_height = $($('.line')[0]).height();
    var line_height = $('.line:first-child').height();
    console.log(line_height);
    return Math.floor(available_height / line_height) - 1;
}

var window_resize_event = function () {
    var new_total_lines = belt_count();
    align_bottom(new_total_lines);
    redraw();
}

var check_display_range = function () {
    var display_end = display_start + total_lines;
    if (cursor[0] < display_start) {
        var display_diff = display_start - cursor[0];
        display_start -= display_diff;
        redraw();
    } else if (cursor[0] >= display_end) {
        var display_diff = cursor[0] - display_end + 1;
        display_start += display_diff;
        redraw();
    }
}

var align_bottom = function (new_total_lines) {
    if (new_total_lines == total_lines) {
        return;
    } else if (new_total_lines < total_lines) {
        var display_end = display_start + total_lines;
        if (display_end > data.length) {
            total_lines = new_total_lines;
        } else if (cursor[0] == display_start) {
            total_lines = new_total_lines;
        } else {
            display_start += total_lines - new_total_lines;
            total_lines = new_total_lines;
        }
    } else if (new_total_lines > total_lines) {
        var display_end = display_start + total_lines;
        if (display_end < data.length) {
            total_lines = new_total_lines;
        } else if (display_start == 0) {
            total_lines = new_total_lines;
        } else {
            display_start -= new_total_lines - total_lines;
            if (display_start < 0) {
                display_start = 0;
            }
            total_lines = new_total_lines;
        }
    }
    check_display_range();
}
    total_lines = belt_count();
    redraw();

    $(window).resize(window_resize_event);

    return {
        keydown: function (i) {
            _keydown(i);
        },
        bind: function (command, callback) {
            bind_command_list[command] = callback;
            return wvim;
        },
        set: function (args) {
            set_wvim_global_var(args);
        }
    };
})();

});
