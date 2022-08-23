import moment from 'moment'
const dateStart = "2022/6/1";

export function pickerOptions(hasWeek = true) {
  let pickerOptions =
  {
    firstDayOfWeek: 1,
    shortcuts: [
      {
				key: "THIS_WEEK",
        text: "本週",
				disabled: !hasWeek,
        onClick(picker) {
          let offset = moment().day() != 0 ? 0 : 1;
          const end = moment().subtract(0+offset, "w").day(7).endOf("d");
          const start = moment().subtract(0+offset, "w").day(1).startOf("d");
          picker.$emit("pick", [start, end]);
        },
      },
      {
				key: "LAST_WEEK",
        text: "上週",
				disabled: !hasWeek,
        onClick(picker) {
          let offset = moment().day() != 0 ? 0 : 1;
          const end = moment().subtract(1+offset, "w").day(7).endOf("d");
          const start = moment().subtract(1+offset, "w").day(1).startOf("d");
          picker.$emit("pick", [start, end]);
        },
      },
      {
				key: "THIS_MONTH",
        text: "本月",
				disabled: false,
        onClick(picker) {
          const end = moment().endOf("month");
          const start = moment().startOf("month");
          picker.$emit("pick", [start, end]);
        },
      },
			{
				key: "LAST_MONTH",
				text: "上月",
				disabled: false,
				onClick(picker) {
					const end = moment().subtract(1, "month").endOf("month");
					const start = moment().subtract(1, "month").startOf("month");
					picker.$emit("pick", [start, end]);
				},
			},
			{
				key: "THIS_YEAR",
				text: "今年",
				disabled: false,
				onClick(picker) {
					const end = moment().endOf("year");
					const start = moment().startOf("year");
					picker.$emit("pick", [start, end]);
				},
			}
    ],
    disabledDate(date) {
			if (dateStart != undefined) return moment(date).valueOf() < moment(dateStart).startOf("d").valueOf() || moment(date).valueOf() >= moment().endOf("d").valueOf();
      else return moment(date).valueOf() >= moment().endOf("d").valueOf();
    },
  }

	pickerOptions.shortcuts = pickerOptions.shortcuts.filter(s => !s.disabled);

  return pickerOptions
}

export function dateWatcher(daterange) {
  if (moment(daterange[1]).isAfter(moment())) daterange[1] = moment().endOf("d").toDate();
  if (moment(daterange[0]).isAfter(daterange[1])) daterange[0] = daterange[1];
	if (dateStart != undefined) {
		const start = moment(dateStart).startOf("d").valueOf();
		if (moment(daterange[0]).isBefore(start)) daterange[0] = start;
	} 
}

export function dateShortcuts(index, hasWeek = true) {
  const DATE_OPTION = {
    THIS_WEEK: -1,
    LAST_WEEK: -1,
    THIS_MONTH: -1,
		LAST_MONTH: -1,
		THIS_YEAR: -1
  }

	const shortcuts = pickerOptions(hasWeek).shortcuts;
	shortcuts.forEach((option, index) => DATE_OPTION[option.key] = index);

	const offsetWeek = moment().day() != 0 ? 0 : 1;

  // this.timeTabId = index;
  switch (index) {
    case DATE_OPTION.THIS_WEEK:
			return [moment().subtract(0 + offsetWeek, "w").day(1).startOf("d"), moment().subtract(0 + offsetWeek, "w").day(7).endOf("d")]
      break
    case DATE_OPTION.LAST_WEEK:
			return [moment().subtract(1 + offsetWeek, "w").day(1).startOf("d"), moment().subtract(1 + offsetWeek, "w").day(7).endOf("d")]
      break
    case DATE_OPTION.THIS_MONTH:
      return [moment().startOf("month"), moment().endOf("month")]
      break
		case DATE_OPTION.LAST_MONTH:
			return [moment().subtract(1, "month").startOf("month"), moment().subtract(1 , "month").endOf("month")]
			break
		case DATE_OPTION.THIS_YEAR:
			return [moment().startOf("year"), moment().endOf("year")]
			break
  }
}