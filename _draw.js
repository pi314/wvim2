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
