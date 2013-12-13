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
