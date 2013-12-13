var belt_count = function () {
    var available_height = $(window).height();
    console.log(available_height);
    var empty_line = '<tr class="line"><td class="empty">~</td><td class="text"></td></tr>';
    $('#wvim_text').append(empty_line);
    //var line_height = $($('.line')[0]).height();
    var line_height = $('.line:first-child').height();
    console.log(line_height);
    return Math.floor(available_height / line_height) - 1;
}

var window_resize_event = function () {
    var new_total_lines = belt_count();
    align_bottom(new_total_lines);
    redraw();
}

var check_display_range = function () {
    var display_end = display_start + total_lines;
    if (cursor[0] < display_start) {
        var display_diff = display_start - cursor[0];
        display_start -= display_diff;
        redraw();
    } else if (cursor[0] >= display_end) {
        var display_diff = cursor[0] - display_end + 1;
        display_start += display_diff;
        redraw();
    }
}

var align_bottom = function (new_total_lines) {
    if (new_total_lines == total_lines) {
        return;
    } else if (new_total_lines < total_lines) {
        var display_end = display_start + total_lines;
        if (display_end > data.length) {
            total_lines = new_total_lines;
        } else if (cursor[0] == display_start) {
            total_lines = new_total_lines;
        } else {
            display_start += total_lines - new_total_lines;
            total_lines = new_total_lines;
        }
    } else if (new_total_lines > total_lines) {
        var display_end = display_start + total_lines;
        if (display_end < data.length) {
            total_lines = new_total_lines;
        } else if (display_start == 0) {
            total_lines = new_total_lines;
        } else {
            display_start -= new_total_lines - total_lines;
            if (display_start < 0) {
                display_start = 0;
            }
            total_lines = new_total_lines;
        }
    }
    check_display_range();
}
