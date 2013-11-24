/**
 * Created by archie on 13-11-24.
 */
var log = function(message){
  console.log(message);
};



log("halo from options.js");

$(document).ready(function() {
    log("hello");


    $("#settingForm").submit(function(event){
//        var stringToDate = function(s){
//            var g = s.split("-"),date = new Date();
//
//            date.setYear(g[0]);
//            date.setMonth(parseInt(g[1])-1);
//            date.setDate(g[2]);
//            return date;
//        };
        event.preventDefault();

        var trainInfo= {},basicInfo = $("[name='basicInfo']"),trainClassCheckbox = $("[name='tclass']");
        trainInfo.fromCity = basicInfo[0].value;
        trainInfo.toCity = basicInfo[1].value;
        log(new Date(2013,3,5));
        trainInfo.dates = {start:basicInfo[2].value,end:basicInfo[3].value};
        log(trainInfo.dates);
//        trainInfo.dates.start = new Date(2013, 10, 15);
//        trainInfo.dates.end = new Date(2013, 10, 26);
//        trainInfo.dates.start=stringToDate(basicInfo[2].value);
//        trainInfo.dates.end=stringToDate(basicInfo[3].value);

        trainInfo.departureStartTime= basicInfo[4].value;
        trainInfo.departureEndTime = basicInfo[5].value;
        trainInfo.trainClass = "";

        trainClassCheckbox.each(function(){
            log(this.checked + "" + $(this).val());
            if(this.checked){
                trainInfo.trainClass+=$(this).val();
            }
        });

        log(trainInfo);
        var f = ticketto.buildQueryFunction(trainInfo);
        log(f());



    })
});
