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
    }
	},
	data() {
		return {
			pdfContent: '',
      caseNo: [], // 道管系統案號
      dateCreate: [], // 查報日期
      dateDeadline: [], // 預定完工日期
      place: [], // 地點
      distressName: [], // 損壞類別
      millingArea: [], // 面積m2
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
        this.pdfDoc.setFontSize(12);
        this.pdfDoc.text(`112年度道路預約式契約維護修繕工程第2標`, width/2, height-280, { align: 'center' });
        this.pdfDoc.text(`聖東營造申請維修道路路段表(第   次)`, width/2, height-270, { align: 'center' });

        this.pdfDoc.setFontSize(10);
        this.pdfDoc.text(`工程地點：${this.place[0]}`, width -196, height-260);
        this.pdfDoc.text(`頁次1/1`, width -27, height-260);

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
          startY: height - 257,
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
      // Fetch PDF data from API
      await getInformRoadPDF({ id: this.ApplyId }).then(response => {
        console.log(response.data.list);
        response.data.list.forEach(item => {
          this.caseNo.push(item.CaseNo);
          this.dateCreate.push(moment(item.DateCreate).subtract(1911, 'years').format('YYYY-MM-DD'));
          this.dateDeadline.push(moment(item.DateDeadline).subtract(1911, 'years').format('YYYY-MM-DD'));
          this.place.push(item.Place);
          this.distressName.push(item.DistressName);
          this.millingArea.push(Math.round(item.MillingArea * 100) / 100);
        });

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

