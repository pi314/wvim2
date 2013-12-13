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
