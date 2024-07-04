<template>
  <div style="height: 100vh">
    <iframe width="100%" height="100%" :src="pdfContent" />
  </div>
</template>

<script>
import moment from "moment";
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);
import { getInformRoadPDF } from "@/api/dispatch";

export default {
	name: "informRoadPDF",
	components: { },
	props: {
    ApplyId: {
      type: Number,
      required: true
    },
    GroupId: {
      type: Number,
      required: true
    },
	},
	data() {
		return {
      groupName: '', // 契約名稱
      groupSN: '', // 契約編號
      total: 0, // 共幾筆 p47

      // p47 道路預約式契約維護修繕工程
			pdfContent: '',
      caseNo: [], // 道管系統案號
      dateCreate: [], // 查報日期
      dateDeadline: [], // 預定完工日期
      place: [], // 地點
      distressName: [], // 損壞類別
      millingArea: [], // 面積m2

      // p45 臺北市政府工務局新建工程處養護工程隊開口合約施工通知 / 回報單
      // p46 臺北市政府工務局新建工程處
      unitSN: [], // 項次
      taskName: [], // 主要項目
      taskUnit: [], // 單位
      taskNumber: [], // 數量
      taskPrice: [], // 設計預估金額
      
      // p48 道路預約式契約維護修繕工程 設計修繕設施路段表
      designDetail: [], // 施作數量
      designDesc: [], // 施工方式
      designWorker: [], // 施作人力
		}
	},
  watch: {
    ApplyId() {
      this.getList();
    }
  },
	computed: {	},
  created() {
    this.initFont();
  },
	methods: {
    initFont() {
      // Load font
      const readBlob = (blob) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      };

      fetch('/assets/font/edukai-4.0.ttf')
        .then(res => res.blob())
        .then(async(blob) => {
          const fontDataUri = await readBlob(blob);
          const fontBase64String = fontDataUri.substr(fontDataUri.indexOf('base64,') + 7);

          // Initialize jsPDF with custom font
          this.pdfDoc = new jsPDF();
          this.pdfDoc.addFileToVFS("edukai.ttf", fontBase64String);
          this.pdfDoc.addFont("edukai.ttf", "edukai", "normal");
          this.pdfDoc.setFont("edukai");

          // this.getList();
        });
    },
    createPDF() {
      return new Promise((resolve, reject) => {
        this.pdfDoc.addPage();
        while(this.pdfDoc.internal.getNumberOfPages() > 1) this.pdfDoc.deletePage(1);
        
        const { width, height } = this.pdfDoc.internal.pageSize;

        // p47 道路預約式契約維護修繕工程
        this.pdfDoc.setFontSize(12);
        this.pdfDoc.text(`${this.groupName}`, width/2, height-280, { align: 'center' });
        this.pdfDoc.text(`聖東營造申請維修道路路段表(第  次)`, width/2, height-270, { align: 'center' });

        this.pdfDoc.setFontSize(10);
        this.pdfDoc.text(`工程地點：(聖東-設施) ${this.place[0]}`, width -196, height-260);
        this.pdfDoc.text(`等${this.total}處(設施)`, width -196, height-255);
        this.pdfDoc.text(`頁次1/1`, width -27, height-255);

        const table1 = [
          ['項次', '道管系統案號', '查報日期', '預定完工日期', '地點', '損壞類別', '面積m2'],
        ];

        for (let i = 0; i < this.caseNo.length; i++) {
          table1.push([i + 1, this.caseNo[i], this.dateCreate[i], this.dateDeadline[i], this.place[i], this.distressName[i], this.millingArea[i]]);
        }
        
        this.pdfDoc.autoTable({
          theme: 'plain',
          styles: { font: "edukai", fontSize: 8, lineWidth: 0.1, lineColor: 10 },
          body: table1,
          startY: height - 252,
          columnStyles: {
            0: { halign: 'center', valign: 'middle' },
            1: { halign: 'center', valign: 'middle' },
            2: { halign: 'center', valign: 'middle' },
            3: { halign: 'center', valign: 'middle' },
            4: { halign: 'center', valign: 'middle' },
            5: { halign: 'center', valign: 'middle' },
            6: { halign: 'center', valign: 'middle' },
          },
        });

        this.pdfDoc.text(`廠商`, width -140, height -30);
        this.pdfDoc.text(`監造`, width -80, height -30);

        this.pdfDoc.addPage();

        // p45 臺北市政府工務局新建工程處養護工程隊開口合約施工通知/回報單
        this.pdfDoc.setFontSize(12);
        this.pdfDoc.text(`臺北市政府工務局新建工程處養護工程隊開口合約施工通知/回報單`, width/2, height-280, { align: 'center' });

        this.pdfDoc.setFontSize(10);
        this.pdfDoc.text(`工程名稱：${this.groupName}`, width -196, height-270);
        this.pdfDoc.text(`契約編號：${this.groupSN || ''}`, width -196, height-265);
        this.pdfDoc.text(`第  次`, width -25, height-265);

        const table2 = [
          ['施工地點', { content: `(聖東-設施) ${this.place[0]}`, colSpan: 3 } ],
          ['現場換勘日期', '', '實際會勘日期', ''],
          ['預定開工日期', '', '實際完工日期', ''],
          ['工  期', '', '工  期', ''],
          ['預定完工日期', `${this.dateDeadline[0]}`, '逾期天數', ''],
          [ { content: '設  計  數  量', colSpan: 2 }, { content: '完  成  數  量', colSpan: 2 } ],
        ];

        this.pdfDoc.autoTable({
          theme: 'plain',
          styles: { font: "edukai", fontSize: 8, lineWidth: 0.1, lineColor: 10, cellPadding: 0.1 },
          body: table2,
          startY: height - 263,
          columnStyles: {
            0: { cellWidth: 30, halign: 'center', valign: 'middle' },
            1: { cellWidth: 61, halign: 'center', valign: 'middle' },
            2: { cellWidth: 30, halign: 'center', valign: 'middle' },
            3: { cellWidth: 61, halign: 'center', valign: 'middle' },
          },
          didDrawPage: (data) => {
            this.lastTable2EndPos = data.cursor.y; // 抓table2的位置
          }
        });

        const table3 = [
          ['項次', { content: '主  要  項  目', styles: { halign: 'center' } }, '單位', '數量', '項次', { content: '主  要  項  目', styles: { halign: 'center' } }, '單位', '數量'],
          ['壹', '道路改善工程費', '式', '', '壹', '道路改善工程費', '式', '']
        ];

        const mainProjects = [
          { item: '一', expense: '道路維護工程費' },
          { item: '二', expense: '道路附屬設施工程費' },
          { item: '三', expense: '人手孔改善工程費' },
          { item: '四', expense: '安全設施及交通維持費' },
          { item: '五', expense: '雜項工程費' },
          { item: '六', expense: '材料試驗費' },
          { item: '七', expense: '職業安全衛生管理費(壹一~壹五)*2.9%' }
        ];

        // 設計預估金額
        let estimatedTotal = 0;
        // 根據上面對應的mainProjects去分別塞資料 (省好幾行code)
        const appendTasks = (mainProjects, unitSN, taskName, taskUnit, taskNumber, taskPrice) => {
          mainProjects.forEach((project, index) => {
            table3.push([project.item, project.expense, '式', '', project.item, project.expense, '式', '']);
            
            unitSN.forEach((sn, i) => {
              if (sn.charAt(0) == (index + 1).toString()) {
                estimatedTotal += taskNumber[i] * taskPrice[i]; // 設計預估金額
                table3.push([sn, taskName[i], taskUnit[i], taskNumber[i], sn, taskName[i], taskUnit[i], '']);
              }
            });
            table3.push(['', '', '', '', '', '', '']);
          });
        };

        appendTasks(mainProjects, this.unitSN, this.taskName, this.taskUnit, this.taskNumber, this.taskPrice);
        

        // 原本分類法 太多重複性
        // if (this.taskName.length != 0) {
        //   for (let i = 0; i < this.taskName.length; i++) {
        //     if (this.unitSN[i].charAt(0) == 1) {
        //       table3.push([this.unitSN[i], this.taskName[i], this.taskUnit[i], this.taskNumber[i], this.unitSN[i], this.taskName[i], this.taskUnit[i], '']);
        //     }
        //   }
        // }

        // table3.push(['一', '道路維護工程費', '式', '', '一', '道路維護工程費', '式', '']);
        // table3.push(['二', '道路附屬設施工程費', '式', '', '二', '道路附屬設施工程費', '式', '']);
        // table3.push(['三', '人手孔改善工程費', '式', '', '三', '人手孔改善工程費', '式', '']);
        // table3.push(['四', '安全設施及交通維持費', '式', '', '四', '安全設施及交通維持費', '式', '']);
        // table3.push(['五', '雜項工程費', '式', '', '五', '雜項工程費', '式', '']);
        // table3.push(['六', '材料試驗費', '式', '', '六', '材料試驗費', '式', '']);
        // table3.push(['七', '職業安全衛生管理費(壹一~壹五)*2.9%', '式', '', '七', '職業安全衛生管理費(壹一~壹五)*2.9%', '式', '']);
        table3.push(
          ['(一)', '職業安全人員費用(壹一~壹五)*2.9%', '式', '', '(一)', '職業安全人員費用(壹一~壹五)*2.9%', '式', ''],
          ['(二)', '職業安全衛生費用\n(飲水及休息設備)(壹一~一五)*1%', '式', '', '(二)', '職業安全衛生費用\n(飲水及休息設備)(壹一~一五)*1%', '式', ''],
          ['八', '自主品管費(壹一~壹五)*1.1%', '式', '', '八', '自主品管費(壹一~壹五)*1.1%', '式', ''],
          ['九', '道路巡查費', '式', '', '九', '道路巡查費', '式', ''],
          ['一０', '材料代購費', '式', '', '一０', '材料代購費', '式', ''],
          ['一一', '稅什費(壹一~壹十)*11.13%', '式', '', '一一', '稅什費(壹一~壹十)*11.13%', '式', ''],
          ['一二', '義交', '式', '', '一二', '義交', '式', ''],
          ['一三', '戶外型雲端管理型攝(錄)影', '式', '', '一三', '戶外型雲端管理型攝(錄)影', '式', ''],
          [ { content: '(詳後附之詳細表)', colSpan: 4 }, { content: '(詳後附之詳細表)', colSpan: 4 } ],
        );

        this.pdfDoc.autoTable({
          theme: 'plain',
          styles: { font: "edukai", fontSize: 8, lineWidth: 0.1, lineColor: 10, cellPadding: 0.1 },
          body: table3,
          startY: this.lastTable2EndPos,
          columnStyles: {
            0: { cellWidth: 12, halign: 'center', valign: 'middle' },
            1: { cellWidth: 58, valign: 'middle' },
            2: { cellWidth: 8, halign: 'center', valign: 'middle' },
            3: { cellWidth: 13, halign: 'center', valign: 'middle' },
            4: { cellWidth: 12, halign: 'center', valign: 'middle' },
            5: { cellWidth: 58, valign: 'middle' },
            6: { cellWidth: 8, halign: 'center', valign: 'middle' },
            7: { cellWidth: 13, halign: 'center', valign: 'middle' },
          },
          didDrawPage: (data) => {
            this.lastTable3EndPos = data.cursor.y; // 抓table3的位置
          }
        });

        const table4 = [
          ['設計預估金額', { content: `${estimatedTotal}`, styles: { halign: 'center' } }, '實際金額', ''],
          [ { content: '設計概述：', colSpan: 2 }, { content: '施工概述：', colSpan: 2 } ],
          [ { content: '設計概述：\n1.本工程主要項目數量：\n\n\n\n\n2.本數量為概括數量，結算時以實際施作數量為主。\n3.安全設施及交通維持費及雜項工程費，均以實作數量結算。', colSpan: 2 }, { content: '施工概述：\n1.本工程主要項目數量：\n\n\n2.本數量為概括數量，結算時以實際施工數量為主。\n\n\n', colSpan: 2 } ],
          [ { content: '監造單位\n\n\n\n\n\n', colSpan: 2 }, { content: '監造單位\n\n\n\n\n\n', colSpan: 2 } ],
        ];

        this.pdfDoc.autoTable({
          theme: 'plain',
          styles: { font: "edukai", fontSize: 8, lineWidth: 0.1, lineColor: 10, cellPadding: 0.1 },
          body: table4,
          startY: this.lastTable3EndPos,
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 61 },
            2: { cellWidth: 30 },
            3: { cellWidth: 61 },
          },
        });

        this.pdfDoc.addPage();

        // 臺北市政府工務局新建工程處 詳細表(統計)
        this.pdfDoc.setFontSize(12);
        this.pdfDoc.text(`臺北市政府工務局新建工程處`, width/2, height-280, { align: 'center' });
        this.pdfDoc.setFontSize(10);
        this.pdfDoc.text(`詳細表 (設計)`, width/2, height-276, { align: 'center' });
        
        this.pdfDoc.text(`工程名稱：${this.groupName}`, width -196, height-270);
        this.pdfDoc.text(`施工地點：${this.place[0]}`, width -196, height-265);
        this.pdfDoc.text(`第  次`, width -25, height-265);

        const table5 = [
          ['項次', '工程項目', '單位', '數量', '單價', '複價', '備註'],
          ['壹', '道路改善工程費', '式', '', '', '', ''],
        ];
        
        // 根據上面對應的mainProjects去分別塞資料 (省好幾行code)
        const appendTasks2 = (mainProjects, unitSN, taskName, taskUnit, taskNumber, taskPrice) => {
          mainProjects.forEach((project, index) => {
            table5.push([project.item, project.expense, '式', '', '', '', '']);
            
            let taskAmount = 0; // 複價小計
            unitSN.forEach((sn, i) => {
              if (sn.charAt(0) == (index + 1).toString()) {
                const total = taskNumber[i] * taskPrice[i]; // 複價
                taskAmount += total; // 複價小計的計算
                table5.push([sn, taskName[i], taskUnit[i], taskNumber[i], taskPrice[i], total, '']);
              }
            });
            table5.push(['', '', '', '', { content: '小計', styles: { fontStyle: 'bold' } }, `${taskAmount || ''}`, '']);
            table5.push(['', '', '', '', '', '', '']);
          });
        };

        appendTasks2(mainProjects, this.unitSN, this.taskName, this.taskUnit, this.taskNumber, this.taskPrice);

        table5.push(
          ['(一)', '職業安全人員費用(壹一~壹五)*1%', '式', '', '', '', ''],
          ['(二)', '職業安全衛生費用(飲水及休息設備)(壹一~壹五)*1.9%', '式', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['八', '自主品管費(壹一~壹五)*1.1%', '式', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['九', '道路巡查費', '式', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['一Ｏ', '材料代購費', '式', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['一一', '稅什費(壹一~壹十)*11.13%', '式', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['一二', '義交', '式', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['一三', '戶外型雲端管理型攝(錄)影', '式', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['', '', '', '', '', '', ''],
          ['陸', '總價(總計)', '式', '', '', estimatedTotal, '']
        );

        this.pdfDoc.autoTable({
          theme: 'plain',
          styles: { font: "edukai", fontSize: 8, lineWidth: 0.1, lineColor: 10, cellPadding: 0.1 },
          body: table5,
          startY: height - 263,
          columnStyles: {
            0: { cellWidth: 10, halign: 'center', valign: 'middle' },
            1: { cellWidth: 80, halign: 'center', valign: 'middle' },
            2: { cellWidth: 10, halign: 'center', valign: 'middle' },
            3: { cellWidth: 15, halign: 'center', valign: 'middle' },
            4: { cellWidth: 15, halign: 'center', valign: 'middle' },
            5: { cellWidth: 20, halign: 'center', valign: 'middle' },
            6: { cellWidth: 32, halign: 'center', valign: 'middle' },
          },
          didDrawPage: (data) => {
            this.lastTable5EndPos = data.cursor.y; // 抓table5的位置
          }
        });

        this.pdfDoc.text(`監造`, width -196, this.lastTable5EndPos + 10);

        this.pdfDoc.addPage();
        // page48
        // 112年度道路預約式契約維護修繕工程第2標 設計修繕路段表
        let page = 1; // 頁次初始化

        for (let i = 0; i < this.place.length; i++) {
          // 如果当前索引是偶数，添加页眉和第一页的表格
          if (i % 2 == 0) {
            this.pdfDoc.setFontSize(12);
            this.pdfDoc.text(`${this.groupName}`, width / 2, height - 280, { align: 'center' });
            this.pdfDoc.text(`設計修繕設施路段表`, width / 2, height - 274, { align: 'center' });
            this.pdfDoc.setFontSize(8);
            this.pdfDoc.text(`工程地點：${this.place[i]}`, width - 196, height - 265);
            this.pdfDoc.text(`${page}/5頁次`, width - 25, height - 265);

            const table6_1 = [
              ['', { content: `施工地點：${this.place[i]}`, colSpan: 5 }],
              ['項次', '施  工  項  目', '單位', '數量', '單價', '複價']
            ];

            let estimatedAmount1 = 0; // 金額預估
            for (let j = 0; j < this.unitSN.length; j++) {
              const total = this.taskNumber[j] * this.taskPrice[j]; // 複價
              table6_1.push([this.unitSN[j], this.taskName[j], this.taskUnit[j], this.taskNumber[j], this.taskPrice[j], total]);
              estimatedAmount1 += total; // 金額預估計算
            }

            table6_1.push(['', '金額預估', '', '', '', estimatedAmount1]);

            const table7_1 = [
              ['(一)施作數量：', this.designDetail[i]],
              ['(二)施工方式：', this.designDesc[i]],
              ['(三)施作人力：', this.designWorker[i]]
            ];

            this.pdfDoc.autoTable({
              theme: 'plain',
              styles: { font: "edukai", fontSize: 8, lineWidth: 0.1, lineColor: 10 },
              body: table6_1,
              startY: height - 263,
              columnStyles: {
                0: { cellWidth: 15, halign: 'center', valign: 'middle' },
                1: { cellWidth: 82, halign: 'center', valign: 'middle' },
                2: { cellWidth: 15, halign: 'center', valign: 'middle' },
                3: { cellWidth: 20, halign: 'center', valign: 'middle' },
                4: { cellWidth: 20, halign: 'center', valign: 'middle' },
                5: { cellWidth: 30, halign: 'center', valign: 'middle' },
              },
              didDrawPage: (data) => {
                this.lastTable6EndPos = data.cursor.y; // 抓table6的位置
              }
            });

            this.pdfDoc.autoTable({
              theme: 'plain',
              styles: { font: "edukai", fontSize: 8, lineWidth: 0.1, lineColor: 10 },
              body: table7_1,
              startY: this.lastTable6EndPos + 5,
              columnStyles: {
                0: { cellWidth: 30, halign: 'center', valign: 'middle' },
                1: { cellWidth: 152, halign: 'center', valign: 'middle' },
              },
            });

            // 如果还有下一项，将其也添加到同一页
            if (i + 1 < this.place.length) {
              const table6_2 = [
                ['', { content: `施工地點：${this.place[i + 1]}`, colSpan: 5 }],
                ['項次', '施  工  項  目', '單位', '數量', '單價', '複價']
              ];

              let estimatedAmount2 = 0; // 金額預估
              for (let j = 0; j < this.unitSN.length; j++) {
                const total = this.taskNumber[j] * this.taskPrice[j]; // 複價
                table6_2.push([this.unitSN[j], this.taskName[j], this.taskUnit[j], this.taskNumber[j], this.taskPrice[j], total]);
                estimatedAmount2 += total; // 金額預估計算
              }

              table6_2.push(['', '金額預估', '', '', '', estimatedAmount2]);

              const table7_2 = [
                ['(一)施作數量：', this.designDetail[i + 1]],
                ['(二)施工方式：', this.designDesc[i + 1]],
                ['(三)施作人力：', this.designWorker[i + 1]]
              ];

              this.pdfDoc.autoTable({
                theme: 'plain',
                styles: { font: "edukai", fontSize: 8, lineWidth: 0.1, lineColor: 10 },
                body: table6_2,
                startY: this.lastTable6EndPos + 40,
                columnStyles: {
                  0: { cellWidth: 15, halign: 'center', valign: 'middle' },
                  1: { cellWidth: 82, halign: 'center', valign: 'middle' },
                  2: { cellWidth: 15, halign: 'center', valign: 'middle' },
                  3: { cellWidth: 20, halign: 'center', valign: 'middle' },
                  4: { cellWidth: 20, halign: 'center', valign: 'middle' },
                  5: { cellWidth: 30, halign: 'center', valign: 'middle' },
                },
                didDrawPage: (data) => {
                  this.lastTable6EndPos = data.cursor.y; // 抓table6的位置
                }
              });

              this.pdfDoc.autoTable({
                theme: 'plain',
                styles: { font: "edukai", fontSize: 8, lineWidth: 0.1, lineColor: 10 },
                body: table7_2,
                startY: this.lastTable6EndPos + 5,
                columnStyles: {
                  0: { cellWidth: 30, halign: 'center', valign: 'middle' },
                  1: { cellWidth: 152, halign: 'center', valign: 'middle' },
                },
              });

              i++; // 跳过已经处理的下一个 place
            }

            if (i < this.place.length - 1) {
              this.pdfDoc.addPage();
              page++;
            }
          }
        }

        
        
        resolve();
      });
    },
    async getList() {
      this.caseNo = [];
      this.dateCreate = [];
      this.dateDeadline = [];
      this.place = [];
      this.distressName = [];
      this.millingArea = [];
      this.unitSN = [];
      this.taskName = [];
      this.taskUnit = [];
      this.taskNumber = [];
      this.taskPrice = [];
      // Fetch PDF data from API
      await getInformRoadPDF({ id: this.ApplyId, GroupId: this.GroupId }).then(response => {
        console.log('informRoad data', response.data);

        this.groupName = response.data.list[0].groupName;
        this.groupSN = response.data.list[0].groupSN;
        this.total = response.data.res_count[0].total;

        if (response.data.res != undefined) {
          response.data.res.forEach(item => {
            this.caseNo.push(item.CaseNo);
            this.dateCreate.push(moment(item.DateCreate).subtract(1911, 'years').format('YYYY-MM-DD').replace(/^0+/, ''));
            this.dateDeadline.push(moment(item.DateDeadline).subtract(1911, 'years').format('YYYY-MM-DD').replace(/^0+/, ''));
            this.place.push(item.Place);
            this.distressName.push(item.DistressName);
            this.millingArea.push(Math.round(item.MillingArea * 100) / 100);
          });
        }
        
        if (response.data.res2 != undefined) {
          response.data.res2.forEach(item => {
            this.unitSN.push(item.UnitSN);
            this.taskName.push(item.TaskName);
            this.taskUnit.push(item.TaskUnit);
            this.taskNumber.push(parseFloat(item.TaskNumber));
            this.taskPrice.push(parseFloat(item.TaskPrice));
            this.designDesc.push(item.DesignDesc); // 施工方式
            this.designDetail.push(item.DesignDetail); // 施作數量
            this.designWorker.push(item.DesignWorker); // 施作人力
          });
        }

        // Create PDF content
        this.createPDF().then(() => {
          // Render the content of this.pdfDoc into the component
          this.pdfContent = this.pdfDoc.output('datauristring');

          // this.pdfDoc.save(`路勘.pdf`);
          console.log('PDF content rendered!');
        });

      }).catch(error => {
        console.error('Error getting PDF data:', error);
      });
    }
  }
}
</script>

