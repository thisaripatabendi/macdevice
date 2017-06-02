/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var wsConnection1;
var wsConnection2;
var wsConnection3;
var wsConnection4;
var wsConnection5;
var wsConnection6;
var graphForSensorType1;
var graphForSensorType2;
var graphForSensorType3;
var graphForSensorType4;
var graphForSensorType5;
var graphForSensorType6;
var chartDataSensorType1 = [];
var chartDataSensorType2 = [];
var chartDataSensorType3 = [];
var chartDataSensorType4 = [];
var chartDataSensorType5 = [];
var chartDataSensorType6 = [];
var palette = new Rickshaw.Color.Palette({scheme: "classic9"});
function drawGraph(wsConnection, placeHolder, yAxis, chat, chartData, graph) {
    var tNow = new Date().getTime() / 1000;
    for (var i = 0; i < 30; i++) {
        chartData.push({
            x: tNow - (30 - i) * 15,
            y: parseFloat(0)
        });
    }

    graph = new Rickshaw.Graph({
        element: document.getElementById(chat),
        width: $(placeHolder).width() - 50,
        height: 300,
        renderer: "line",
        padding: {top: 0.2, left: 0.0, right: 0.0, bottom: 0.2},
        xScale: d3.time.scale(),
        series: [{
            'color': palette.color(),
            'data': chartData,
            'name': "SensorValue"
        }]
    });

    graph.render();

    var xAxis = new Rickshaw.Graph.Axis.Time({
        graph: graph
    });

    xAxis.render();

    new Rickshaw.Graph.Axis.Y({
        graph: graph,
        orientation: 'left',
        height: 300,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        element: document.getElementById(yAxis)
    });

    new Rickshaw.Graph.HoverDetail({
        graph: graph,
        formatter: function (series, x, y) {
            var date = '<span class="date">' + moment.unix(x * 1000).format('Do MMM YYYY h:mm:ss a') + '</span>';
            var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
            return swatch + series.name + ": " + parseInt(y) + '<br>' + date;
        }
    });
    var websocketurlStream = $(placeHolder).attr("data-websocketurlStream");
    var deviceId = $(placeHolder).attr("data-deviceID");
    connect(wsConnection, websocketurlStream, chartData, graph, deviceId);
}

$(window).load(function () {
    drawGraph(wsConnection1, "#div-chart-sensorType1", "yAxisSensorType1", "chartSensorType1", chartDataSensorType1
        , graphForSensorType1);
    drawGraph(wsConnection2, "#div-chart-sensorType2", "yAxisSensorType2", "chartSensorType2", chartDataSensorType2
        , graphForSensorType2);
    drawGraph(wsConnection3, "#div-chart-sensorType3", "yAxisSensorType3", "chartSensorType3", chartDataSensorType3
        , graphForSensorType3);
    drawGraph(wsConnection4, "#div-chart-sensorType4", "yAxisSensorType4", "chartSensorType4", chartDataSensorType4
        , graphForSensorType4);
    drawGraph(wsConnection5, "#div-chart-sensorType5", "yAxisSensorType5", "chartSensorType5", chartDataSensorType5
        , graphForSensorType5);
    drawGraph(wsConnection6, "#div-chart-sensorType6", "yAxisSensorType6", "chartSensorType6", chartDataSensorType6
        , graphForSensorType6);
});

$(window).unload(function () {
    disconnect(wsConnection1);
    disconnect(wsConnection2);
    disconnect(wsConnection3);
    disconnect(wsConnection4);
    disconnect(wsConnection5);
    disconnect(wsConnection6);
});

//websocket connection
function connect(wsConnection, target, chartData, graph, deviceId) {
    if ('WebSocket' in window) {
        wsConnection = new WebSocket(target);
    } else if ('MozWebSocket' in window) {
        wsConnection = new MozWebSocket(target);
    } else {
        console.log('WebSocket is not supported by this browser.');
    }
    if (wsConnection) {
        wsConnection.onmessage = function (event) {
            var dataPoint = JSON.parse(event.data);
            var time = dataPoint.event.metaData.time;
            var value;
            var currentDevId = dataPoint.event.metaData.deviceId;
            // check with the deviceID and payload
            if(currentDevId == deviceId){
                if(dataPoint.event.payloadData.macdevicebatterylevel !== undefined){
                    value = dataPoint.event.payloadData.macdevicebatterylevel;
                }else if (dataPoint.event.payloadData.macdevicebatterystatus !== undefined){
                    value = dataPoint.event.payloadData.macdevicebatterystatus;
                }else if (dataPoint.event.payloadData.macdevicecpuusage !== undefined){
                    value = dataPoint.event.payloadData.macdevicecpuusage;
                }else if (dataPoint.event.payloadData.macdevicememoryspace !== undefined){
                    value = dataPoint.event.payloadData.macdevicememoryspace;
                }else if (dataPoint.event.payloadData.macdevicediskspace !== undefined){
                    value = dataPoint.event.payloadData.macdevicediskspace;
                }else {
                    value = dataPoint.event.payloadData.macdeviceloadaverage;
                }

                chartData.push({
                    x: parseInt(time) / 1000,
                    y: parseFloat(value)
                });
                chartData.shift();
                graph.update();
            }
        };
    }
}

function disconnect(wsConnection) {
    if (wsConnection != null) {
        wsConnection.close();
        wsConnection = null;
    }
}
