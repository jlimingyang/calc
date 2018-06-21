var calc = {
//清明
    getTerm: function (y, m, d) {
        // 当月的两个节气
        var firstNode = calendar.getTerm(y, (m * 2 - 1));//返回当月「节」为几日开始
        var secondNode = calendar.getTerm(y, (m * 2));//返回当月「节」为几日开始

        // 依据12节气修正干支月
        var gzM = calendar.toGanZhi((y - 1900) * 12 + m + 11);
        if (d >= firstNode) {
            gzM = calendar.toGanZhi((y - 1900) * 12 + m + 12);
        }

        //传入的日期的节气与否
        var Term = null;
        if (firstNode === d) {
            Term = calendar.solarTerm[m * 2 - 2];
        }
        if (secondNode === d) {
            Term = calendar.solarTerm[m * 2 - 1];
        }
        return Term;

    },
    //更改传递参数 公历->农历
    solar2lunar: function (date) {
        dateOb = new Date(Date.parse(date));
        date = dateOb.getFullYear() + "-" + (dateOb.getMonth() + 1) + "-" + dateOb.getDate();
        var strs = new Array(); //定义一数组
        strs = date.split("-"); //字符分割
        var res = calendar.solar2lunar(parseInt(strs[0]), parseInt(strs[1]), parseInt(strs[2]));
        console.log(res.code);
        if (res != null && res != undefined && res != "" && res.code == 1) {
            return Date2Num(res.data.lYear + "-" + res.data.lMonth + "-" + res.data.lDay);
        } else {
            return res;
        }
    },
    //农历->公历
    lunar2solar: function (date) {
        dateOb = new Date(Date.parse(date));
        date = dateOb.getFullYear() + "-" + (dateOb.getMonth() + 1) + "-" + dateOb.getDate();
        var strs = new Array(); //定义一数组
        strs = date.split("-"); //字符分割
        var res = calendar.lunar2solar(parseInt(strs[0]), parseInt(strs[1]), parseInt(strs[2]), false);
        console.log(res.code);
        if (res != null && res != undefined && res != "" && res.code === 1) {
            return Date2Num(res.data.cYear + "-" + res.data.cMonth + "-" + res.data.cDay);
        } else {
            return res;
        }
    },

//获取星期几
    getWeekFromDate: function (date) {
        var date = new Date(Date.parse(date));
        var year = date.getFullYear();
        var mouths = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var weekDay = new Array(7);
        weekDay[0] = "星期日";
        weekDay[1] = "星期一";
        weekDay[2] = "星期二";
        weekDay[3] = "星期三";
        weekDay[4] = "星期四";
        weekDay[5] = "星期五";
        weekDay[6] = "星期六";
        console.log("今天是：" + year + "年" + mouths + "月" + day + "日" + hours + ":" + minutes + ":" + seconds + " " + weekDay[date.getDay()]);
        return weekDay[date.getDay()];
    },
    //获取标准节假日
    getStandardFestivals: function (date, useCache) {

        var date = new Date(Date.parse(date));
        if (useCache) {
            var restDays = getCookie("py:rest:std:" + date.getFullYear());
            if (restDays != null && restDays != "") {
                return restDays;
            }
        }
        var festivalDays = new Array();
        //公历节日
        festivalDays[date.getFullYear() + "0101"] = calendar.sFtv["0101"];
        festivalDays[date.getFullYear() + "0501"] = calendar.sFtv["0501"];
        festivalDays[date.getFullYear() + "1001"] = calendar.sFtv["1001"];
        var qmj = null;
        for (var i = 4; i <= 6; i++) {
            if (this.getTerm(date.getFullYear(), 04, i) == "清明") {
                qmj = date.getFullYear() + "04" + "0" + i;
                break;
            }
        }
        if (qmj != null && qmj != undefined && qmj != "") {
            festivalDays[qmj] = "清明";
        }
        //农历节日
        festivalDays[this.lunar2solar(date.getFullYear() + "-01-01")] = calendar.lFtv["0101"];
        festivalDays[this.lunar2solar((date.getFullYear() - 1) + "-12-30")] = calendar.lFtv["1230"];
        festivalDays[this.lunar2solar(date.getFullYear() + "-05-05")] = calendar.lFtv["0505"];
        festivalDays[this.lunar2solar(date.getFullYear() + "-08-15")] = calendar.lFtv["0815"];
        var str = Arr2Json(festivalDays);
        if (useCache) {
            setCookie("py:rest:std:" + date.getFullYear(), str);
        }
        return str;
    },


//初始化当年的节假日
    initHoliday: function (date) {

    },

//获取最近工作日
    recentWorkDay: function (date) {
        var date = new Date(Date.parse(date));

    },

//如果当天没有节日或补班信息 返回null
    checkFestivalInfo: function (date) {
        var date = new Date(Date.parse(date));
        var festivalDays = new Array();

    },

    /**
     * 处理调休加班 调休1  加班2
     * @param date 日期
     * @param type  1春节 国庆 2除夕 3其他
     */
    calcHolidays: function (date, type) {
        var result = [];
        var date = new Date(Date.parse(date));
        //春节往前调一天
        if (type === 1 && date.getDate() < 6) {
            date.setDate(date.getDate() - 1);
        } else {

        }
    },
}


function setCookie(c_name, value, expiredays) {
    var exdate = new Date()
    exdate.setDate(exdate.getDate() + expiredays)
    document.cookie = c_name + "=" + encodeURIComponent(value) +
        ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            c_end = document.cookie.indexOf(";", c_start)
            if (c_end === -1) c_end = document.cookie.length
            return decodeURIComponent(document.cookie.substring(c_start, c_end))
        }
    }
    return ""
}

//封装成json 自带的JSON.stringify()会崩溃不知道为什么
function Arr2Json(arr) {
    var str = "{";
    var i = 1;
    for (var key in  arr) {
        if (i == Object.keys(arr).length) {
            str += key + ":" + arr[key];
        } else {
            str += key + ":" + arr[key] + ",";
        }
        i++;
    }
    str += "}";
    return str;
}

/**
 * array to 20180909/2018-09-09 type 1/2
 * @return {string}
 */
function Arr2Date(arr, type) {
    switch (type) {
        case 1:
            return arr[0] + "" + (arr[1].toString().length < 2 ? ("0" + arr[1]) : arr[1]) + "" + (arr[2].toString().length < 2 ? ("0" + arr[2]) : arr[2]);
        case 2:
            return arr[0] + "-" + (arr[1].toString().length < 2 ? ("0" + arr[1]) : arr[1]) + "-" + (arr[2].toString().length < 2 ? ("0" + arr[2]) : arr[2]);
        default:
            return null;
    }
}

/**
 * 20180909->2018-09-09
 * @return {string}
 */
function Num2Date(date) {
    var year, month, day;
    year = date.substring(0, 4);
    month = date.substring(4, 6);
    day = date.substring(6, 8);
    return year + "-" + month + "-" + day;
}

/**
 * 2018-09-09/2018-9-9 -> 20180909
 * @return {string}
 */
function Date2Num(date) {
    var arr = [];
    arr = date.split("-");
    return arr[0] + (arr[1].length < 2 ? "0" + arr[1] : arr[1]) + "" + (arr[2].length < 2 ? "0" + arr[2] : arr[2]);
}

//2018-09-09/2018-9-9 -> array
function Date2Array(date) {
    var arr = [];
    var res = [];
    arr = date.split("-");
    res[0] = arr[0];
    res[1] = arr[1].length < 2 ? ("0" + arr[1]) : arr[1];
    res[2] = arr[2].length < 2 ? ("0" + arr[2]) : arr[2];
    return res;
}

