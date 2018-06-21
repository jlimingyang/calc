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
        console.log(res.code);
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
        // console.log(res.code);
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
        console.log("今天是：" + year + "年" + mouths + "月" + day + "日" + hours + ":" + minutes + ":" + seconds + " " + weekDay[date.getDay()]);
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
        if (useCache) {
            setCookie("py:rest:std:" + date.getFullYear(), festivalDays);
        }
        return festivalDays;
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
            return restDays;
        }
        var holidays = this.getStandardFestivals(date, true);
        //这里需要加上明年1月1日的放假情况，保证12月30左右的放假/加班情况
        holidays[date.getFullYear() + 1 + "0101"] = calendar.sFtv["0101"];
        var dateAutumn = {};
        var i = 1;
        for (var day in holidays) {
            //跳过中秋节 最后处理
            if (holidays[day] == calendar.lFtv["0815"]) {
                //单独提出中秋节
                dateAutumn[day] = calendar.lFtv["0815"];
                continue;
            }

            if (Object.keys(holidays).length === i) {
                // 最后处理中秋节

            }

            //计算加班,休息,节假日
            var type = 3;
            if (holidays[day] == calendar.lFtv[0101] || holidays[day] == calendar.lFtv[1001]) {
                type = 1;
            } else if (holidays[day] == calendar.lFtv[1230]) {
                type = 2;
            }
            //中秋国庆在同一天
            if (holidays[day] == (calendar.sFtv["1001"] + "&" + calendar.lFtv["0815"])) {
                var res = {};
                res = this.calcHolidays(day, 1);
                console.log("res:" + res);
                result = concatObj(result, res);
                //处理中秋节
                type = 3;
            }
            console.log(day+"-----"+type)
            var res = this.calcHolidays(day, type);
            console.log(res)
            result = concatObj(result, res);
            console.log("result:"+result)
            //中秋节靠近国庆节
            var autumnDayNum = parseInt(day.substring(4));
            console.log("autumnDayNum:" + autumnDayNum);
            if (holidays[day] == calendar.lFtv["0815"] && autumnDayNum > 923) {
                //获取国庆的星期信息
                var dateDay = new Date(Date.parse(Num2Date(day)));
                dateDay.setMonth(9);
                dateDay.setDate(1);
                console.log("date:" + dateDay);
                if (autumnDayNum > 1000) {
                    switch (dateDay.getDay()) {
                        case 0:
                            dateDay.setDate(date.getDate() + 7);
                            break;
                        case 1:
                            dateDay.setDate(date.getDate() - 1);
                            break;
                        case 2:
                            dateDay.setDate(date.getDate() - 1);
                            break;
                        case 3:
                            dateDay.setDate(date.getDate() + 10);
                            break;
                        case 4:
                            dateDay.setDate(date.getDate() + 9);
                            break;
                        case 5:
                            dateDay.setDate(date.getDate() - 5);
                            break;
                        case 6:
                            dateDay.setDate(date.getDate() + 7)
                            break;
                    }
                    //需要取消加班的时间
                    dateDay.setMonth(dateDay.getMonth() + 1);
                    console.log(dateDay)
                    dateDay = Date2Num(dateDay);
                    console.log(dateDay)
                    if (isNotEmpty(result[dateDay])) {
                        delete result[dateDay];
                    }
                    //计算中秋节
                    if (autumnDayNum != 1001) {
                        day = parseInt(day);
                        result[day] = 1;
                    }
                }
                // else {
                //
                // }
                continue;
            }

        }
        console.log(result);
        setCookie("py:rest:" + date.getFullYear(), result);
        return result;
    },

    /**
     * 处理调休加班  放假1  加班0
     * @param date 日期
     * @param type  1春节 国庆 2除夕 3其他
     */
    calcHolidays: function (date, type) {
        type = parseInt(type);
        var result = {};
        var date = new Date(Date.parse(date));
        //转为标准月份
        var year = date.getFullYear().toString();
        var month = addZero(date.getMonth() + 1);
        //春节往前调一天
        if (type === 1 && date.getMonth() < 6) {
            date.setDate(date.getDate() - 1); //退到除夕  方便国庆和春节一起处理 除夕不记录  因为除夕已经被当作节日 后面会处理
        } else {
            //记录当天放假
            result[year + month + addZero(date.getDate())] = 1;
        }
        console.log(date.getDay());
        switch (date.getDay()) {
            case 0:
                //节假日在周日  春节从除夕算起  国庆从1号算起 后六天一定放假
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        date.setDate(date.getDate() + 1);
                        result[year + month + addZero(date.getDate())] = 1;
                    }
                    //记录该周末和上周六加班
                    date.setDate(date.getDate() + 1);
                    result[year + month + addZero(date.getDate())] = 0;
                    date.setDate(date.getDate() - 8);
                    result[year + month + addZero(date.getDate())] = 0;
                } else if (type === 3) {
                    //其他节日在周末 则记录前一天日期
                    date.setDate(date.getDate() - 1);
                    result[year + month + addZero(date.getDate())]= 1;
                }
                break;
            case 1:
                // 周一
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        date.setDate(date.getDate() + 1);
                        result[year + month + addZero(date.getDate())]= 1;
                    }
                    //记录上周末和周六加班
                    date.setDate(date.getDate() - 8);
                    result[year + month + addZero(date.getDate())] = 0;
                    date.setDate(date.getDate() + 1);
                    result[year + month + addZero(date.getDate())] = 0;
                } else if (type === 3) {
                    //其他节日在周一 则记录前二天日期
                    date.setDate(date.getDate() - 1);
                    result[year + month + addZero(date.getDate())] = 1;
                    date.setDate(date.getDate() - 1);
                    result[year + month + addZero(date.getDate())] = 1;
                }
                break;
            case 2:
                // 周二
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        date.setDate(date.getDate() + 1);
                        result[year + month + addZero(date.getDate())] = 1;
                    }
                    //记录上周末加班和周六加班
                    date.setDate(date.getDate() - 8);
                    result[year + month + addZero(date.getDate())] = 0;
                    date.setDate(date.getDate() + 13);
                    result[year + month + addZero(date.getDate())] = 0;
                } else if (type === 3) {
                    //其他节日在周二 则前二天放假  上周末加班
                    date.setDate(date.getDate() - 1);
                    result[year + month + addZero(date.getDate())] = 0;
                    date.setDate(date.getDate() - 1);
                    result[year + month + addZero(date.getDate())] = 1;
                    date.setDate(date.getDate() - 1);
                    result[year + month + addZero(date.getDate())] = 0;
                }
                break;
            case 3:
                //周三
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        date.setDate(date.getDate() + 1);
                        result[year + month + addZero(date.getDate())] = 1;
                    }
                    //记录上周末加班和周六加班
                    date.setDate(date.getDate() - 9);
                    result[year + month + addZero(date.getDate())] = 0;
                    date.setDate(date.getDate() + 13);
                    result[year + month + addZero(date.getDate())] = 0;
                } else if (type === 3) {
                    //其他节日在周三 前两天放假 上周末加班
                    date.setDate(date.getDate() - 1);
                    result[year + month + addZero(date.getDate())] = 1;
                    date.setDate(date.getDate() - 1);
                    result[year + month + addZero(date.getDate())] = 1;
                    date.setDate(date.getDate() - 1);
                    result[year + month + addZero(date.getDate())] = 0;
                    date.setDate(date.getDate() - 1);
                    result[year + month + addZero(date.getDate())] = 0;
                }
                break;
            case 4:
                //周四
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        date.setDate(date.getDate() + 1);
                        result[year + month + addZero(date.getDate())] = 1;
                    }
                    //记录上周末加班和周六加班
                    date.setDate(date.getDate() - 10);
                    result[year + month + addZero(date.getDate())] = 0;
                    date.setDate(date.getDate() + 13);
                    result[year + month + addZero(date.getDate())] = 0;
                } else if (type === 3) {
                    //其他节日在周四 后两天放假 周六加班
                    date.setDate(date.getDate() + 1);
                    result[year + month + addZero(date.getDate())] = 1;
                    date.setDate(date.getDate() + 1);
                    result[year + month + addZero(date.getDate())] = 1;
                    date.setDate(date.getDate() + 1);
                    result[year + month + addZero(date.getDate())] = 0;
                }
                break;
            case 5:
                //周五
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        date.setDate(date.getDate() + 1);
                        result[year + month + addZero(date.getDate())] = 1;
                    }
                    //记录上周末加班和周六加班
                    date.setDate(date.getDate() - 11);
                    result[year + month + addZero(date.getDate())] = 0;
                    date.setDate(date.getDate() + 13);
                    result[year + month + addZero(date.getDate())] = 0;
                } else if (type === 3) {
                    //其他节日在周五 后两天放假 周六加班
                    date.setDate(date.getDate() + 1);
                    result[year + month + addZero(date.getDate())] = 1;
                    date.setDate(date.getDate() + 1);
                    result[year + month + addZero(date.getDate())] = 1;
                }
                break;
            case 6:
                //周六
                if (type === 1) {
                    for (var i = 0; i < 6; i++) {
                        date.setDate(date.getDate() + 1);
                        result[year + month + addZero(date.getDate())] = 1;
                    }
                    //记录周末加班和周六加班
                    date.setDate(date.getDate() + 1);
                    result[year + month + addZero(date.getDate())] = 0;
                    date.setDate(date.getDate() + 1);
                    result[year + month + addZero(date.getDate())] = 0;
                } else if (type === 3) {
                    //其他节日在周六 后两天放假
                    date.setDate(date.getDate() + 1);
                    result[year + month + addZero(date.getDate())] = 1;
                    date.setDate(date.getDate() + 1);
                    result[year + month + addZero(date.getDate())] = 1;
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
function addDate(date, type, offset) {
    type = parseInt(type);
    date = new Date(Date.parse(date));
    switch (type) {
        case 1:
            date.setFullYear(date.getFullYear() + offset);
            break;
        case 2:
            date.setMonth(date.getMonth() + offset);
            break;
        case 3:
            date.setDate(date.getDate() + offset);
            break;
        default:
            break;
    }
    return date;
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


