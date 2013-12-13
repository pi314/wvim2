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
