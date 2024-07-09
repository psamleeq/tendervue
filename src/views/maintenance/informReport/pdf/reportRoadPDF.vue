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
import { getReportRoadPDF } from "@/api/dispatch";

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
      dateDeadline: [], // 預定完工日期
      place: [], // 地點
      imgZoomIn: [], // 近照圖片
      postConstrImg: [], // 施工後照片
      coordinateX: [], // 座標X
      coordinateY: [], // 座標Y
      
      designDetail: [], // 施作數量
      designDesc: [], // 施工方式
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
        
        const { width, height } = this.pdfDoc.internal.pageSize;

        for (let i = 0; i < this.caseNo.length; i++) {
          // 回報市府
          this.pdfDoc.setFontSize(14);
          this.pdfDoc.text(`臺北市政府工務局新建工程處養護工程隊修復回報單`, width/2, height-280, { align: 'center' });
          this.pdfDoc.setFontSize(10);
          this.pdfDoc.text(`編    號：  `, width-190, height-270, { align: 'left' });
          this.pdfDoc.text(`工程名稱：  ${this.groupName}`, width-190, height-260, { align: 'left' });
          this.pdfDoc.text(`修復地點：  ${this.place[i]}`, width-190, height-250, { align: 'left' });
          this.pdfDoc.text(`施工日期：  `, width-190, height-240, { align: 'left' });
          this.pdfDoc.text(`道管系統案號：  ${this.caseNo[i]}`, width-80, height-270, { align: 'left' });
          this.pdfDoc.text(`座        標：  ${this.degreeToDMS(this.coordinateX[i])} E\n                 ${this.degreeToDMS(this.coordinateY[i])} N`, width-80, height-260, { align: 'left' });
          this.pdfDoc.text(`修 復  項 目：  ${this.designDetail[i] || ''}`, width-80, height-250, { align: 'left' });
          this.pdfDoc.text(`實 際  數 量：  ${this.designDesc[i] || ''}`, width-80, height-240, { align: 'left' });

          const table1 = [
            ['缺失地點相片'],
            [ { content: '', styles: { minCellHeight: 82 } } ]
          ];

          this.pdfDoc.autoTable({
            theme: 'plain',
            styles: { font: "edukai", fontSize: 10, lineWidth: 0.1, lineColor: 10 },
            body: table1,
            startY: height - 230,
            margin: { left: 45 },
            columnStyles: {
              0: { cellWidth: 122, halign: 'center', valign: 'middle' },
              1: { halign: 'center', valign: 'middle' }
            },
            didDrawCell: (data) => {
              if (data.row.index == 1 && data.column.index == 0) {
                this.pdfDoc.addImage(this.imgZoomIn[i] || '', 'JPEG', data.cell.x + 1, data.cell.y + 1, 120, 80);
              }
            },
            didDrawPage: (data) => {
              this.lastTableEndPos = data.cursor.Y; // 抓table1位置
            }
          });

          const table2 = [
            ['修復相片'],
            [ { content: '', styles: { minCellHeight: 82 } } ]
          ];

          this.pdfDoc.autoTable({
            theme: 'plain',
            styles: { font: "edukai", fontSize: 10, lineWidth: 0.1, lineColor: 10 },
            body: table2,
            startY: height - 120,
            margin: { left: 45 },
            columnStyles: {
              0: { cellWidth: 122, halign: 'center', valign: 'middle' },
              1: { halign: 'center', valign: 'middle' }
            },
            didDrawCell: (data) => {
              if (data.row.index == 1 && data.column.index == 0) {
                this.pdfDoc.addImage(this.postConstrImg[i] || '', 'JPEG', data.cell.x + 1, data.cell.y + 1, 120, 80);
              }
            },
          });

        }
        
        
        resolve();
      });
    },
    async getList() {
      this.caseNo = [];
      this.dateDeadline = [];
      this.place = [];
      this.imgZoomIn = [];
      this.postConstrImg = [];
      this.CoordinateX = [];
      this.CoordinateY = [];
      this.designDesc = [];
      this.designDetail = [];
      // Fetch PDF data from API
      await getReportRoadPDF({ id: this.ApplyId, GroupId: this.GroupId }).then(response => {
        console.log('report data', response.data);

        this.groupName = response.data.list[0].groupName;
        // this.groupSN = response.data.list[0].groupSN;
        // this.total = response.data.res_count[0].total;

        if (response.data.res != undefined) {
          response.data.res.forEach(item => {
            this.caseNo.push(item.CaseNo);
            this.dateDeadline.push(moment(item.DateDeadline).subtract(1911, 'years').format('YYYY-MM-DD').replace(/^0+/, ''));
            this.place.push(item.Place);
            this.imgZoomIn.push(item.ImgZoomIn);
            this.postConstrImg.push(item.PostConstrImg);
            this.coordinateX.push(item.CoordinateX);
            this.coordinateY.push(item.CoordinateY);
            this.designDetail.push(item.DesignDetail);
            this.designDesc.push(item.DesignDesc);
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
    },
    degreeToDMS(degrees) {
      const d = Math.floor(degrees); // 度
      const minFloat = (degrees - d) * 60;
      const m = Math.floor(minFloat); // 分
      const secFloat = (minFloat - m) * 60;
      const s = Math.round(secFloat); // 秒

      // 秒數60進位到分
      if (s == 60) {
        m += 1;
        s = 0;
      }

      // 分鐘60進位到度
      if (m == 60) {
        d += 1;
        m = 0;
      }

      return `${d}°${m}'${s}"`;
    }
  }
}
</script>

