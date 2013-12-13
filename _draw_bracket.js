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
