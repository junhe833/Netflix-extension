var editEnabled = false;

window.addEventListener("load", function load() {

	chrome.storage.sync.get("ManageInterface", function (data) {
		console.log(data);
		if (data['ManageInterface'] == 'remove') {
			document.getElementById('remove').checked = true;
		} else {
			document.getElementById('tint').checked = true;
		}
	});

	document.getElementById("remove").addEventListener("click", function click() {
		chrome.storage.sync.set({
			'ManageInterface': 'remove'
		}, function () {
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function (tabs) {
				chrome.tabs.sendMessage(tabs[0].id, "Refresh");
			});
		});
	});

	document.getElementById("tint").addEventListener("click", function click() {
		chrome.storage.sync.set({
			'ManageInterface': 'tint'
		}, function () {
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function (tabs) {
				chrome.tabs.sendMessage(tabs[0].id, "Refresh");
			});
		});
	});

	document.getElementById("edit").addEventListener("click", function click() {
		if (editEnabled) {
			this.className = "editDisabled";
			editEnabled = false;
			document.getElementById("editTooltip").innerHTML = "Click to enable quick edit mode";

		} else {
			this.className = "editEnabled";
			editEnabled = true;
			document.getElementById("editTooltip").innerHTML = "Click to disable quick edit mode";
		}
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, "edit");
		});
	});

	document.getElementById("reset").addEventListener("click", function click() {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, "Reset");
		});
	});
}, false);
