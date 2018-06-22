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
        var strs = []; //定义一数组
        strs = date.split("-"); //字符分割
        var res = calendar.solar2lunar(parseInt(strs[0]), parseInt(strs[1]), parseInt(strs[2]));
        //console.log(res.code);
        if (isNotEmpty(res) && res.code == 1) {
            return Date2Num(res.data.lYear + "-" + res.data.lMonth + "-" + res.data.lDay);
        } else {
            return res;
        }
    },
    //农历->公历
    lunar2solar: function (date) {
        dateOb = new Date(Date.parse(date));
        date = dateOb.getFullYear() + "-" + (dateOb.getMonth() + 1) + "-" + dateOb.getDate();
        var strs = []; //定义一数组
        strs = date.split("-"); //字符分割
        var res = calendar.lunar2solar(parseInt(strs[0]), parseInt(strs[1]), parseInt(strs[2]), false);
        // //console.log(res.code);
        if (isNotEmpty(res) && res.code === 1) {
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
        //console.log("今天是：" + year + "年" + mouths + "月" + day + "日" + hours + ":" + minutes + ":" + seconds + " " + weekDay[date.getDay()]);
        return weekDay[date.getDay()];
    },
    //获取标准节假日
    getStandardFestivals: function (date, useCache) {
        var date = new Date(Date.parse(date));
        if (useCache) {
            var restDays = getCookie("py:rest:std:" + date.getFullYear());
            if (isNotEmpty(restDays)) {
                return restDays;
            }
        }
        var festivalDays = {};
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
        if (isNotEmpty(qmj)) {
            festivalDays[qmj] = "清明";
        }
        //农历节日
        festivalDays[this.lunar2solar(date.getFullYear() + "-01-01")] = calendar.lFtv["0101"];
        festivalDays[this.lunar2solar((date.getFullYear() - 1) + "-12-30")] = calendar.lFtv["1230"];
        festivalDays[this.lunar2solar(date.getFullYear() + "-05-05")] = calendar.lFtv["0505"];
        //中秋节可能与国庆节同一天 这里处理一下
        var dateAutumn = this.lunar2solar(date.getFullYear() + "-08-15");
        if (isNotEmpty(festivalDays[dateAutumn]) && festivalDays[dateAutumn] == calendar.sFtv["1001"]) {
            festivalDays[dateAutumn] = calendar.sFtv["1001"] + "&" + calendar.lFtv["0815"];
        } else {
            festivalDays[dateAutumn] = calendar.lFtv["0815"];
        }
        // //console.log(festivalDays);
        var str = Arr2Json(festivalDays);
        if (useCache) {
            setCookie("py:rest:std:" + date.getFullYear(), str);
        }
        return str;
    },


    //获取最近工作日
    recentWorkDay: function (date) {
        var date = new Date(Date.parse(date));

    },

    //如果当天没有节日或补班信息 返回null
    checkFestivalInfo: function (date) {
        var date = new Date(Date.parse(date));
        var festivalDays = [];

    },

    //初始化当年的节假日
    initHoliday: function (date) {
        var result = {}; //存储所有计算出来的节假日
        var date = new Date(Date.parse(date));
        var restDays = getCookie("py:rest:" + date.getFullYear());
        if (isNotEmpty(restDays)) {
            return JSON.parse(restDays);
        }
        var holidays = this.getStandardFestivals(date, true);
        holidays = JSON.parse(holidays);
        //这里需要加上明年1月1日的放假情况，保证12月30左右的放假/加班情况
        holidays[date.getFullYear() + 1 + '0101'] = calendar.sFtv["0101"];
        //console.log(holidays)
        var i = 1;
        for (var day in holidays) {
            //计算加班,休息,节假日
            var type = 3;
            if (holidays[day] === calendar.lFtv["0101"] || holidays[day] === calendar.sFtv["1001"]) {
                type = 1;
            } else if (holidays[day] === calendar.lFtv["1230"]) {
                type = 2;
            }
            //中秋国庆在同一天
            if (holidays[day] === (calendar.sFtv["1001"] + "&" + calendar.lFtv["0815"])) {
                var res = {};
                res = this.calcHolidays(day, 1);
                //console.log("同一天:" + res);
                result = concatObj(result, res);
                //处理中秋节
                type = 3;
            }
            //console.log(day + "-----" + type)
            //处理节假日
            var res = this.calcHolidays(Num2Date(day), type);
            //console.log(res);
            result = concatObj(result, res);
            //console.log(result)
            //中秋节靠近国庆节
            var autumnDayNum = parseInt(day.substring(4));
            //console.log("autumnDayNum:" + autumnDayNum);
            if (autumnDayNum > 923 && holidays[day] === calendar.lFtv["0815"]) {
                //获取国庆的星期信息
                var dateDay = new Date(Date.parse(Num2Date(day)));
                dateDay.setMonth(9);
                dateDay.setDate(1);
                //console.log("date:" + dateDay);
                if (autumnDayNum > 1000) {
                    switch (dateDay.getDay()) {
                        case 0:
                            dateDay = addDate(date,7);
                            break;
                        case 1:
                            dateDay = addDate(date,-1);
                            break;
                        case 2:
                            dateDay = addDate(date,-1);
                            break;
                        case 3:
                            dateDay = addDate(date,10);
                            break;
                        case 4:
                            dateDay = addDate(date,9);
                            break;
                        case 5:
                            dateDay = addDate(date,-5);
                            break;
                        case 6:
                            dateDay = addDate(date,7);
                            break;
                    }
                    //需要取消加班的时间
                    //console.log(dateDay)
                    if (isNotEmpty(result[dateDay])) {
                        delete result[dateDay];
                    }
                    //计算中秋节
                    if (autumnDayNum != 1001) {
                        day = parseInt(day);
                        result[day] = 1;
                    }
                } else {
                    //仅设置当天放假 取消前两天放假  目测这段是多余的代码  特殊情况处理方式还没有想好 如2012年 2015年
                }
                continue;
            }

        }
        setCookie("py:rest:" + date.getFullYear(), Arr2Json(result));
        return result;
    },

    /**
     * 处理调休加班  放假1  加班0
     * @param date 日期
     * @param type  1春节 国庆 2除夕 3其他
     */
    calcHolidays: function (dateDay, type) {
        //console.log(dateDay)
        type = parseInt(type);
        var date = new Date(Date.parse(dateDay));
        dateDay = Date2Num(dateDay.toString());
        var result = {};
        //春节往前调一天
        if (type === 1 && date.getMonth() < 6) {
            dateDay = addDate(dateDay, -1);//退到除夕  方便国庆和春节一起处理 除夕不记录  因为除夕已经被当作节日 后面会处理
            //console.log(dateDay);
        } else {
            //记录当天放假
            result[dateDay] = 1;
        }
        date = new Date(Date.parse(Num2Date(dateDay)));
        //console.log(date.getDay());
        switch (date.getDay()) {
            case 0:
                //节假日在周日  春节从除夕算起  国庆从1号算起 后六天一定放假
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        dateDay = addDate(dateDay, 1);
                        result[dateDay] = 1;
                    }
                    //记录该周末和上周六加班
                    dateDay = addDate(dateDay, 1);
                    result[dateDay] = 0;
                    dateDay = addDate(dateDay, -8);
                    result[dateDay] = 0
                } else if (type === 3) {
                    //其他节日在周末 则前一天放假 后一天也放假
                    dateDay = addDate(dateDay, -1);
                    result[dateDay] = 1
                    dateDay = addDate(dateDay, 2);
                    result[dateDay] = 1
                }
                break;
            case 1:
                // 周一
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        dateDay = addDate(dateDay, 1);
                        result[dateDay] = 1;
                    }
                    //记录上周末和周六加班
                    dateDay = addDate(dateDay, -8);
                    result[dateDay] = 0;
                    dateDay = addDate(dateDay, 1);
                    result[dateDay] = 0;
                } else if (type === 3) {
                    //其他节日在周一 则记录前二天日期
                    dateDay = addDate(dateDay, -1);
                    result[dateDay] = 1;
                    dateDay = addDate(dateDay, -1);
                    result[dateDay] = 1;
                }
                break;
            case 2:
                // 周二
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        dateDay = addDate(dateDay, 1);
                        result[dateDay] = 1;
                    }
                    //记录上周末加班和周六加班
                    dateDay = addDate(dateDay, -8);
                    result[dateDay] = 0;
                    dateDay = addDate(dateDay, 13);
                    result[dateDay] = 0;
                } else if (type === 3) {
                    //其他节日在周二 则前二天放假  上周末加班
                    dateDay = addDate(dateDay, -1);
                    result[dateDay] = 1;
                    dateDay = addDate(dateDay, -1);
                    result[dateDay] = 1;
                    dateDay = addDate(dateDay, -1);
                    result[dateDay] = 0;
                }
                break;
            case 3:
                //周三
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        dateDay = addDate(dateDay, -1);
                        result[dateDay] = 1;
                    }
                    //记录上周末加班和周六加班
                    dateDay = addDate(dateDay, -9);
                    result[dateDay] = 0;
                    dateDay = addDate(dateDay, 13);
                    result[dateDay] = 0;
                } else if (type === 3) {
                    //其他节日在周三 前两天放假 上周末加班
                    dateDay = addDate(dateDay, -1);
                    result[dateDay] = 1;
                    dateDay = addDate(dateDay, -1);
                    result[dateDay] = 1;
                    dateDay = addDate(dateDay, -1);
                    result[dateDay] = 0;
                    dateDay = addDate(dateDay, -1);
                    result[dateDay] = 0;
                }
                break;
            case 4:
                //周四
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        dateDay = addDate(dateDay, 1);
                        result[dateDay] = 1;
                    }
                    //记录上周末加班和周六加班
                    dateDay = addDate(dateDay, -10);
                    result[dateDay] = 0;
                    dateDay = addDate(dateDay, 13);
                    result[dateDay] = 0;
                } else if (type === 3) {
                    //其他节日在周四 后两天放假 周六加班
                    dateDay = addDate(dateDay, 1);
                    result[dateDay] = 1;
                    dateDay = addDate(dateDay, 1);
                    result[dateDay] = 1;
                    dateDay = addDate(dateDay, 1);
                    result[dateDay] = 0;
                }
                break;
            case 5:
                //周五
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        dateDay = addDate(dateDay, 1);
                        result[dateDay] = 1;
                    }
                    //记录上周末加班和周六加班
                    dateDay = addDate(dateDay, -11);
                    result[dateDay] = 0;
                    dateDay = addDate(dateDay, 13);
                    result[dateDay] = 0;
                } else if (type === 3) {
                    //其他节日在周五 后两天放假
                    dateDay = addDate(dateDay, 1);
                    result[dateDay] = 1;
                    dateDay = addDate(dateDay, 1);
                    result[dateDay] = 1;
                }
                break;
            case 6:
                //周六
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        dateDay = addDate(dateDay, 1);
                        result[dateDay] = 1;
                    }
                    //记录周末加班和周六加班
                    dateDay = addDate(dateDay, 1);
                    result[dateDay] = 0;
                    dateDay = addDate(dateDay, 1);
                    result[dateDay] = 0;
                } else if (type === 3) {
                    //其他节日在周六 后两天放假
                    dateDay = addDate(dateDay, 1);
                    result[dateDay] = 1;
                    dateDay = addDate(dateDay, 1);
                    result[dateDay] = 1;
                }
                break;
        }
        return result;
    },
}

/**
 * 判断是否为空
 * @param args
 * @returns {boolean}
 */
function isNotEmpty(args) {
    if (args != null && args != undefined && args != "") {
        return true;
    }
    return false;
}

/**
 * 调整年，月，日
 * @param date 日期
 * @param offset 调整量
 * @param type  1 年 2月 3日
 * @returns {Date}
 */
function addDate(date, day) {
    date = Date.parse(Num2Date(date.toString())) + (day * 86400000);
    date = new Date(date);
    return date.getFullYear() + "" + addZero(date.getMonth() + 1) + "" + addZero(date.getDate());
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

//合并两个对象  master对象为arr1
function concatObj(arr1, arr2) {
    if (isNotEmpty(arr2)) {
        for (key in arr2) {
            arr1[key] = arr2[key];
        }
    }

    return arr1;
}

//封装成json 自带的JSON.stringify()会崩溃不知道为什么
function Arr2Json(arr) {
    var str = '{';
    var i = 1;
    for (var key in  arr) {
        if (i == Object.keys(arr).length) {
            str += '"' + key + '":"' + arr[key] + '"';
        } else {
            str += '"' + key + '":"' + arr[key] + '",';
        }
        i++;
    }
    str += '}';
    return str;
}

/**
 * array to 20180909/2018-09-09 type 1/2
 * @return {string}
 */
function Arr2Date(arr, type) {
    switch (type) {
        case 1:
            return arr[0] + "" + addZero(arr[1]) + "" + addZero(arr[2]);
        case 2:
            return arr[0] + "-" + addZero(arr[1]) + "-" + addZero(arr[2]);
        default:
            return null;
    }
}

/**
 * 月 日补0
 * @param str
 * @returns {string}
 */
function addZero(str) {
    return str.toString().length < 2 ? ("0" + str) : str;
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
    return arr[0] + addZero(arr[1]) + "" + addZero(arr[2]);
}

//2018-09-09/2018-9-9 -> array
function Date2Array(date) {
    var arr = [];
    var res = [];
    arr = date.split("-");
    res[0] = arr[0];
    res[1] = addZero(arr[1]);
    res[2] = addZero(arr[2]);
    return res;
}

//添加或者修改json数据
function setJson(jsonStr, key, value) {
    if (!jsonStr) jsonStr = "{}";
    var jsonObj = JSON.parse(jsonStr);
    jsonObj[name] = value;
    return JSON.stringify(jsonObj);
}

//删除数据
function deleteJson(jsonStr, key) {
    if (!jsonStr) return null;
    var jsonObj = JSON.parse(jsonStr);
    delete jsonObj[name];
    return JSON.stringify(jsonObj);
}

// 20180101$0$元旦
// 20180211$1$春节加班
// 20180215$0$除夕
// 20180216$0$春节
// 20180217$0$春节
// 20180218$0$春节
// 20180219$0$春节
// 20180220$0$春节
// 20180221$0$春节
// 20180224$1$春节加班
// 20180405$0$清明节
// 20180406$0$清明节
// 20180407$0$清明节
// 20180408$1$清明节加班
// 20180428$1$劳动节加班
// 20180429$0$劳动节
// 20180430$0$劳动节
// 20180501$0$劳动节
// 20180616$0$端午节
// 20180617$0$端午节
// 20180618$0$端午节
// 20180922$0$中秋节
// 20180923$0$中秋节
// 20180924$0$中秋节
// 20180929$1$国庆节加班
// 20181001$0$国庆节
// 20181002$0$国庆节
// 20181003$0$国庆节
// 20181004$0$国庆节
// 20181005$0$国庆节
// 20181006$0$国庆节
// 20181007$0$国庆节
// 20181230$0$元旦
// 20181231$0$元旦


