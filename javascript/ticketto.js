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
            try {
                xmlHttp.open("GET", theUrl, false);
                xmlHttp.send(null);
                return xmlHttp.responseText;

            } catch (e) {
                throw e;
            }
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

        },

        queryTrainTicket = function () {
            var queryTrainTicketUrl = "http://dynamic.12306.cn/otsquery/query/queryRemanentTicketAction.do?method=queryLeftTicket&orderRequest.train_date=2013-11-24&orderRequest.from_station_telecode=BJP&orderRequest.to_station_telecode=SHH&orderRequest.train_no=&trainPassType=QB&trainClass=QB%23D%23Z%23T%23K%23QT%23&includeStudent=00&seatTypeAndNum=&orderRequest.start_time_str=00%3A00--24%3A00",

                regex = /(?:<span id=.+?>)(.+?)<\/span>,(?:.+?)([\u4E00-\u9FFF]+)(?:.+?)(\d{2}:\d{2})(?:.+?)([\u4E00-\u9FFF]+)(?:.+?)(\d{2}:\d{2}),(\d{2}:\d{2}),((?:.+?,){11})/g,
                isWUTicket = /[^\d+|\-\-]/,//Use to filter Chinese character "无"

                trainInfoPtn = ["trainNo", "from", "fromTime", "to", "toTime", "lastTime"],
//              ticketInfoPtn = [  '商务座',   '特等座','一等座','二等座','高级软卧', '软卧',   '硬卧',   '软座',   '硬座',  '无座']
                ticketInfoPtn = ["businessSt", "VIPSt", "G1St", "G2St", "VIPSoftBd", "softBd", "hardBd", "softSt", "hardSt", "standTkt"],

                rawInfo,//Raw info got from dynamic.12306.cn
                rawInfoObject,//Raw object of rawInfo
                rawItem,//an item extracted from rawObject.datas by regex

                trainItem,//Per train info
                rawTicketInfo,//Raw ticket info for one trainItem,may contain Chinese character "无"
                ticketInfo,//All ticket info with only number or "--"

                trainInfoRes = [],//All trainItems
                trainInfoResWithTimestamp,//trainInfoRes with timestamp

                fromCityCode,toCityCode,i,

                buildQueryTrainUrl = function (fromCityCode, toCityCode, date, trainClass) {
                    if (fromCityCode && toCityCode && date && trainClass) {
                        return "http://dynamic.12306.cn/otsquery/query/queryRemanentTicketAction.do?method=queryLeftTicket&orderRequest.train_date=" + date + "&orderRequest.from_station_telecode=" + fromCityCode + "&orderRequest.to_station_telecode=" + toCityCode + "&orderRequest.train_no=&trainPassType=QB&trainClass=" + trainClass + "&includeStudent=00&seatTypeAndNum=&orderRequest.start_time_str=00%3A00--24%3A00"
                    }
                    return null;
                },

                queryTrainPerDate = function (queryTrainTicketUrl, startTime, endTime) {
                    log(queryTrainTicketUrl);
                    rawInfo = httpGet(queryTrainTicketUrl);
                    if (rawInfo==-1) {
                        return;
                    }

//            Contains only two attribute: datas and time
                    rawInfoObject = JSON.parse(rawInfo);


                    if (rawInfoObject.hasOwnProperty("datas")) {
//              Use regex to get one train ticket info from datas,
//              iterates to get all the infos.
                        while ((rawItem = regex.exec(rawInfoObject.datas) ) !== null) {
                            trainItem = {};
                            for (i = 0; i < trainInfoPtn.length; ++i) {
                                trainItem[trainInfoPtn[i]] = rawItem[i + 1];
                            }

                            rawTicketInfo = rawItem[trainInfoPtn.length + 1].split(",");

                            ticketInfo = {};

                            for (i = 0; i < ticketInfoPtn.length; ++i) {
                                //change Chinese character "无" to 0 ticket.
                                if (isWUTicket.test(rawTicketInfo[i]))
                                    ticketInfo[ticketInfoPtn[i]] = "0";
                                else
                                    ticketInfo[ticketInfoPtn[i]] = rawTicketInfo[i];
                            }

//                  Stores ticketInfo in trainItem
                            trainItem.ticket = ticketInfo;

                            trainInfoRes.push(trainItem);

                        }

                    }

                    trainInfoResWithTimestamp = {};
                    trainInfoResWithTimestamp.trainInfoData = trainInfoRes;


                    if (rawInfoObject.hasOwnProperty("time")) {
                        trainInfoResWithTimestamp.timestamp = rawInfoObject.time;
                    }

                    return trainInfoResWithTimestamp;
                };


            return function (queryInfo) {
                var pos, res=[];
                fromCityCode = queryCityCode(queryInfo.fromCity);
                toCityCode = queryCityCode(queryInfo.toCity);
                for(pos in queryInfo.dates){
                    log(queryInfo.dates[pos]);
                    log(queryInfo.trainClass);
                    res.push(queryTrainPerDate(buildQueryTrainUrl(fromCityCode,toCityCode,queryInfo.dates[pos],queryInfo.trainClass)));
                }

                return res;


            };


        }();

//    return the ticketto function
    return function () {
        log('halo');
        var query = {from: queryCityCode(""), to: queryCityCode(), trainClass: "", date: ""};
        log(queryCityCode("北京"));
        log(queryCityCode("上海"));
        log(queryCityCode("嘿嘿"));

        var qInfo = {fromCity:"北京",toCity:"上海",dates:["2013-11-24","2013-11-25"],trainClass:"QB%23D%23Z%23T%23K%23QT%23", startTime:null, endTime:null};

        log(queryTrainTicket(qInfo));


    }
}();

ticketto();

