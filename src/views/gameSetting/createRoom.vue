<template>
  <div class="app-container createRoom" v-loading="loading" :element-loading-text="loadingText">
    <h2>機器人開房</h2>
    <div class="filter-container">
      <!-- <el-select v-model="listQuery.gameType" placeholder="請選擇" @change="getList">
        <el-option
          v-for="(value, key) in options.gameType"
          :key="key"
          :label="value"
          :value="Number(key)"
        >
        </el-option>
      </el-select> -->

      <el-select v-model="listQuery.roomType" placeholder="請選擇" @change="getList">
        <el-option
          v-for="(value, key) in options.roomType"
          :key="key"
          :label="value"
          :value="Number(key)"
        >
        </el-option>
      </el-select>

      <span v-if="listQuery.roomType == 31">
        <el-input
        class="filter-item"
        style="margin-right: 10px; width: 200px"
        v-model="listQuery.guildId"
        placeholder="俱樂部ID"
      />
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="getList()"
        >搜尋</el-button>
      </span> 
    </div>

    <el-table
      empty-text="目前沒有資料"
      :data="tableData"
      border
      fit
      :header-cell-style="{ 'background-color': '#F2F6FC' }"
      stripe
      current-row-key="Id"
    >
      <el-table-column label="Id" prop="Id" key="Id" align="center" />
      <el-table-column v-if="listQuery.roomType == 31" label="桌次" prop="TableId" key="TableId" align="center" />
      <el-table-column label="房號" prop="RoomId" key="RoomId" align="center">
        <template slot-scope="{ row }">
          <span v-if="row.RoomId">{{ row.RoomId }}</span>
          <span v-else> - </span>
        </template>
      </el-table-column>
      <el-table-column label="遊戲設定" key="Setting" min-width="250px" align="center">
        <template slot-scope="{ row }">
          <span class="tableContent">人數 {{ row.R8 }} / 單一投注項限紅 {{ row.R6 }} / 最低排莊限紅 {{ row.R7 }} / 最低押注金額 {{ row.PlayMinGold }} <br />
          {{ row.R9 ? `${row.R9}局未下注踢飛 /` : "" }} {{ row.R10 ? `最低開牌注額 ${row.R10} /` : "" }} 押注 {{ row.R1 }} / {{ row.R2 }} / {{ row.R3 }} / {{ row.R4 }} / {{ row.R5 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="開房狀態" key="State" align="center">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.openState"
            @change="row.showOpenOption = true; rowActive = row;"
            active-text="開"
            inactive-text="關"
            :active-value="1"
            :inactive-value="0"
            :active-color="'#409EFF'"
            :inactive-color="'#F56C6C'"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :visible.sync="rowActive.showOpenOption"
      title="確認"
      width="250px"
      :show-close="false"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div style="text-align: center">
        確定
        <span :style="rowActive.openState ? 'color: #409EFF' : 'color: #F56C6C'">{{ rowActive.openState ? "開啟" : "關閉" }}</span>
        <span v-if="listQuery.roomType == 31">桌次{{ rowActive.TableId }} ({{ listQuery.guildId }})</span>
        <span v-else>{{ rowActive.openState ? rowActive.Id : rowActive.RoomId }}</span>
        ？
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          @click="rowActive.showOpenOption = false; getList();"
          >取消</el-button>
        <el-button type="primary" @click="openTable">確定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getGuildTable, openGuildTable } from "@/api/bot";

export default {
  name: "createRoom",
  data() {
    return {
      loading: false,
      listQuery: {
        gameType: 7,
        roomType: 1,
        guildId: "",
        tableId: "",
        asset: ""
      },
      tableData: [],
      rowActive: { openState: false },
      options: { 
        gameType: {
          7: "百家樂",
          // 9: "推筒子"
        },
        roomType: {
          1: "公開廳",
          31: "俱樂部廳"
        }
      }
    };
  },
  computed: {
    loadingText() {
      const operate = this.rowActive.openState ? "開房" : "關房";
      return `${operate}中，請稍候`;
    },
  },
  mounted() {
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
    };
    this.getList();
  },
  methods: {
    getList() {
      this.tableData = [];
      if (this.listQuery.roomType == 31 && this.listQuery.guildId.length == 0)
        return false;
      this.loading = true;

      getGuildTable({
        gameType: this.listQuery.gameType,
        roomType: this.listQuery.roomType,
        guildId: this.listQuery.roomType == 31 ? this.listQuery.guildId : 0,
      }).then((response) => {
        if (response.data.list.length == 0) {
          this.$message({
            message: "查無資料",
            type: "error",
          });
        } else {
          this.tableData = response.data.list;
          this.tableData.forEach((table) => {
            this.$set(table, "openState", table.CreateState);
            this.$set(table, "showOpenOption", false);
          });
        }
        this.loading = false;
      }).catch(() => (this.loading = false));
    },
    openTable() {
      this.rowActive.showOpenOption = false;
      this.loading = true;

      openGuildTable({
        gameType: this.listQuery.gameType,
        roomType: this.listQuery.roomType,
        guildId:
          this.listQuery.roomType == 31 ? Number(this.listQuery.guildId) : 0,
        tableId: this.listQuery.roomType == 31 ? Number(this.rowActive.Id) : 0,
        packageId:
          this.listQuery.roomType == 31 ? 0 : Number(this.rowActive.Id),
        state: Number(this.rowActive.openState),
      }).then(async (response) => {
        const operate = this.rowActive.openState ? "開房" : "關房";
        const color = this.rowActive.openState ? "#409EFF" : "#F56C6C";

        if (response.statusCode == 20000) {
          const delay = (n) => new Promise((r) => setTimeout(r, n * 1000));
          if (!this.rowActive.openState) await delay(13);
          this.$message({
            dangerouslyUseHTMLString: true,
            message: `<span style="color: ${color}">${operate}</span>成功`,
            type: "success",
          });
        } else {
          this.$message({
            dangerouslyUseHTMLString: true,
            message: `<span style="color: ${color}">${operate}</span>失敗`,
            type: "error",
          });
        }
        this.getList();
      }).catch((error) => {
        const messageText = error.response.data.message;
        this.$message({
          message: messageText,
          type: "error",
        });
        this.getList();
      });
    },
  },
};
</script>
<style lang="sass">
.createRoom
  .el-select
    width: 110px
    & .el-input__inner
      padding-left: 5px
      text-align: center
  .el-switch__label--left.is-active
    color: #F56C6C
</style>