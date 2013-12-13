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
