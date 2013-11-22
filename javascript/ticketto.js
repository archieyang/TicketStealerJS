/**
 * Created by archie on 13-11-22.
 */
var log = function (message) {
//    function for log information to the chrome console
    return console.log(message);
};

var ticketto = function () {
    var cityList,

        httpGet = function (theUrl) {
//            HTTP GET methond
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", theUrl, false);
            xmlHttp.send(null);
            return xmlHttp.responseText;
        },

        queryCityCode = function (cityName) {
//            Get the city code of cityName, the city code is three characters such as "BJP"
            var queryCityCodeUrl = 'http://dynamic.12306.cn/otsquery/js/common/station_name.js?version=1.40',
                regexCity = new RegExp("\\|" + cityName + "\\|(.+?)\\|"),
                res;

            if (cityList === undefined) {
                try {
                    cityList = httpGet(queryCityCodeUrl);
                } catch (e) {
                    alert(e.message);
                }
            }


            res = regexCity.exec(cityList);


            return res === null ? null : res[1];

        };

//    return the ticketto function
    return function () {
        log(queryCityCode("北京"));
        log(queryCityCode("上海"));
        log(queryCityCode("嘿嘿"));

    }
}();

ticketto();

