/**
 * Created by archie on 13-11-24.
 */
var log = function (message) {
    console.log(message);
};


log("halo from options.js");

$(document).ready(function () {

    var $firstDayPicker = $("#firstDay"),
        $lastDayPicker = $("#lastDay"),
        $startButton = $("#startButton"),
        $departureTimeFrom = $('#startTime'),
        $departureTimeTo = $('#endTime'),
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
       source:cityNames
    });


    $("#settingForm").submit(function (event) {
        var trainInfo = {},
            basicInfo = $("[name='basicInfo']"), trainClassCheckbox = $("[name='tclass']"),
            _timeAsDateToTimeString = function(date){
                var h = date.getHours(), m = date.getMinutes();
                if(h<10){
                    h = '0' + h;
                }
                if(m<10){
                    m = '0' + m;
                }
                return h + ":" + m;
            };

        trainInfo.dates = {
            first: $firstDayPicker.datepicker('getDate'),
            last: $lastDayPicker.datepicker('getDate')
        };


        trainInfo.departureStartTime =_timeAsDateToTimeString($departureTimeFrom.timepicker('getTimeAsDate'));
        trainInfo.departureEndTime = _timeAsDateToTimeString($departureTimeTo.timepicker('getTimeAsDate'));



        event.preventDefault();


        trainInfo.fromCity = basicInfo[0].value;
        trainInfo.toCity = basicInfo[1].value;

//        trainInfo.departureStartTime = trainInfo.departureStartTime === undefined ? basicInfo[4].value : trainInfo.departureStartTime;
//        trainInfo.departureEndTime = trainInfo.departureEndTime === undefined ? basicInfo[5].value : trainInfo.departureEndTime;
        trainInfo.trainClass = "";

        trainClassCheckbox.each(function () {
            if (this.checked) {
                trainInfo.trainClass += $(this).val();
            }
        });

        log(trainInfo);
        var f = ticketto.buildQueryFunction(trainInfo);

        log(f());


    })
});
