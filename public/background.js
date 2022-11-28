chrome.alarms.create("5min", {
  delayInMinutes: 0,
  periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener(function () {
  chrome.notifications.create(
      "1", {
      iconUrl: chrome.runtime.getURL("icons/128.png"),
      title: "This should be a notification",
      type: "basic",
      message: "Notification body",
      isClickable: true,
      priority: 2,
  },
      function () { }
  );

});