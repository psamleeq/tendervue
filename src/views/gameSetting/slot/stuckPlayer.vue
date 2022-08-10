<template>
  <div class="app-container slotStuck" v-loading="loading">
    <h2>返還餘額</h2>
    <div class="filter-container">
      <el-select v-model="listQuery.type" placeholder="請選擇" @change="getList">
        <el-option label="全部" :value="-1" />
        <el-option label="公開廳" :value="1" />
        <el-option label="俱樂部" :value="2" />
      </el-select>

      <span v-if="listQuery.type == 2">
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

      <el-button
        type="success"
        icon="el-icon-plus"
        style="float: right;"
        @click="openConfirmDialog"
        >返還餘額</el-button>
    </div>

    <el-table
      empty-text="目前沒有資料"
      :data="list"
      border
      fit
      :header-cell-style="{ 'background-color': '#F2F6FC' }"
      stripe
      current-row-key="id"
      @selection-change="handleCheckedChange"
    >
      <el-table-column type="selection" min-width="55px" align="center" />
      <el-table-column label="UserId" prop="member_id" align="center" />
      <el-table-column label="俱樂部" prop="nickname" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.nickname == 0 ? "公開廳" : row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="狀態" align="center">
        <template slot-scope="{ row }">
          <span :style="row.blockade == 0 ? 'color: #409EFF' : 'color: #F56C6C'">{{ row.blockade == 0 ? '開' : '關' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="`建立時間\n(更新時間)`" align="center">
        <template slot-scope="{ row }">
          <span>{{ formatTime(row.created_at) }}</span>
          <br>
          <span>({{ formatTime(row.updated_at) }})</span>
        </template>
      </el-table-column>
      <el-table-column label="餘額" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.balance.toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最後一局" align="center">
        <template slot-scope="{ row }">
          <el-button type="primary" @click="histQuery.pageCurrent = 1; rowActive = row; getDetail()">詳情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :visible.sync="dialogTableVisible"
      width="700px"
    >
      <template slot="title">
        <span class="dialog-title">{{ rowActive.member_id }} ({{ rowActive.nickname == 0 ? "公開廳" : `俱樂部 ${rowActive.nickname}` }})</span>
      </template>

      <el-table
        v-loading="loading"
        empty-text="目前沒有資料"
        :data="gridData"
        fit
        :header-cell-style="{ 'background-color': '#F2F6FC' }"
      >
        <el-table-column type="index" :index="reverseIndex" width="80px" align="center"/>
        <el-table-column label="UserId" prop="member_id" align="center" />
        <el-table-column :label="`建立時間\n(更新時間)`" width="100px" align="center">
          <template slot-scope="{ row }">
            <span>{{ formatTime(row.created_at) }}</span>
            <br>
            <span>({{ formatTime(row.updated_at) }})</span>
          </template>
        </el-table-column>
        <el-table-column label="注額" prop="bet" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.bet.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="贏分" prop="win" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.win.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="餘額" prop="balance" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.balance.toLocaleString() }}</span>
          </template>
        </el-table-column>
      </el-table>

      <template slot="footer">
        <pagination :total="histTotal" :pageCurrent.sync="histQuery.pageCurrent" :pageSize.sync="histQuery.pageSize" @pagination="getDetail" />
      </template>
    </el-dialog>

    <el-dialog
      :visible.sync="showReturnConfirm"
      title="確認"
      width="250px"
      :show-close="false"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div style="text-align: center">
        確定將<span>{{ userIdsStr }}</span>的餘額返回？
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showReturnConfirm = false; getList();">取消</el-button>
        <el-button type="primary" @click="returnBal">確定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getStuckPlayer, getBetLastLog, returnSlotBal } from "@/api/game";
import moment from "moment";
import Pagination from '@/components/Pagination';

export default {
  name: "SlotStuck",
  components: { Pagination },
  data() {
    return {
      loading: false,
      dialogTableVisible: false,
      showReturnConfirm: false,
      listQuery: {
        type: -1,
        guildId: ""
      },
      histQuery: {
        playerId: 0,
        pageCurrent: 1,
        pageSize: 20,
      },
      histTotal: 0,
      list: [],
      gridData: [],
      rowActive: {},
      checkedList: [],
      userIdsStr: ""
    };
  },
  mounted() {
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
    };
    this.getList();
  },
  methods: {
    handleCheckedChange(val) {
      this.checkedList = val.map(v => {
        const obj = { userId: Number(v.member_id), guildId: Number(v.nickname) };
        return obj
      });
      this.userIdsStr = val.map(v => `${v.member_id}(${v.nickname == 0 ? '公開廳' : v.nickname})`).join(", ");
    },
    getList() {
      this.list = [];
      if (this.listQuery.type == 2 && this.listQuery.guildId.length == 0)
        return false;
      
      getStuckPlayer({
        guildId: this.listQuery.type == -1 ? -1 : this.listQuery.type == 1 ? 0 : this.listQuery.guildId
      }).then((response) => {
        if (response.data.length == 0) {
          this.$message({
            message: "查無資料",
            type: "error",
          });
        } else {
          this.list = response.data;
        }
        this.loading = false;
      }).catch(() => (this.loading = false));
    },
    getDetail() {
      this.loading = true;
      this.dialogTableVisible = true;
      this.gridData = [];
      this.histQuery.playerId = this.rowActive.id;
      getBetLastLog(this.histQuery).then((response) => {
        if (response.data.length == 0) {
          this.$message({
            message: "查無資料",
            type: "error",
          });
        } else {
          this.gridData = response.data.gameBetLog;
          this.histTotal = response.data.total;
        }
        this.loading = false;
      }).catch(() => (this.loading = false));
    },
    openConfirmDialog() {
      if(this.checkedList.length == 0) {
        this.$message({
          message: "請選擇玩家",
          type: "error",
        });
      } else this.showReturnConfirm = true;
    },
    returnBal() {
      this.showReturnConfirm = false;

      returnSlotBal({
        uidInfo: this.checkedList,
      }).then(async (response) => {
        if (response.statusCode == 20000) {
          this.$message({
            message: `返還成功`,
            type: "success",
          });
        } else {
          this.$message({
            message: `返還失敗`,
            type: "error",
          });
        }
        this.getList();
      }).catch((error) => {
        let message = JSON.parse(error.response.data.message);
        console.log(message);

        let messageText = "";
        switch (message.type) {
          case "Login Fail":
            // messageText = `Photon認證錯誤: ${message.errMsg} (${message.errCode})`;
            messageText = `Photon認證錯誤 (${message.errCode})`;
            break;
          case "Request Fail":
            messageText = `返還失敗: ${message.errMsg} (${message.errCode})`;
            break;
        }
        this.$message({
          message: messageText,
          type: "error",
        });
        this.getList();
      });
    },
    reverseIndex(index) {
      return this.histTotal - (this.histQuery.pageCurrent - 1) * this.histQuery.pageSize - index
    },
    formatTime(time) {
      return moment(time).utc().format("YYYY-MM-DD HH:mm:ss");
    },
  },
};
</script>
<style lang="sass">
// *
//   border: 1px solid #000
.slotStuck
  .el-table
    .cell
      white-space: pre-line

  .el-dialog
    .dialog-title
      font-size: 24px
      font-weight: bold
      color: #555
    .pagination-container
      margin: 0px auto
    .el-pagination.is-background
      float: none !important
</style>