/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var ws;

function connect() {
   //var username = document.getElementById("username").value;
   
   //ws = new WebSocket("ws://" + location.hostname + ":" + location.port + "WebSocketDemoNoDisconnect-master/chat/"+ username);
   //alert("connecting");
    
}
function disconnect(){
    ws.close();
}

function send() {
    //alert("send msg");
    var content = document.getElementById("msg").value;
    var json = JSON.stringify({
        "content":content
    });
    alert(json);
    ws.send(json);
}
window.onbeforeunload = function() {
    ws.onclose = function () {}; // disable onclose handler first
    ws.close();
};
window.onload = function(){
    ws = new WebSocket("ws://localhost:8080/IoTDeviceMonitor/device");
    ws.onmessage = function(event) {
        var log = document.getElementById("log");
        var message = JSON.parse(event.data);
        log.innerHTML = message.temperature;
    };
};

