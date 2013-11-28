/**
 * Created by archie on 13-11-24.
 */
var log = function (message) {
    console.log(message);
};


log("halo from options.js");

$(document).ready(function () {
    log("hello");
    var trainInfo = {},
        stringToDate = function (sDate) {
            var ymd = sDate.split("-");
            return new Date(ymd[0], parseInt(ymd[1]) - 1, ymd[2]);
        },

        datePickerParam = function () {

            var param;
            return function (onSelectCallback) {
                param = {
                    inline: true,
                    dateFormat: 'yy-mm-dd',
                    clearText: "清除",
                    closeText: "关闭",
                    yearSuffix: '年',
                    showMonthAfterYear: true,
                    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
                    dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
                    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
                    onSelect: onSelectCallback
                };

                return param;
            };
        }(),

        timePickerParam = function () {
            var param;

            return function (onSelectedCallback) {
                param = {
                    defaultTime: '',

                    hourText: '时',             // Define the locale value for "Hours"
                    minuteText: '分',         // Define the locale value for "Minute"
                    amPmText: ['上午', '下午'],       // Define the locale value for periods
                    onSelect: onSelectedCallback

                };
                return param;

            };

        }();

    trainInfo.dates = {};


    $("#firstDay").datepicker(
        datePickerParam(function (selectedDate) {
            trainInfo.dates.first = stringToDate(selectedDate);
        })
    );
    $("#lastDay").datepicker(
        datePickerParam(function (selectedDate) {
            trainInfo.dates.last = stringToDate(selectedDate);
//            if(trainInfo.dates.last < trainInfo.dates.first){
//                trainInfo.dates.last = trainInfo.dates.first;
//                $(this).setDate(trainInfo.dates.first.getTime());
//            }
        })
    );

    $("#startTime").timepicker(
        timePickerParam(function (selectedTime) {
            trainInfo.departureStartTime = selectedTime;
        })
    );

    $("#endTime").timepicker(
        timePickerParam(function (selectedTime) {
            trainInfo.departureEndTime = selectedTime;
        })
    );


    $("#settingForm").submit(function (event) {

        event.preventDefault();
        var basicInfo = $("[name='basicInfo']"), trainClassCheckbox = $("[name='tclass']");

        trainInfo.fromCity = basicInfo[0].value;
        trainInfo.toCity = basicInfo[1].value;

//        trainInfo.dates = {};

        trainInfo.dates.first = trainInfo.dates.first === undefined ? stringToDate(basicInfo[2].value) : trainInfo.dates.first;
        trainInfo.dates.last = trainInfo.dates.last === undefined ? stringToDate(basicInfo[3].value) : trainInfo.dates.last;

//        trainInfo.departureStartTime = trainInfo.departureStartTime === undefined ? basicInfo[4].value : trainInfo.departureStartTime;
//        trainInfo.departureEndTime = trainInfo.departureEndTime === undefined ? basicInfo[5].value : trainInfo.departureEndTime;
        trainInfo.trainClass = "";

        trainClassCheckbox.each(function () {
            log(this.checked + "" + $(this).val());
            if (this.checked) {
                trainInfo.trainClass += $(this).val();
            }
        });

        log(trainInfo);
        var f = ticketto.buildQueryFunction(trainInfo);
        log(f());


    })
});
