<template>
  <span class="time-picker">
    <el-button-group v-if="!dateTimePickerVisible">
      <el-button
        v-for="(t, i) in pickerOptions.shortcuts"
        :key="i"
        type="primary"
        :plain="i != timeTabIdProps"
        size="mini"
        @click="dateShortcuts(i, shortcutType)"
      >{{ t.text }}</el-button>
    </el-button-group>
    <el-date-picker
      v-else
      class="filter-item"
      v-model="daterangeProps"
      :type="type+'range'"
      range-separator="至"
      start-placeholder="開始日期"
      end-placeholder="結束日期"
      :picker-options="pickerOptions"
      :default-time="['00:00:00', '23:59:59']"
      :clearable="false"
      @change="timeTabIdProps = -1"
    />
    <el-button
      :type="dateTimePickerVisible ? 'info' : 'primary'"
      plain
      size="mini"
      @click="dateTimePickerVisible = !dateTimePickerVisible"
    >{{ dateTimePickerVisible ? '返回' : '進階' }}</el-button>
  </span>
</template>

<script>
import { pickerOptions, dateShortcuts, dateWatcher } from "@/utils/pickerOptions";

export default {
  name: 'time-picker',
  props: {
		type: {
			type: String,
			default: 'date'
		},
		timeTabId: {
			required: true,
			type: Number
		},
		disabledDate: {
			type: Boolean,
			default: true
		},
		hasWeek: {
			type: Boolean,
			default: true
		},
		shortcutType: {
			type: String,
			default: 'year'
		},
		daterange: {
			required: true,
			type: Array
		},
		pageCurrent: {
			type: Number,
			default: 1
		}
  },
  data() {
    return {
      dateTimePickerVisible: false,
      pickerOptions: pickerOptions(this.shortcutType, this.hasWeek, this.disabledDate),
    }
  },
  computed: {
    timeTabIdProps: {
      get() {
        return this.timeTabId
      },
      set(val) {
        this.$emit('update:timeTabId', val)
      }
    },
    daterangeProps: {
      get() {
        return this.daterange
      },
      set(val) {
        this.$emit('update:daterange', val)
      }
    }
  },
  watch: {
    daterangeProps(newValue, oldValue) {
      dateWatcher(newValue);
    },
  },
  methods: {
    dateShortcuts(index, shortcutType) {
      this.timeTabIdProps = index;
      this.daterangeProps = dateShortcuts(index, shortcutType, this.hasWeek);
      this.$emit('update:pageCurrent', 1);
      this.$emit('search');
    }
  },
}
</script>

<style lang="sass">
	.time-picker > *
		margin-right: 5px
</style>