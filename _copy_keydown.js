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
