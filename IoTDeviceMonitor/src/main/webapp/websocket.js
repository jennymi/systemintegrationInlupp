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

function getList(){
    console.log("getting list");
    var json = JSON.stringify({
        "device":"list"
    });
    ws.send(json);
}
window.onbeforeunload = function() {
    ws.onclose = function () {}; // disable onclose handler first
    ws.close();
};
window.onload = function(){
    ws = new WebSocket("ws://localhost:8080/IoTDeviceMonitor/device");
    ws.onmessage = function(event) {
        console.log("message arrived");
        var log = document.getElementById("log");
        var message = JSON.parse(event.data);
        if(message.device == "list"){
            console.log("loading chart");
            loadChart(message.table);
        }
        log.innerHTML = message.temperature;
    };
};

function loadChart(data){
    am4core.useTheme(am4themes_animated);
    var chart = am4core.create("chartdiv", am4charts.XYChart);
    chart.datadateFormat
    chart.data = data;
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 50;
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    
    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "temps";
    series.dataFields.dateX = "date";
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltipText = "{valueY}";
    series.tooltip.pointerOrientation = "vertical";
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding(12,12,12,12)
    
    chart.scrollbarX = new am4charts.XYChartScrollbar();
    chart.scrollbarX.series.push(series);

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;
    chart.cursor.snapToSeries = series;
    
}