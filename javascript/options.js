/**
 * Created by archie on 13-11-24.
 */
var log = function (message) {
    console.log(message);
};


log("halo from options.js");

$(document).ready(function () {
    log("hello");


    $("#settingForm").submit(function (event) {

        event.preventDefault();
        var trainInfo = {}, basicInfo = $("[name='basicInfo']"), trainClassCheckbox = $("[name='tclass']"),
            getDateFromForm = function (sDate) {
                var ymd = sDate.split("-");
                return new Date(ymd[0], parseInt(ymd[1]) - 1, ymd[2]);
            };
        trainInfo.fromCity = basicInfo[0].value;
        trainInfo.toCity = basicInfo[1].value;

        trainInfo.dates = {};

        trainInfo.dates.first = getDateFromForm(basicInfo[2].value);
        trainInfo.dates.last = getDateFromForm(basicInfo[3].value);

        trainInfo.departureStartTime = basicInfo[4].value;
        trainInfo.departureEndTime = basicInfo[5].value;
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
