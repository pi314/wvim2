var draw_normal = function (linenum) {
    //$($('.line')[linenum]).text(line_content);
    if (data[linenum] == '') {
        $('#text_'+linenum+'').text(' ');
    } else {
        $('#text_'+linenum+'').text(data[linenum]);
    }
}
