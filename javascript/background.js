// chrome.extension.getBackgroundPage().console.log('foo');.
alert("Halo");

var popups = chrome.extension.getViews({
  type: "popup"
});
alert(popups.length + "**")
if (popups.length != 0) {
  var popup = popups[0];
  alert(popup + "**")
  popup.f();
}

var mainLoop = function() {
  $.ajax({
    url: "http://www.baidu.com",
    success: function(data) {
      //called when successful
      var notification = webkitNotifications.createNotification(
        '48.png', // icon url - can be relative
        'Hello!', // notification title
        data + "" // notification body text
      );
      notification.show();
    },
    error: function(e) {
      //called when there is an error
      alert(e.message);
    }
  });

  setTimeout(mainLoop, 15000);

};

mainLoop();