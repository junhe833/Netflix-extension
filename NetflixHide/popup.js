chrome.contextMenus.create({
    "title": "Remove this movie",
    "id": "Remove",
    "contexts": ["all"],
	"documentUrlPatterns": ["*://*.netflix.com/*"]
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, info.menuItemId);
    });
});




 