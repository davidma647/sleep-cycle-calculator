export const CYCLE_MINUTES = 90;

const CYCLE_BEHAVIORS = [
  {
    cycle: 1,
    duration: "1.5h",
    label: "短暂小憩",
    detail: "只补一小觉，适合白天还要继续做事。",
    badge: "",
    tone: "brief",
  },
  {
    cycle: 2,
    duration: "3h",
    label: "补觉小睡",
    detail: "恢复一点精神，不适合作为整夜睡眠。",
    badge: "",
    tone: "brief",
  },
  {
    cycle: 3,
    duration: "4.5h",
    label: "半程恢复",
    detail: "能完成几轮周期，但白天可能仍需要放慢节奏。",
    badge: "",
    tone: "steady",
  },
  {
    cycle: 4,
    duration: "6h",
    label: "基础睡眠",
    detail: "比短睡更稳，适合时间被压缩的夜晚。",
    badge: "",
    tone: "steady",
  },
  {
    cycle: 5,
    duration: "7.5h",
    label: "成人优先睡眠",
    detail: "首选节点，睡醒更清爽，也不容易耽误当晚犯困。",
    badge: "首选",
    tone: "preferred",
  },
  {
    cycle: 6,
    duration: "9h",
    label: "充足睡眠",
    detail: "睡眠量更足，适合确实需要长恢复的日子。",
    badge: "",
    tone: "steady",
  },
  {
    cycle: 7,
    duration: "10.5h",
    label: "过长",
    detail: "睡太久可能浑身发软，晚上也更容易失眠。",
    badge: "不推荐",
    tone: "caution",
  },
];

function padTime(value) {
  return String(value).padStart(2, "0");
}

export function formatClock(totalMinutes) {
  const minutesInDay = 24 * 60;
  const normalized = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;

  return `${padTime(hour)}:${padTime(minute)}`;
}

export function validateClockInput(hourValue, minuteValue) {
  const hourText = String(hourValue ?? "").trim();
  const minuteText = String(minuteValue ?? "").trim();

  if (!hourText || !minuteText) {
    return {
      valid: false,
      hour: null,
      minute: null,
      message: "请输入完整的小时和分钟。",
    };
  }

  if (!/^\d{1,2}$/.test(hourText) || !/^\d{1,2}$/.test(minuteText)) {
    return {
      valid: false,
      hour: null,
      minute: null,
      message: "时间只能包含数字。",
    };
  }

  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (hour < 0 || hour > 23) {
    return {
      valid: false,
      hour: null,
      minute: null,
      message: "小时需要在 0 到 23 之间。",
    };
  }

  if (minute < 0 || minute > 59) {
    return {
      valid: false,
      hour: null,
      minute: null,
      message: "分钟需要在 0 到 59 之间。",
    };
  }

  return {
    valid: true,
    hour,
    minute,
    message: "",
  };
}

export function calculateCycles(hour, minute) {
  const startMinutes = hour * 60 + minute;

  return CYCLE_BEHAVIORS.map((behavior) => ({
    ...behavior,
    time: formatClock(startMinutes + behavior.cycle * CYCLE_MINUTES),
  }));
}
