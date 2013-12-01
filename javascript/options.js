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
        cityNames = ticketto.getCityNames(),

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


        chrome.runtime.sendMessage({
                trainInfo: trainInfo,
                type: "QUERY_START",
                queryInterval:3*1000
            },
            function (response) {
                log(response.message);
                $startButton.attr('disabled', "true");
//                console.log(response);

            }
        );


    });

    $stopButton.click(function (event) {
        event.preventDefault();
        chrome.runtime.sendMessage({
                type: "QUERY_STOP"
            },
            function (response) {
                log(response.message);
                $startButton.removeAttr('disabled');
            }
        );

    });

    chrome.runtime.onMessage.addListener(function (request) {
        if (request.type == "QUERY_FEEDBACK") {
            console.log(request);
        }

    })


});
