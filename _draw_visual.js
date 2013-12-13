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
