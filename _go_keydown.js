var go_keydown = function (i) {
    if (i == 'g') {
        draw(cursor[0], 'NORMAL');
        cursor[0] = 0;
        normal_keydown('^');
        draw(cursor[0], 'CURSOR', cursor[1]);
        set_state('NORMAL');
    } else {
        set_state('NORMAL');
    }
    console.log("go keydown:", i, cursor);
}
