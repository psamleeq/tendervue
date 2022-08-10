import moment from 'moment'

export function pickerOptions() {
  let pickerOptions =
  {
    firstDayOfWeek: 1,
    shortcuts: [
      {
        text: "今日",
        onClick(picker) {
          const end = moment().endOf("d");
          const start = moment().startOf("d");
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "昨日",
        onClick(picker) {
          const end = moment().endOf("d").subtract(1, "d");
          const start = moment().startOf("d").subtract(1, "d");
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "本週",
        onClick(picker) {
          let offset = moment().day() != 0 ? 0 : 1;
          const end = moment().subtract(0+offset, "w").day(7).endOf("d");
          const start = moment().subtract(0+offset, "w").day(1).startOf("d");
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "上週",
        onClick(picker) {
          let offset = moment().day() != 0 ? 0 : 1;
          const end = moment().subtract(1+offset, "w").day(7).endOf("d");
          const start = moment().subtract(1+offset, "w").day(1).startOf("d");
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "本月",
        onClick(picker) {
          const end = moment().endOf("month");
          const start = moment().startOf("month");
          picker.$emit("pick", [start, end]);
        },
      },
    ],
    disabledDate(date) {
      return moment(date).valueOf() >= moment().endOf("d").valueOf();
    },
  }

  return pickerOptions
}

export function dateWatcher(daterange) {
  if (moment(daterange[1]).isAfter(moment())) {
    daterange[1] = moment().endOf("d").toDate();
  }
  if (moment(daterange[0]).isAfter(daterange[1])) {
    daterange[0] = daterange[1];
  }
}

export function dateShortcuts(index) {
  const DATE_OPTION = {
    TODAY: 0,
    YESTERDAY: 1,
    THIS_WEEK: 2,
    LAST_WEEK: 3,
    THIS_MONTH: 4,
  }

  let offset = 0;

  // this.timeTabId = index;
  switch (index) {
    case DATE_OPTION.TODAY:
      return [moment().startOf("d"), moment().endOf("d")]
      break
    case DATE_OPTION.YESTERDAY:
      return [moment().startOf("d").subtract(1, "d"), moment().endOf("d").subtract(1, "d")]
      break
    case DATE_OPTION.THIS_WEEK:
      offset = moment().day() != 0 ? 0 : 1;
      return [moment().subtract(0+offset, "w").day(1).startOf("d"), moment().subtract(0+offset, "w").day(7).endOf("d")]
      break
    case DATE_OPTION.LAST_WEEK:
      offset = moment().day() != 0 ? 0 : 1;
      return [moment().subtract(1+offset, "w").day(1).startOf("d"), moment().subtract(1+offset, "w").day(7).endOf("d")]
      break
    case DATE_OPTION.THIS_MONTH:
      return [moment().startOf("month"), moment().endOf("month")]
      break
  }
}