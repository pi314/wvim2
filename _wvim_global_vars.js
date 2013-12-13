var set_wvim_global_var = function (args) {
    if (args.length == 1) {
        switch (args[0]) {
        case 'nu':
            wvim_global_vars['nu'] = true;
            redraw();
            break;
        case 'nu!':
        case 'nonu':
            wvim_global_vars['nu'] = false;
            redraw();
            break;
        }
    }
    console.log(wvim_global_vars);
}

var get_wvim_global_var = function (key) {
    if (key in wvim_global_vars) return wvim_global_vars[key];
    return false;
}
