/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var ws;
var chart;
var list = [];
var series;
var interval, visits = 1;
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

function printList(list) {
    var text = "<table ><thead><tr><th>Temperatur </th><th>Luftfuktighet </th><th>Tidsstämpel </th></tr></thead>";
    for (var i = 0; i < 10; i++) {
        text += "<tbody><tr><td>" + list[i].temperature + " </td><td>" + list[i].humidity + "</td><td>" + list[i].created + "</td></tr></tbody>";
    }
    text += "</table>";
    document.getElementById("printList").innerHTML = text;
}
window.onbeforeunload = function () {
    ws.onclose = function () {}; // disable onclose handler first
    ws.close();
};
window.onload = function () {
    ws = new WebSocket("ws://localhost:8080/IoTDeviceMonitor/device");
    loadChart();
    ws.onmessage = function (event) {
        console.log("message arrived");
        var log = document.getElementById("log");
        var message = JSON.parse(event.data);
        if (message.device === "list") {
            console.log("loading chart");
            printList(message.table);
        } else {
            //var lastdataItem = series.dataItems.getIndex(series.dataItems.length - 1);
            chart.addData(
                    {date: Date.now(), value: message.temperature}
                    );
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
    tempdec.innerHTML = "." + ((humids.dec > 1) ? humids.dec : 0);
}
function loadTempIcon(temps) {
    var temp = document.getElementById("tempicon");
    temp.innerHTML = ((temps.first.length > 0) ? temps.first : 0) + "<span id='tempdecimal'>.9</span><strong>&deg;</strong>";
    var tempdec = document.getElementById("tempdecimal");
    tempdec.innerHTML = "." + ((temps.dec > 1) ? temps.dec : 0);
}

function loadChart() {
    am4core.useTheme(am4themes_animated);
    chart = am4core.create("chartdiv", am4charts.XYChart);
    chart.hiddenState.properties.opacity = 0;

    chart.padding(0, 0, 0, 0);

    chart.zoomOutButton.disabled = true;


    var data = [];

    data.push({date: Date.now(), value: 20});


    chart.data = data;

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


    series.fillOpacity = 1;
    var gradient = new am4core.LinearGradient();
    gradient.addColor(chart.colors.getIndex(0), 0.2);
    gradient.addColor(chart.colors.getIndex(0), 0);
    series.fill = gradient;

// this makes date axis labels to fade out
    dateAxis.renderer.labels.template.adapter.add("fillOpacity", function (fillOpacity, target) {
        var dataItem = target.dataItem;
        return dataItem.position;
    });

// need to set this, otherwise fillOpacity is not changed and not set


// this makes date axis labels which are at equal minutes to be rotated
    dateAxis.renderer.labels.template.adapter.add("rotation", function (rotation, target) {
        var dataItem = target.dataItem;
        if (dataItem.date && dataItem.date.getTime() === am4core.time.round(new Date(dataItem.date.getTime()), "minute").getTime()) {
            target.verticalCenter = "middle";
            target.horizontalCenter = "left";
            return -90;
        } else {
            target.verticalCenter = "bottom";
            target.horizontalCenter = "middle";
            return 0;
        }
    });

// bullet at the front of the line
    var bullet = series.createChild(am4charts.CircleBullet);
    bullet.circle.radius = 5;
    bullet.fillOpacity = 1;
    bullet.fill = chart.colors.getIndex(0);
    bullet.isMeasured = false;

    series.events.on("validated", function () {
        bullet.moveTo(series.dataItems.last.point);
        bullet.validatePosition();
    });
    dateAxis.events.on("validated", function () {
        am4core.iter.each(dateAxis.renderer.labels.iterator(), function (label) {
            label.fillOpacity = label.fillOpacity;
        });
    });

}