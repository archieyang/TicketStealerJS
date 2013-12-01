$(document).ready(function(){
    console.log("halo from popup.js");
    $('#options').click(function(event){
        event.preventDefault();
        console.log("popup!");
        window.open("options.html");
    });

    $('#send').click(function(event){
        console.log("sendclicked");
        event.preventDefault();
        chrome.runtime.sendMessage(
            {test:"halo sent from popup"},
            function(response){
                console.log(response);
            }
        );
    });
});