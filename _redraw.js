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
