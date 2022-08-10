<template>
  <div class="app-container slotPlatform" v-loading="loading">
    <h2>新增俱樂部</h2>
    <div class="filter-container" style="height: 50px">
      <el-button
        type="success"
        icon="el-icon-plus"
        style="float: right;"
        @click="showAddPlatform = true"
        >新增俱樂部</el-button>
    </div>

    <el-table
      empty-text="目前沒有資料"
      :data="list"
      border
      fit
      :header-cell-style="{ 'background-color': '#F2F6FC' }"
      stripe
      current-row-key="id"
    >
      <el-table-column label="Id" prop="id" align="center" />
      <el-table-column label="俱樂部" prop="nickname" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.nickname == 0 ? "公開廳" : row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="狀態" align="center">
        <template slot-scope="{ row }">
          <el-switch
            v-model="row.blockade"
            @change="row.showOpenOption = true; rowActive = row;"
            active-text="開"
            inactive-text="關"
            :active-value="0"
            :inactive-value="2"
            :active-color="'#409EFF'"
            :inactive-color="'#F56C6C'"
          />
        </template>
      </el-table-column>
      <el-table-column :label="`建立時間\n(更新時間)`" align="center">
        <template slot-scope="{ row }">
          <span>{{ formatTime(row.created_at) }}</span>
          <br>
          <span>({{ formatTime(row.updated_at) }})</span>
        </template>
      </el-table-column>
      <el-table-column label="幣別" prop="code" align="center" />
    </el-table>

    <el-dialog
      title="新增俱樂部"
      width="300px"
      :visible.sync="showAddPlatform"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      center
    >
      <div class="filter-container">
        <el-form :model="form" label-width="60px">
          <el-form-item label="俱樂部" prop="guildId">
            <el-input
              class="filter-item"
              v-model="form.guildId"
              placeholder="俱樂部Id"
            />
          </el-form-item>
          <el-form-item label="幣別" prop="role">
            <el-select class="filter-item" v-model="form.curType" placeholder="請選擇">
              <el-option
                v-for="(text, cur) in curType"
                :key="cur"
                :label="text"
                :value="Number(cur)">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddPlatform = false">取消</el-button>
        <el-button type="primary" @click="addPlatform">確定</el-button>
      </span>
    </el-dialog>

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
        <span :style="rowActive.blockade == 0 ? 'color: #409EFF' : 'color: #F56C6C'">{{ rowActive.blockade == 0 ? "開啟" : "關閉" }}</span>
        <span>{{ rowActive.nickname == 0 ? "公開廳" : `俱樂部${rowActive.nickname}` }} 老虎機</span>
        ？
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rowActive.showOpenOption = false; getList();">取消</el-button>
        <el-button type="primary" @click="changeState">確定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getSlotPlatform, addSlotPlatform, changeSlotPlatform } from "@/api/game";
import moment from "moment";

export default {
  name: "slotPlatform",
  data() {
    return {
      loading: false,
      showAddPlatform: false,
      list: [],
      rowActive: {},
      form: {
        guildId: "",
        curType: 1
      },
      curType: {
        1: "TWD",
        2: "TWD1/100"
      }
    };
  },
  mounted() {
    window.onresize = () => {
      this.screenWidth = window.innerWidth;
    };
    this.getList();
  },
  methods: {
    getList() {
      getSlotPlatform().then((response) => {
        if (response.data.length == 0) {
          this.$message({
            message: "查無資料",
            type: "error",
          });
        } else {
          this.list = response.data;
          this.list.forEach(l => this.$set(table, "showOpenOption", false));
        }
        this.loading = false;
      }).catch(() => (this.loading = false));
    },
    addPlatform() {
      this.showAddPlatform = false;

      addSlotPlatform({
        guildId: Number(this.form.guildId),
        curType: Number(this.form.curType),
      }).then(async (response) => {
        if (response.statusCode == 20000) {
          this.form =  {
            guildId: "",
            curType: 1
          };
          this.$message({
            message: `修改成功`,
            type: "success",
          });
        } else {
          this.$message({
            message: `修改失敗`,
            type: "error",
          });
        }
        this.getList();
      }).catch((error) => {
        let messageText = error.response.data.message;
        if (messageText) {
          switch (messageText) {
            case "Guild is not exist":
              messageText = "該俱樂部不存在";
              break;
            case "Platform already created":
              messageText = "該俱樂部已建立";
              break;
            case "Add platform fail":
              messageText = "建立Platform失敗";
              break;
            case "Add game fail":
              messageText = "建立遊戲列表失敗";
              break;
          }
          this.$message({
            message: messageText,
            type: "error",
          });
        }
        this.getList();
      });
    },
    changeState() {
      this.rowActive.showOpenOption = false;

      changeSlotPlatform(Number(this.rowActive.id), {
        state: Number(this.rowActive.blockade),
      }).then(async (response) => {
        if (response.statusCode == 20000) {
          this.$message({
            message: `修改成功`,
            type: "success",
          });
        } else {
          this.$message({
            message: `修改失敗`,
            type: "error",
          });
        }
        this.getList();
      }).catch((error) => {
        let messageText = error.response.data.message;
        if (messageText) {
          switch (messageText) {
            case "Change platform state fail":
              messageText = "修改Platform狀態失敗";
              break;
          }
          this.$message({
            message: messageText,
            type: "error",
          });
        }
        this.getList();
      });
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
.slotPlatform
  .el-table
    .cell
      white-space: pre-line
    .el-switch__label--left.is-active
      color: #F56C6C
</style>