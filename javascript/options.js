/**
 * Created by archie on 13-11-24.
 */
var log = function (message) {
    console.log(message);
};


log("halo from options.js");
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

$(document).ready(function () {

    var $firstDayPicker = $("#firstDay"),
        $lastDayPicker = $("#lastDay"),
        $departureTimeFrom = $('#startTime'),
        $departureTimeTo = $('#endTime'),
        $startButton = $('#startButton'),
        $stopButton = $('#stopButton'),
        $table = $('#queryResTable'),
        cityNames = ticketto.getCityNames(),
        port = chrome.runtime.connect({name: 'optionPort'}),


        datePickerParam = function () {

            var param;
            return function () {
                param = {
                    inline: true,
//                    defaultDate: (new Date()).getTime(),
                    dateFormat: 'yy-mm-dd',
                    clearText: "清除",
                    closeText: "关闭",
                    yearSuffix: '年',
                    showMonthAfterYear: true,
                    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
                    dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                    minDate: 0,
                    onSelect: function () {

                        if ($firstDayPicker.datepicker("getDate") > $lastDayPicker.datepicker("getDate")) {
                            if ($("#dateAlert").length === 0) {

                                $lastDayPicker.after('<div id="dateAlert"><b>Wrong date!</b></div>');
                            } else {
                                $("#dateAlert").show();
                            }
                            $startButton.attr('disabled', 'true');

                        } else {

                            $("#dateAlert").hide();
                            $startButton.removeAttr('disabled');
                        }


                    }
                };

                return param;
            };
        }(),

        timePickerParam = function () {
            var param;

            return function () {
                param = {
                    hourText: '时',             // Define the locale value for "Hours"
                    minuteText: '分',         // Define the locale value for "Minute"
                    amPmText: ['上午', '下午'],       // Define the locale value for periods
                    defaultTime: '23:59',
                    onSelect: function () {

                        if ($departureTimeFrom.timepicker("getTimeAsDate") > $departureTimeTo.timepicker("getTimeAsDate")) {
                            if ($("#timeAlert").length === 0) {

                                $departureTimeTo.after('<div id="timeAlert"><b>Wrong time!</b></div>');

                            } else {
                                $("#timeAlert").show();
                            }

                            $startButton.attr('disabled', 'true');

                        } else {

                            $("#timeAlert").hide();
                            $startButton.removeAttr('disabled');
                        }


                    }

                };
                return param;

            };

        }();

    port.onMessage.addListener(function (msg) {
        log(msg);

        var visualizeInfoPerDay = function (day) {
                return '<tr>'
                    + '<td>' + day.date + '</td>'
                    + '<td>' + day.timestamp + '</td>'
                    + '<td>' + "checked at " + new Date() + '</td>'
                    + '</tr>';
            },
            visualizeTicketInfo = function (ticket) {
                return '<td>' + ticket.businessSt + '</td>'
                    + '<td>' + ticket.VIPSt + '</td>'
                    + '<td>' + ticket.G1St + '</td>'
                    + '<td>' + ticket.G2St + '</td>'
                    + '<td>' + ticket.VIPSoftBd + '</td>'
                    + '<td>' + ticket.softBd + '</td>'
                    + '<td>' + ticket.hardBd + '</td>'
                    + '<td>' + ticket.softSt + '</td>'
                    + '<td>' + ticket.hardSt + '</td>'
                    + '<td>' + ticket.standTkt + '</td>';
            },
            visualizeTrainInfo = function (item) {
                return '<tr>'
                    + '<td>' + item.trainNo + '</td>'
                    + '<td>' + item.from + '</td>'
                    + '<td>' + item.fromTime + '</td>'
                    + '<td>' + item.to + '</td>'
                    + '<td>' + item.toTime + '</td>'
                    + '<td>' + item.lastTime + '</td>'
                    + visualizeTicketInfo(item.ticket)

                    + '</tr>';
            };

        $table.empty();

        for (var iDay in msg) {
            $table.append(visualizeInfoPerDay(msg[iDay]));
            for (var iTrain in msg[iDay].trainInfoData) {
                $table.append(visualizeTrainInfo(msg[iDay].trainInfoData[iTrain]));
            }
        }

        $startButton.attr('disabled', 'true');
        $stopButton.removeAttr('disabled');
    });

//  Something interesting here.
//  When call datepicker('setDate', new Date()),onSelect is not called.
//  When call timepicker('setTime', 'HH:MM'), onSelect is called.
//  So $depatureTimeTo has to be initialized when $departureTimeFrom.timepicker('setTime', '00:00') is called

    $firstDayPicker.datepicker(
        datePickerParam()
    ).datepicker('setDate', new Date());

    $lastDayPicker.datepicker(
        datePickerParam()
    ).datepicker('setDate', new Date());

    $departureTimeFrom.timepicker(
        timePickerParam()
    );

    $departureTimeTo.timepicker(
        timePickerParam()
    );

    $departureTimeFrom.timepicker('setTime', '00:00');
    $departureTimeTo.timepicker('setTime', '23:59');

    $('.cityInfo').autocomplete({
        source: cityNames
    });


    $startButton.click(function (event) {
        var trainInfo = {},
            basicInfo = $("[name='basicInfo']"), trainClassCheckbox = $("[name='tclass']"),
            _timeAsDateToTimeString = function (date) {
                var h = date.getHours(), m = date.getMinutes();
                if (h < 10) {
                    h = '0' + h;
                }
                if (m < 10) {
                    m = '0' + m;
                }
                return h + ":" + m;
            };

        trainInfo.dates = {
            first: $firstDayPicker.datepicker('getDate').Format('yyyy-MM-dd'),
            last: $lastDayPicker.datepicker('getDate').Format('yyyy-MM-dd')
        };


        trainInfo.departureStartTime = _timeAsDateToTimeString($departureTimeFrom.timepicker('getTimeAsDate'));
        trainInfo.departureEndTime = _timeAsDateToTimeString($departureTimeTo.timepicker('getTimeAsDate'));


        event.preventDefault();


        trainInfo.fromCity = basicInfo[0].value;
        trainInfo.toCity = basicInfo[1].value;

        trainInfo.trainClass = "";

        trainClassCheckbox.each(function () {
            if (this.checked) {
                trainInfo.trainClass += $(this).val();
            }
        });

        log(trainInfo);


//        chrome.runtime.sendMessage({
//                trainInfo: trainInfo,
//                type: "QUERY_START",
//                queryInterval:3*1000
//            },
//            function (response) {
//                log(response);
//                $startButton.attr('disabled', "true");
////                console.log(response);
//
//            }
//        );

        port.postMessage({trainInfo: trainInfo, type: 'QUERY_START'});

    });

    $stopButton.click(function (event) {
        event.preventDefault();

        port.postMessage({type: 'QUERY_STOP'});

        $startButton.removeAttr('disabled');
        $stopButton.attr('disabled', 'true');

    });


});
