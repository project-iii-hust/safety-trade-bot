let window = self

chrome.alarms.create("5min", {
  delayInMinutes: 0,
  periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener(function () {
  chrome.storage.local.get(["sbt_pairs"])
  .then((result) => {
    let sbt_pairs = JSON.parse(result.sbt_pairs)
    let message = ""
    for (let pair of sbt_pairs){
      message = message + pair[0] + " " + pair[1] + " : " + pair[2] + ".\n"
    }
    chrome.notifications.create(
      "1", {
      iconUrl: chrome.runtime.getURL("icons/128.png"),
      title: "This should be a notification",
      type: "basic",
      message: message,
      isClickable: true,
      priority: 2,
    },
        function () { }
    );
  });
});