var redraw_visual = function (type) {
    if (!type) type = get_state();
    switch (type) {
    case 'VISUAL_LINE':
        var a = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
        var b = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
        redraw_bracket();
        for (var i = a; i <= b; i++) {
            draw(i, 'VISUAL', [0, 'END']);
        }
        draw(cursor[0], 'VISUAL', [0, 'END', cursor[1]]);
        break;
    case 'VISUAL':
        var a = visual_cursor[0] <= cursor[0] ? visual_cursor[0] : cursor[0];
        var b = visual_cursor[0] <= cursor[0] ? cursor[0] : visual_cursor[0];
        redraw_bracket();
        for (var i = a+1; i < b; i++) {
            draw(i, 'VISUAL', [0, 'END']);
        }
        var cursor_line_range = [];
        var visual_line_range = [];
        if (cursor[0] < visual_cursor[0]) {
            cursor_line_range = [cursor[1], 'END', cursor[1]];
            visual_line_range = [0, visual_cursor[1]];
        } else if (visual_cursor[0] < cursor[0]) {
            visual_line_range = [visual_cursor[1], 'END'];
            cursor_line_range = [0, cursor[1], cursor[1]];
        } else {
            cursor_line_range = [cursor[1], visual_cursor[1], cursor[1]];
            visual_line_range = null;
        }
        draw(cursor[0], 'VISUAL', cursor_line_range);
        draw(visual_cursor[0], 'VISUAL', visual_line_range);
        break;
    case 'VISUAL_BLOCK':
        var eq_cursor = [cursor[0], cursor[1]];
        if (eq_cursor[1] >= data[cursor[0]].length) {
            eq_cursor[1] = data[cursor[0]].length;
        }

        var up    = visual_cursor[0] <= eq_cursor[0] ? visual_cursor[0] : eq_cursor[0];
        var down  = visual_cursor[0] <= eq_cursor[0] ? eq_cursor[0] : visual_cursor[0];
        var left  = visual_cursor[1] <= eq_cursor[1] ? visual_cursor[1] : eq_cursor[1];
        var right = visual_cursor[1] <= eq_cursor[1] ? eq_cursor[1] : visual_cursor[1];
        redraw_bracket();
        for (var i = up; i <= down; i++) {
            draw(i, 'VISUAL', [left, right]);
        }
        draw(cursor[0], 'VISUAL', [left, right, cursor[1]]);
        break;
    }
}
