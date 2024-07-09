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
import { getCompleteRoadPDF } from "@/api/dispatch";

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
      total: 0, // 共幾筆 p16

      // p16 聖東營造完工會勘路段
			pdfContent: '',
      caseNo: [], // 道管系統案號
      dateCreate: [], // 查報日期
      dateDeadline: [], // 預定完工日期
      place: [], // 地點
      distressName: [], // 損壞類別
      imgZoomIn: [], // 近照圖片
      postConstrImg: [], // 施工後照片

      unitSN: [], // 項次
      taskName: [], // 主要項目
      taskUnit: [], // 單位
      taskNumber: [], // 數量
      taskPrice: [], // 設計預估金額
      
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
          ['項次', '道管系統案號', '查報日期', '預定完工日期', '地點', '損壞類別'],
        ];

        for (let i = 0; i < this.caseNo.length; i++) {
          table1.push([i + 1, this.caseNo[i], this.dateCreate[i], this.dateDeadline[i], this.place[i], this.distressName[i]]);
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
        
        // 總頁數
        const totalPages = Math.ceil(this.place.length / 3);
        let imgPage = 1; // 頁次初始化 

        for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
          // 聖東營造修復回報單簡表
          this.pdfDoc.setFontSize(12);
          this.pdfDoc.text(`聖東營造修復回報單簡表`, width / 2, height - 280, { align: 'center' });
          this.pdfDoc.setFontSize(8);
          this.pdfDoc.text(`第${imgPage}頁/共${totalPages}頁`, width - 30, height - 272);

          for (let i = 0; i < 3; i++) {
            const currentIndex = pageIndex * 3 + i;
            if (currentIndex >= this.place.length) break; // 防止超出資料長度

            const table2 = [
              [`項次：${currentIndex + 1}`, `道管編號：${this.caseNo[currentIndex]}`, `損壞類別：${this.distressName[currentIndex]}`, `銑鋪完工：無資料`],
              [{ content: `地點：(聖東-設施)${this.place[currentIndex]}`, colSpan: 3 }, `標線完工：0m`],
            ];

            this.pdfDoc.autoTable({
              theme: 'plain',
              styles: { font: "edukai", fontSize: 8, lineWidth: 0.1, lineColor: 10 },
              body: table2,
              startY: i === 0 ? height - 270 : this.lastTable3EndPos, // 第一筆資料從初始位置開始，後續資料從前一筆資料結束位置開始
              columnStyles: {
                0: { minCellWidth: 15, halign: 'center', valign: 'middle' },
                1: { minCellWidth: 48.5, halign: 'center', valign: 'middle' },
                2: { halign: 'center', valign: 'middle' },
                3: { halign: 'center', valign: 'middle' },
              },
              didDrawPage: (data) => {
                this.lastTable2EndPos = data.cursor.y; // 抓table2的位置
              }
            });

            const table3 = [
              ['缺失地點相片', '修復地點相片'],
              [{ content: '', styles: { minCellHeight: 55 } }, ''] // 空白要加圖片
            ];

            this.pdfDoc.autoTable({
              theme: 'plain',
              styles: { font: "edukai", fontSize: 8, lineWidth: 0.1, lineColor: 10 },
              body: table3,
              startY: this.lastTable2EndPos,
              columnStyles: {
                0: { halign: 'center', valign: 'middle' },
                1: { halign: 'center', valign: 'middle' },
              },
              didDrawCell: (data) => {
                if (data.row.index == 1 && data.column.index == 0) {
                  this.pdfDoc.addImage(this.imgZoomIn[currentIndex], 'JPEG', data.cell.x + 1, data.cell.y + 1, 89, 53);
                } else if (data.row.index == 1 && data.column.index == 1 && this.postConstrImg[currentIndex] != undefined) {
                  this.pdfDoc.addImage(this.postConstrImg[currentIndex], 'JPEG', data.cell.x + 1, data.cell.y + 1, 89, 53);
                }
              },
              didDrawPage: (data) => {
                this.lastTable3EndPos = data.cursor.y; // 抓table3的位置
              }
            });
          }

          if (pageIndex < totalPages - 1) {
            this.pdfDoc.addPage();
            imgPage++;
          }
        }



        this.pdfDoc.addPage();

        // p20 聖東回報修繕設施路段表

        let page = 1; // 頁次初始化
        const totalPages2 = Math.ceil(this.place.length / 2);
        for (let i = 0; i < this.place.length; i++) {
          // 如果当前索引是偶数，添加页眉和第一页的表格
          if (i % 2 == 0) {
            this.pdfDoc.setFontSize(12);
            this.pdfDoc.text(`${this.groupName}`, width / 2, height - 280, { align: 'center' });
            this.pdfDoc.text(`聖東回報修繕設施路段表`, width / 2, height - 274, { align: 'center' });
            this.pdfDoc.setFontSize(8);
            this.pdfDoc.text(`工程地點：(聖東-設施)${this.place[i]}等${this.place.length}處(設施)`, width - 196, height - 265);
            this.pdfDoc.text(`${page}/${totalPages2}頁次`, width - 25, height - 265);

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
      this.imgZoomIn = [];
      // Fetch PDF data from API
      await getCompleteRoadPDF({ id: this.ApplyId, GroupId: this.GroupId }).then(response => {
        console.log('complete data', response.data);

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
            this.imgZoomIn.push(item.ImgZoomIn);
            this.postConstrImg.push(item.PostConstrImg);
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

