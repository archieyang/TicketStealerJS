/**
 * Created by archie on 13-11-22.
 */
//var log = function (message) {
////    function for log information to the chrome console
//    return console.log(message);
//};

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

        buildQueryFunction = function () {
            var regex = /(?:<span id=.+?>)(.+?)<\/span>,(?:.+?)([\u4E00-\u9FFF]+)(?:.+?)(\d{2}:\d{2})(?:.+?)([\u4E00-\u9FFF]+)(?:.+?)(\d{2}:\d{2}),(\d{2}:\d{2}),((?:.+?,){11})/g,
                isWUTicket = /[^\d+|\-\-]/,//Use to filter Chinese character "无",

                trainInfoPtn = ["trainNo", "from", "fromTime", "to", "toTime", "lastTime"],
//                       ticketInfoPtn = [  '商务座',   '特等座','一等座','二等座', '高级软卧',      '软卧',   '硬卧',   '软座',   '硬座',  '无座']
                ticketInfoPtn = ["businessSt", "VIPSt", "G1St", "G2St", "VIPSoftBd", "softBd", "hardBd", "softSt", "hardSt", "standTkt"],
                fromCityCode,   //the citycode of departure city
                toCityCode,     //the citycode of destination city
                startMins,      //start time limit for departure time
                endMins,        //end time limit for deparute time
                queryUrls,

                buildQueryTrainUrl = function (fromCityCode, toCityCode, date, trainClass) {
//                    build query url per date
                    if (fromCityCode && toCityCode && date && trainClass) {
                        return "http://dynamic.12306.cn/otsquery/query/queryRemanentTicketAction.do?method=queryLeftTicket&orderRequest.train_date=" + date + "&orderRequest.from_station_telecode=" + fromCityCode + "&orderRequest.to_station_telecode=" + toCityCode + "&orderRequest.train_no=&trainPassType=QB&trainClass=" + trainClass + "&includeStudent=00&seatTypeAndNum=&orderRequest.start_time_str=00%3A00--24%3A00"
                    }
                    return null;
                },

                getTimeInMinute = function (time) {
//                    transform time strings to miniutes
                    var isTime = /\d{2}:\d{2}/,
                        hoursMinutes,
                        hours,
                        minutes,
                        timeInMinutes;
                    if (!isTime.test(time)) {
                        return;
                    }
                    hoursMinutes = time.split(":"),
                        hours = parseInt(hoursMinutes[0]),
                        minutes = parseInt(hoursMinutes[1]),
                        timeInMinutes = hours * 60 + minutes;

                    if (hours < 0 || hours > 24) {
                        return;
                    }
                    if (minutes < 0 || minutes > 60) {
                        return;
                    }

                    if (timeInMinutes > 24 * 60) {
                        return;
                    }

                    return timeInMinutes;
                },

                isTimeFits = function (time) {
//                    test whether a given time is bewteen startMins and endMins
                    var timeInMins = parseInt(getTimeInMinute(time));


                    return timeInMins >= startMins && timeInMins <= endMins;
                },

                queryTrainPerDate = function (queryTrainTicketUrl) {
                    log(queryTrainTicketUrl);
//                    query wanted train info for a given date
                    var rawInfo,//Raw info got from dynamic.12306.cn
                        rawInfoObject,//Raw object of rawInfo
                        rawItem,//an item extracted from rawObject.datas by regex
                        trainItem,//Per train info
                        rawTicketInfo,//Raw ticket info for one trainItem,may contain Chinese character "无"
                        ticketInfo,//All ticket info with only number or "--"

                        trainInfoRes = [],//All trainItems
                        trainInfoResWithTimestamp,//trainInfoRes with timestamp
                        i;


                    rawInfo = httpGet(queryTrainTicketUrl);

                    if (rawInfo == -1) {
//                        An error happens
                        return;
                    }

//            Contains only two attribute: datas and time
                    rawInfoObject = JSON.parse(rawInfo);

//              Use regex to get one train ticket info from datas,
//              iterates to get all the infos.
                    if (rawInfoObject.hasOwnProperty("datas")) {

                        while ((rawItem = regex.exec(rawInfoObject.datas) ) !== null) {
                            trainItem = {};

                            for (i = 0; i < trainInfoPtn.length; ++i) {
                                trainItem[trainInfoPtn[i]] = rawItem[i + 1];
                                if (i === 2 && !isTimeFits(trainItem[trainInfoPtn[2]])) {
                                    break;
                                }
                            }

                            if (i === 2) {
                                continue;
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
                var date, startDate = queryInfo.dates.first, endDate = queryInfo.dates.last, year, month, day;

                fromCityCode = queryCityCode(queryInfo.fromCity);
                toCityCode = queryCityCode(queryInfo.toCity);

                startMins = getTimeInMinute(queryInfo.departureStartTime);
                endMins = getTimeInMinute(queryInfo.departureEndTime);

                if (startMins === undefined) startMins = 0;
                if (endMins === undefined) endMins = 24 * 60;

                queryUrls = [];

//                build a queryUrls group from queryInfo ,each item is a query per day.
                for (date = new Date(startDate.getTime()); date <= endDate; date.setDate(date.getDate() + 1)) {
                    year = date.getFullYear();
                    month = date.getMonth() + 1;
                    day = date.getDate();

                    if (month < 10)month = "0" + month;
                    if (day < 10)day = "0" + day;

                    queryUrls.push(buildQueryTrainUrl(fromCityCode, toCityCode, year + "-" + month + "-" + day, queryInfo.trainClass))
                }

                return function () {
//                    Returns a function built from the queryInfo,and can be used to retrieve train infos
                    var res = [], i;

                    for (i in queryUrls) {
                        res.push(queryTrainPerDate(queryUrls[i]));
                    }
                    return res;
                };

            };

        }();

//    return the ticketto function
    return {"buildQueryFunction": buildQueryFunction};
}();
//var test = function () {
//    var qInfo = {fromCity: "北京", toCity: "上海", dates: [new Date(2013, 10, 24), new Date(2013, 10, 24)], trainClass: "QB%23D%23Z%23T%23K%23QT%23", departureStartTime: "21:22", departureEndTime: "21:40"},
//        qInfo2 = {fromCity: "北京", toCity: "上海", dates: [new Date(2013, 10, 27), new Date(2013, 10, 29)], trainClass: "QB%23D%23Z%23T%23K%23QT%23"},
//        qFunction = ticketto.buildQueryFunction(qInfo2);
//    log(qFunction());
//};
//test();

