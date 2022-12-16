/*global chrome*/
export default function notification(title, message) {
  chrome.notifications.create(
    "1", {
    iconUrl: chrome.runtime.getURL("icons/128.png"),
    title: title,
    type: "basic",
    message: message,
    isClickable: true,
    priority: 2,
},
    function () { }
);
}