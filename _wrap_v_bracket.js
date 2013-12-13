var wrap_v_bracket = function (i) {
    var ret = '';
    for (var a = 0; a < i.length; a++) {
        if (i[a] == '<') {
            ret += '<span><</span>';
        } else {
            ret += i[a];
        }
    }
    return ret;
}
