$(function () {
    KeyManager.keydown([ALPHABET, SYMBOL, CONTROL, NUMBER,
        '<C-l>', '<C-v>', '<C-r>', '<C-c>', '<C-e>', '<C-y>'],
        function (i) {
            wvim.keydown(i);
        });

    wvim.bind(':w', function (args, data) {
        console.log("get data:", data);
        var file_content = data.join('\n');
        window.location =
            'data:application/octet-stream;charset=utf-8;base64,' + btoa(file_content);
    }).bind(':set', function (args) {
        wvim.set(args);
    }).bind(':3', function (args) {
        alert('^ω^');
    });
});
