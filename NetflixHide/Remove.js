var addMainListener = function () {
	console.log("===========ADDING MAIN LISTENER=============");
	let main = document.querySelector("div[class='mainView']");

	mainObserver.observe(main, mainConfig);

	let subList = main.querySelectorAll("div[class='slider']");
	for (let i = 0; i < subList.length; i++) {
		observer.observe(subList[i], config);
	}

};

var movies = null;
document.addEventListener('load', function (e) {
	console.log('load', e.target, e.target.tagName);
	if (e.target.tagName == "IFRAME") {
		console.log('returned to Netflix main page after video playback: edit=', edit);
		if (edit) {
			addMainListener();
		}
	}
}, true);

var clickedElement = null;
document.addEventListener('mousedown', function (e) {
	if (e.button == 2) {
		clickedElement = e.target;
	}
}, false);

var config = {
	attributes: true,
	childList: true,
	subtree: true
};

var hideOrTint = function (sliderDiv) {
	let name = getMovieName(sliderDiv);
	if (name == null) {
		sliderDiv.style.display = "none";
	} else if (movies[name]) {
		//hide
		if (removeOrTint == 'tint') {
			sliderDiv.style.opacity = "0.2";
		} else {
			sliderDiv.style.display = "none";
		}
	} else if (name != null && edit && !sliderDiv.querySelector("div[class='select-style']")) {
		//custom div
		var divNode = document.createElement("div");
		divNode.className = "select-style";

		var imgNode = document.createElement("button");
		imgNode.innerHTML = "X";
		imgNode.addEventListener("click", imgClose);

		divNode.appendChild(imgNode);

		sliderDiv.insertBefore(divNode, sliderDiv.firstChild);
	}
}

var callback = function (mutationsList) {
	for (let mutation of mutationsList) {
		let div = mutation.target;
		let sliderDiv = getSliderDiv(div);
		if (sliderDiv) {
			hideOrTint(sliderDiv);
		}
	}
};

var editMode = function () {
	if (edit) {
		edit = false;
		observer.disconnect();
		let selectList = document.querySelectorAll("div[class='select-style']");
		for (let i = 0; i < selectList.length; i++) {
			let tmp = selectList[i];
			if (removeOrTint == 'tint') {
				tmp.style.opacity = "0.2";
			} else {
				tmp.style.display = "none";
			}
		}
		alert("Disabled Editing");
	} else {
		edit = true;
		addMainListener();
		alert("Enabled Editing");
	}
};

var observer = new MutationObserver(callback);
var edit = false;
chrome.runtime.onMessage.addListener(function (requestMsg, sender, sendResponse) {

	switch (requestMsg) {
	case "Remove":
		saveAndRemoveSlider(clickedElement);
		break;
	case "Reset":
		alert("Reset");
		resetChromeData();
		break;
	case "edit":
		editMode();
		break;
	case "Refresh":
		window.location.reload(true);
		break;
	default:
		break;
	}
});

var imgClose = function () {
	console.log("close", this);
	saveAndRemoveSlider(this);
}

var resetChromeData = function () {
	chrome.storage.sync.clear(function () {
		window.location.reload(true);
	});
}

var saveAndRemoveSlider = function (clickedElement) {
	let sliderDiv = getSliderDiv(clickedElement);
	if (sliderDiv == null) {
		alert("Please try again.");
		return;
	}

	let movieName = getMovieName(sliderDiv);
	if (movieName == null) {
		return;
	}
	try {
		let tmp = {};
		tmp[movieName] = "Remove";
		movies[movieName] = "Remove";

		chrome.storage.sync.set(tmp, function () {
			if (removeOrTint == 'tint') {
				sliderDiv.style.opacity = "0.2";
			} else {
				sliderDiv.style.display = "none";
			}
		});

	} catch (e) {}
}

var getSliderDiv = function (target) {
	return getNearestParent(target, "div[class^='slider-item slider-item']");
}

var getMovieName = function (target) {
	let movieElement = target.querySelector("a[aria-label]");
	if (movieElement) {
		return movieElement.getAttribute("aria-label");
	}
	return null;
}

var getNearestParent = function (elem, selector) {
	for (; elem && elem !== document; elem = elem.parentNode) {
		if (selector) {
			if (elem.matches(selector)) {
				return elem;
			}
		}
	}
	return null;
};

var mainCallback = function (mutationsList) {
	for (var mutation of mutationsList) {
		let div = mutation.target;
		let subList = div.querySelectorAll("div[class^='slider']");
		for (let i = 0; i < subList.length; i++) {
			if (movies != null) {
				let divList = subList[i].querySelectorAll("div[class^='slider-item slider-item']");
				for (let sliderDiv of divList) {
					hideOrTint(sliderDiv);
				}
			}
			observer.observe(subList[i], config);
		}
	}
};

var mainObserver = new MutationObserver(mainCallback);
var mainConfig = {
	childList: true,
	subtree: true
};

var profileCallback = function (mutationsList) {
	profileObserver.disconnect();
	for (var mutation of mutationsList) {
		let div = mutation.target;

		let main = document.querySelector("div[class='mainView']");
		if (main != null) {
			let subList = main.querySelectorAll("div[class='slider']");
			for (let i = 0; i < subList.length; i++) {
				if (movies != null) {
					let divList = subList[i].querySelectorAll("div[class^='slider-item slider-item']");
					for (let sliderDiv of divList) {
						hideOrTint(sliderDiv);
					}
				}
				observer.observe(subList[i], config);
			}
			mainObserver.observe(main, mainConfig);
		}
	}
};

var profileObserver = new MutationObserver(profileCallback);

var removeOrTint = 'tint';

if (document.readyState === 'complete') {

	chrome.storage.sync.get(["ManageInterface","editEnabled"], function (data) {
	
		if (data['ManageInterface'] == 'remove') {
			removeOrTint = 'remove';
		} else if (data['tint'] == 'remove') {
			removeOrTint = 'tint';
		}  
		if (data['editEnabled']) {
			edit = true;
		} else if (!data['editEnabled']) {
			edit = false;
		}

		chrome.storage.sync.get(null, function (e) {
			movies = e;

			let profile = document.querySelector("div[class^='profile']");
			if (profile != null) {
				profileObserver.observe(profile, {
					childList: true,
				});
			}
			let main = document.querySelector("div[class='mainView']");
			if (main != null) {
				let subList = main.querySelectorAll("div[class='slider']");
				for (let i = 0; i < subList.length; i++) {
					if (movies != null) {
						let divList = subList[i].querySelectorAll("div[class^='slider-item slider-item']");
						for (let sliderDiv of divList) {
							hideOrTint(sliderDiv);
						}
					}
					observer.observe(subList[i], config);
				}
				mainObserver.observe(main, mainConfig);
			}

		});
	});
}
