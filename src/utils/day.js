// 设置dayjs并重新导出
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isToday from "dayjs/plugin/isToday";
import isoWeek from "dayjs/plugin/isoWeek";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.extend(isToday);
dayjs.extend(isBetween);

// 默认时区为东八区
import store from "@/store";
// 用户当前时区 因游戏时间都是东八区，不再设置当前时区，此处影响范围：名望、抓马
// store.state.timezone = dayjs.tz.guess();
const _timezone = store.state.timezone;
dayjs.tz.setDefault(_timezone);

export default dayjs;
