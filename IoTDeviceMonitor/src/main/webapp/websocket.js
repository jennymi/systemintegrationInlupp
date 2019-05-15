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
function disconnect() {
    ws.close();
}

function send() {
    //alert("send msg");
    var content = document.getElementById("msg").value;
    var json = JSON.stringify({
        "content": content
    });
    alert(json);
    ws.send(json);
}

function getList() {
    console.log("getting list");
    var json = JSON.stringify({
        "device": "list"
    });
    ws.send(json);
}

function printList(list){
    var text = "<table ><thead><tr><th>Temperatur </th><th>Luftfuktighet </th><th>Tidsstämpel </th></tr></thead>";
    for(var i=0; i<10; i++){
        text += "<tbody><tr><td>"+list[i].temperature+" </td><td>"+list[i].humidity+"</td><td>"+list[i].created+"</td></tr></tbody>";
    }
    text +=  "</table>";
    document.getElementById("printList").innerHTML = text;
}
window.onbeforeunload = function () {
    ws.onclose = function () {}; // disable onclose handler first
    ws.close();
};
window.onload = function () {
    ws = new WebSocket("ws://localhost:8080/IoTDeviceMonitor/device");
    ws.onmessage = function (event) {
        console.log("message arrived");
        var log = document.getElementById("log");
        var message = JSON.parse(event.data);
        if (message.device == "list") {
            console.log("loading chart");
            printList(message.table);
            loadChart(message.table);
        } else {

            var splittedtemp = message.temperature.split(".");
            var temp = {first: splittedtemp[0], dec: splittedtemp[1]};
            loadTempIcon(temp);
            var splittedhumid = message.humidity.split(".");

            var humid = {first: splittedhumid[0], dec: splittedhumid[1]};
            loadHumidIcon(humid);


        }
        // log.innerHTML = message.temperature;

    };
};
function loadHumidIcon(humids) {

    var temp = document.getElementById("humidicon");
    temp.innerHTML = ((humids.first !== null) ? humids.first : 0) + "<span id='humiddecimal'>.0</span><strong>&deg;</strong>";
    var tempdec = document.getElementById("humiddecimal");
    tempdec.innerHTML = "." + ((humids.dec < 1) ? humids.dec : 0);
}
function loadTempIcon(temps) {
    var temp = document.getElementById("tempicon");
    temp.innerHTML = ((temps.first.length > 0) ? temps.first : 0) + "<span id='tempdecimal'>.9</span><strong>&deg;</strong>";
    var tempdec = document.getElementById("tempdecimal");
    tempdec.innerHTML = "." + ((temps.dec > 1) ? temps.dec : 0);
}

function loadChart(data) {
    var list = [];
    for (var x in data) {
        var t = data[x].created.split(/[- :]/);
        var d = new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
        list.push({
            date: d,
            value: data[x].temperature
        });
    }
    am4core.useTheme(am4themes_animated);
    var chart = am4core.create("chartdiv", am4charts.XYChart);
    chart.colors.step = 2;
    chart.hiddenState.properties.opacity = 0;

    chart.padding(0, 0, 0, 0);

    chart.zoomOutButton.disabled = true;



    chart.data = list;
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.location = 0;
    dateAxis.renderer.minGridDistance = 30;
    dateAxis.dateFormats.setKey("second", "ss");
    dateAxis.periodChangeDateFormats.setKey("second", "[bold]h:mm a");
    dateAxis.periodChangeDateFormats.setKey("minute", "[bold]h:mm a");
    dateAxis.periodChangeDateFormats.setKey("hour", "[bold]h:mm a");
    dateAxis.renderer.inside = true;
    dateAxis.renderer.axisFills.template.disabled = true;
    dateAxis.renderer.ticks.template.disabled = true;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.interpolationDuration = 500;
    valueAxis.rangeChangeDuration = 500;
    valueAxis.renderer.inside = true;
    valueAxis.renderer.minLabelPosition = 0.05;
    valueAxis.renderer.maxLabelPosition = 0.95;
    valueAxis.renderer.axisFills.template.disabled = true;
    valueAxis.renderer.ticks.template.disabled = true;

    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = "date";
    series.dataFields.valueY = "value";
    series.interpolationDuration = 500;
    series.defaultState.transitionDuration = 0;
    series.tensionX = 0.8;

    chart.events.on("datavalidated", function () {
        dateAxis.zoom({start: 1 / 15, end: 1.2}, false, true);
    });
    dateAxis.interpolationDuration = 500;
    dateAxis.rangeChangeDuration = 500;

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            if (interval) {
                clearInterval(interval);
            }
        } else {
            startInterval();
        }
    }, false);

    var interval;
    function startInterval() {
        interval = setInterval(function () {
            visits =
                    visits + Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 5);
            var lastdataItem = series.dataItems.getIndex(series.dataItems.length - 1);
            chart.addData(
                    {date: new Date(lastdataItem.dateX.getTime() + 1000), value: visits},
                    1
                    );
        }, 1000);
    }

}
