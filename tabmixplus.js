(function () {

    commands.add(["tabdu[ulicate]"], "duplicate current tab", function (args) {
            gBrowser.duplicateTab(gBrowser.mCurrentTab);
        });

    commands.add(["tabren[ame]"], "rename current tab", function (args) {
            gBrowser.renameTab(gBrowser.mCurrentTab);
        });

    commands.add(["tabfr[eeze]"], "freeze current tab", function (args) {
            let protect = gBrowser.mCurrentTab.hasAttribute("protected");
            let lock = gBrowser.mCurrentTab.hasAttribute("locked");
            if (protect && lock) {
                gBrowser.mCurrentTab.removeAttribute("protected");
                gBrowser.mCurrentTab.removeAttribute("locked");
            } else {
                gBrowser.freezeTab(gBrowser.mCurrentTab);
            }
        });

    commands.add(["tabpr[otect]"], "protect current tab", function (args) {
            let protect = gBrowser.mCurrentTab.hasAttribute("protected");
            if (protect) {
                gBrowser.mCurrentTab.removeAttribute("protected");
            } else {
                gBrowser.mCurrentTab.setAttribute("protected", true);
            }
        });

    commands.add(["tablock"], "lock current tab", function (args) {
            let lock = gBrowser.mCurrentTab.hasAttribute("locked");
            if (lock) {
                gBrowser.mCurrentTab.removeAttribute("locked");
            } else {
                gBrowser.mCurrentTab.setAttribute("locked", true);
            }
        });

    // override vimperator's tab closing behavior
    mappings.addUserMap([modes.NORMAL], ["d"],
        "Delete the current tab and select a tab in the default behavior.",
        function (count) {
            tabs.remove(tabs.getTab(), count, 0, 0);
        }, { count: true });

})();
