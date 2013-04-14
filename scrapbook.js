
(function () {
    commands.addUserCommand(["sbcap"], "ScrapBook capture page",
        function (args) {
            ScrapBookBrowserOverlay.execCapture(0, null, true, 'urn:scrapbook');
        }, {}, true);
})();
