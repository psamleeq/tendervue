<template>
	<div class="app-container inspect-fin-report" v-loading="loading">
		<h2>坑洞回報
			<el-checkbox-button v-model="listQuery.filter" :disabled="listQuery.tenderRound == null" @change="getList">
				<span v-if="listQuery.filter">已完工</span>
				<span v-else>未完工</span>
			</el-checkbox-button>
		</h2>
		<div class="filter-container">
			<div v-if="listQuery.tenderRound != -1" class="filter-item">
				<div class="select-contract el-input el-input--medium el-input-group el-input-group--prepend">
					<el-select v-model.number="listQuery.tenderRound" class="tender-select" popper-class="type-select tender">
						<el-option v-for="(val, type) in options.tenderRoundMap" :key="type" :label="val.name" :value="Number(type)">
							<div :style="`color: #${Math.floor(val.tenderId*16777215).toString(16).substr(0, 8)}`">{{ val.name }}</div>
						</el-option>
					</el-select>
				</div>
			</div>

			<div class="filter-item">
				<div class="el-input el-input--mini el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<el-select v-model.number="listQuery.filterType" popper-class="type-select tender" style="width: 80px">
							<el-option label="路名" :value="1" />
							<el-option label="缺失Id" :value="2" />
						</el-select>
					</div>
					<el-input v-model="listQuery.filterStr" placeholder="請輸入" size="mini" style="width: 170px" >
						<el-button slot="append" type="primary" size="mini" icon="el-icon-search" />
					</el-input>
				</div>
			</div>

      <div class="filter-item">
				<div class="el-input el-input--mini el-input-group el-input-group--prepend">
          <el-date-picker
            v-model="listQuery.dateRange"
            type="datetimerange"
            range-separator="-"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            align="right">
          </el-date-picker>
				</div>
			</div>

      <div class="filter-item">
        <el-button type="primary" @click="getList()">搜尋</el-button>
        <el-button type="warning" @click="showImportCaseDialog = true">建立案件</el-button>
      </div>
		</div>
		<div v-for="caseSpec in list" :key="caseSpec.id" class="case-list">
			<el-row :gutter="10" type="flex" align="center" justify="center">
				<el-col :span="8">
					<el-image class="img-preview" style="width: 100%; height: 100%; cursor: pointer" :src="caseSpec.ImgZoomIn" :preview-src-list="[caseSpec.ImgZoomIn, caseSpec.ImgZoomOut, ...caseSpec.RestoredImage.map(file=>file.url)]" fit="cover" />
				</el-col>
        <el-col :span="8">
					<el-image v-if="caseSpec.RestoredImage.length > 0" class="img-preview" style="width: 100%; height: 100%; cursor: pointer" :src="caseSpec.RestoredImage[0].url" :preview-src-list="[caseSpec.ImgZoomIn, caseSpec.ImgZoomOut, ...caseSpec.RestoredImage.map(file=>file.url)]" fit="cover" />
				</el-col>
				<el-col :span="16" :md="12" class="case-info">
					<el-popover placement="right" :disabled="screenWidth >= 992">
						<el-button-group>
							<el-button type="info" size="mini" @click="showMapViewer(caseSpec, false)">地圖</el-button>
							<el-button v-if="caseSpec.FlowState == 0" type="primary" size="mini" @click="setResult(caseSpec, 1)">完工</el-button>
							<el-button v-else size="mini" @click="setResult(caseSpec, 0)">撤銷</el-button>
							<el-button v-if="caseSpec.FlowState == 0" :type="caseSpec.ImgZoomIn.length == 0 ? 'success' : ''" size="mini" @click="openImgUpload(caseSpec)">缺失照片</el-button> 
							<el-button v-if="caseSpec.FlowState == 0" :type="caseSpec.RestoredImage.length == 0 ? 'success' : ''" size="mini" @click="openRestoredImgUpload(caseSpec)">修復後照片</el-button> 
						</el-button-group>
						<span slot="reference">
							<el-row :gutter="3">
								<el-col :span="4" class="case-title">日期: </el-col>
								<el-col :span="10">{{ formatTime(caseSpec.DateCreate) }}</el-col>
								<el-col :span="4" class="case-title">ID: </el-col>
								<el-col :span="6">{{ caseSpec.id }}</el-col>
							</el-row>
							<el-row :gutter="3">
								<el-col :span="4" class="case-title">類型: </el-col>
								<el-col :span="10">{{ options.DistressTypeFlat[caseSpec.DistressType] }}</el-col>
								<el-col :span="4" class="case-title">程度: </el-col>
								<el-col :span="6">{{ options.DistressLevel[caseSpec.DistressLevel] }}</el-col>
							</el-row>
							<el-row>
								<el-col :span="4" class="case-title">地址: </el-col>
								<el-col :span="20">{{ caseSpec.Place }}</el-col>
							</el-row>
						</span>
					</el-popover>
				</el-col>
				<el-col :md="4" class="hidden-sm-and-down" style="display: flex; flex-direction: column; justify-content: space-evenly;">
					<el-button type="info" @click="showMapViewer(caseSpec, false)">地圖</el-button>
					<!-- <br> -->
					<el-button v-if="caseSpec.FlowState == 0" type="primary" @click="setResult(caseSpec, 2)">完工</el-button>
					<el-button v-else size="mini" @click="setResult(caseSpec, 0)">撤銷</el-button>
					<!-- <br> -->
					<el-button v-if="caseSpec.FlowState == 0" :type="caseSpec.ImgZoomIn.length == 0 ? 'success' : ''" @click="openImgUpload(caseSpec)">缺失照片</el-button>
          
					<el-button v-if="caseSpec.FlowState == 0" :type="caseSpec.RestoredImage.length == 0 ? 'success' : ''" @click="openRestoredImgUpload(caseSpec)">修復後照片</el-button>
				</el-col>
				</el-row>
			<el-divider />
		</div>
		<pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog v-loading="loading" width="360px" title="建立專案" :visible.sync="showImportCaseDialog">
      <div>
        <span>分隊</span>
        <el-select v-model="contractId" placeholder="請選擇" style="margin-left: 37px; width: 200px;">
          <el-option 
            v-for="(val, type) in options.ContractId" 
            :key="type" 
            :label="val" 
            :value="type">
          </el-option>
        </el-select>
      </div>
      <div style="margin-top: 20px;">
        <span>郵遞區號</span>
        <el-input style="margin-left: 10px; width: 200px;" v-model="zipCode"></el-input>
      </div>
      <!-- <div style="margin-top: 20px;">
        <span>通報日期</span>
        <el-input style="margin-left: 10px; width: 200px;" v-model="reportTime" :disabled="true"></el-input>
      </div> -->
      <div style="margin-top: 20px;">
        <span>缺失程度</span>
        <el-select v-model="distressLevel" placeholder="請選擇" style="margin-left: 10px; width: 200px;">
          <el-option 
            v-for="(val, type) in options.DistressLevel" 
            :key="type" 
            :label="val" 
            :value="type">
          </el-option>
        </el-select>
      </div>
      <div style="margin-top: 20px;">
        <span>預估長度</span>
        <el-input style="margin-left: 10px; width: 200px;" v-model="millingLength"></el-input>
      </div>
      <div style="margin-top: 20px;">
        <span>預估寬度</span>
        <el-input style="margin-left: 10px; width: 200px;" v-model="millingWidth"></el-input>
      </div>
      <div style="margin-top: 20px;">
        <span>預估面積</span>
        <el-input style="margin-left: 10px; width: 200px;" v-model="millingArea"></el-input>
      </div>
      <div style="margin-top: 20px;">
        <span>地址</span>
        <el-input style="margin-left: 37px; width: 200px;" v-model="place"></el-input>
      </div>
      <div style="margin-top: 20px;">
        <span>路向</span>
        <el-select v-model="direction" placeholder="請選擇" style="margin-left: 37px; width: 200px;">
          <el-option 
            v-for="(val, type) in options.Direction" 
            :key="type" 
            :label="val" 
            :value="type">
          </el-option>
        </el-select>
      </div>
      <div style="margin-top: 20px;">
        <span>車道</span>
        <el-select v-model="lane" placeholder="請選擇" style="margin-left: 37px; width: 200px;">
          <el-option 
            v-for="(val, type) in options.Lane" 
            :key="type" 
            :label="val" 
            :value="type">
          </el-option>
        </el-select>
      </div>
      <div style="margin-top: 20px;">
        <span>圖片上傳</span>
        <el-upload 
          style="margin-top: 20px;" 
          class="img-upload" 
          action="#" 
          accept="image/jpeg, image/jpg" 
          :auto-upload="false" 
          list-type="picture-card" 
          :file-list="rowActive.ImgZoomIn" 
          :limit = "1"
          :on-change="handleChangeNew" 
          :on-preview="handlePreviewNew" 
          :on-remove="handleRemoveNew">
          <i class="el-icon-plus avatar-uploader-icon"></i>
          <div slot="tip" class="el-upload__tip">只能上傳jpg文件，且不超過500kb</div>
				</el-upload>
      </div>
      <div slot="footer" class="dialog-footer">
				<el-button @click="showImportCaseDialog = false;">取消</el-button>
				<el-button type="success" @click="createCase()">創建案件</el-button>
			</div>
    </el-dialog>

		<!-- Dialog: 建立坑洞案件(上傳缺失照片) -->
		<el-dialog v-loading="loading" width="360px" title="照片上傳(坑洞缺失)" :visible.sync="showImgUploadDialog" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
			<el-row type="flex" align="middle">
				<el-upload class="img-upload" action="#" accept="image/jpeg, image/jpg" :auto-upload="false" list-type="picture-card" :file-list="rowActive.Image" :on-change="handleChange" :on-preview="handlePreview" :on-remove="handleRemove">
					<i class="el-icon-plus" />
					<div slot="tip" class="el-upload__tip">只能上傳jpg文件，且不超過500kb</div>
				</el-upload>
			</el-row>
			<div slot="footer" class="dialog-footer">
				<el-button @click="showImgUploadDialog = false; getList();">取消</el-button>
				<el-button type="success" @click="submitImgUpload()">上傳</el-button>
			</div>
		</el-dialog>

    <!-- Dialog: 建立坑洞案件(上傳修補後照片) -->
    <el-dialog v-loading="loading" width="360px" title="照片上傳(修補後)" :visible.sync="showRestoredImgUploadDialog" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
			<el-row type="flex" align="middle">
				<el-upload class="img-upload" action="#" accept="image/jpeg, image/jpg" :auto-upload="false" list-type="picture-card" :file-list="rowActive.RestoredImage" :on-change="handleChangeRestored" :on-preview="handlePreviewRestored" :on-remove="handleRemoveRestored">
					<i class="el-icon-plus" />
					<div slot="tip" class="el-upload__tip">只能上傳jpg文件，且不超過500kb</div>
				</el-upload>
			</el-row>
			<div slot="footer" class="dialog-footer">
				<el-button @click="showRestoredImgUploadDialog = false; getList();">取消</el-button>
				<el-button type="success" @click="submitRestoredImgUpload()">上傳</el-button>
			</div>
		</el-dialog>

		<!-- Dialog: map -->
		<el-dialog class="dialog-map" :visible.sync="dialogMapVisible" width="350px">
			<span>{{ place }}</span>
			<map-viewer :map.sync="map"/>
		</el-dialog>

		<!-- Dialog: 照片預覽 -->
		<el-image-viewer
			v-if="showImgViewer"
			class="img-preview"
			:on-close="() => { showImgViewer = false; }"
			:url-list="imgPreviewUrls"
			:initial-index="imgPreviewIndex"
		/>
	</div>
</template>

<script>
import moment from "moment";
import { getTenderRound, getDTypeMap } from "@/api/type";
import { getinspectFlowPotholeList, setInspectFlowList, trackingImgUpload, restoredImgUpload, importPotholeCase } from "@/api/app";
import Pagination from "@/components/Pagination";
import MapViewer from "@/components/MapViewer";
import ElImageViewer from 'element-ui/packages/image/src/image-viewer';



export default {
	name: "inspectFinReport",
	components: { Pagination, MapViewer, ElImageViewer },
	data() {
		return {
			loading: false,
			dialogMapVisible: true,
			showImgViewer: false,
			showImgUploadDialog: false,
      showRestoredImgUploadDialog: false,
      showImportCaseDialog: false,
			screenWidth: window.innerWidth,
			listQuery: {
				filter: false,
				filterType: 1,
				filterStr: "",
				tenderRound: null,
        dateRange: [],
				pageCurrent: 1,
				pageSize: 50
			},
      contractId: "",
      zipCode: 0,
      // reportTime: moment().format('YYYY-MM-DD'),
      // distressType: 15,
      distressLevel: "",
      millingLength: 0,
      millingWidth: 0,
      millingArea: 0,
			place: "",
      direction: "",
      lane: "",
      imgUrl: "",
			total: 0,
			list: [],
			rowActive: {},
			imgObj: {
				add: [], 
				remove: []
			},
			map: {},
			options: {
				tenderRoundMap: {},
				DistressTypeFlat: {},
				DistressLevel: {
					1: "輕",
					2: "中",
					3: "重"
				},
        Direction: {
          0: "無",
          1: "順",
          2: "逆"
        },
        ContractId: {
          1: "第一分隊",
          2: "第二分隊",
          3: "第三分隊",
          4: "第四分隊",
          5: "第五分隊",
          6: "第六分隊"
        },
        Lane: {
          1: "第一車道",
          2: "第二車道"
        }
			}
		}
	},
	created() {
		getTenderRound().then(response => {
			this.options.tenderRoundMap = response.data.list.reduce((acc, cur) => {
				if(cur.tenderId <= 1001) return acc;

				let roundId = `${cur.tenderId}${String(cur.round).padStart(3, '0')}`;
				if(cur.zipCodeSpec != 0) roundId += `${cur.zipCodeSpec}`;

				let name = `${cur.tenderName}`;
				if(cur.title.length != 0) name += `_${cur.title}`;

				acc[roundId] = { 
					id: cur.id,
					name, 
					tenderId: cur.tenderId, 
					isMain: cur.zipCodeSpec == 0,
					zipCode: cur.zipCodeSpec == 0 ? cur.zipCode : cur.zipCodeSpec, 
					roundStart: cur.roundStart, 
					roundEnd: cur.roundEnd
				};
				return acc;
			}, {});

			// if(Object.keys(this.options.tenderRoundMap).length > 0) {
			// 	if(!Object.keys(this.options.tenderRoundMap).includes(String(this.listQuery.tenderRound))) {
			// 		this.listQuery.tenderRound = this.$route.query.surveyId = Number(Object.keys(this.options.tenderRoundMap)[0]);
			// 	}
			// }
			if(Object.keys(this.options.tenderRoundMap).length == 0) {
				this.options.tenderRoundMap = { "-1": { id: -1 }};
				this.listQuery.tenderRound = -1;
			}
		});

		getDTypeMap().then(response => {
			this.options.DistressTypeFlat = Object.values(response.data.distressTypeMap).reduce((acc, cur) => {
				for (const key in cur) acc[key] = cur[key];
				return acc;
			}, {});
		})
	},
	mounted() {
		this.dialogMapVisible = false;
	},
	methods: {
		getList() {
			if(this.listQuery.tenderRound == null || this.listQuery.dateRange.length == 0) {
				this.$message({
					message: "請選擇合約和時間",
					type: "error",
				});
			} else {
				this.loading = true;
				this.list = [];
				const tenderRound = this.options.tenderRoundMap[this.listQuery.tenderRound];

				getinspectFlowPotholeList({
					filter: this.listQuery.filter,
					surveyId: tenderRound.id,
					roadName: (this.listQuery.filterType == 1 && this.listQuery.filterStr.length != 0) ? this.listQuery.filterStr : null,
					caseId: (this.listQuery.filterType == 2 && this.listQuery.filterStr.length != 0) ? this.listQuery.filterStr : null,
					pageCurrent: this.listQuery.pageCurrent,
					pageSize: this.listQuery.pageSize,
          timeStart: this.listQuery.dateRange[0],
          timeEnd: this.listQuery.dateRange[1]
				}).then(response => {
					if (response.data.list.length == 0) {
						this.$message({
							message: "查無資料",
							type: "error",
						});
						this.total = 0;
					} else {
						this.total = response.data.total;
						this.list = response.data.list;
						this.list.forEach(l => {
							l.DateCreate = this.formatTime(l.DateCreate);
							l.MillingLength = Math.round(l.MillingLength * 100) / 100;
							l.MillingWidth = Math.round(l.MillingWidth * 100) / 100;
							l.MillingArea = Math.round(l.MillingArea * 100) / 100;
							l.RestoredImage = JSON.parse(l.RestoredImage).map(url => ({ name: url.split("/").slice(-1), status: "success", url }));
						})
            // console.log(this.list[0].RestoredImage[0].url);

						this.$nextTick(() => document.documentElement.scrollTop = this.scrollTop);
					}
					this.getImportCaseList();
					this.loading = false;
				}).catch(err => this.loading = false);
			}
		},
    createCase() {
      if (this.contractId.length == 0 || this.zipCode.length == 0 || this.distressLevel.length == 0 || 
          this.millingLength == 0 || this.millingWidth == 0 || this.millingArea == 0 || 
          this.place.length == 0 || this.direction.length == 0 || this.lane.length == 0) {
        this.$message({
          message: '請輸入對應的資料',
          type: 'warning',
        });
      } else {
        
        navigator.geolocation.getCurrentPosition( async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          let uploadForm = new FormData();
          uploadForm.append('contractId', parseInt(this.contractId));
          uploadForm.append('zipCode', parseInt(this.zipCode));
          uploadForm.append('distressLevel', parseInt(this.distressLevel));
          uploadForm.append('millingLength', parseInt(this.millingLength));
          uploadForm.append('millingWidth', parseInt(this.millingWidth));
          uploadForm.append('millingArea', parseInt(this.millingArea));
          uploadForm.append('place', this.place);
          uploadForm.append('direction', parseInt(this.direction));
          uploadForm.append('lane', parseInt(this.lane));
          uploadForm.append('position', JSON.stringify({ lng: longitude, lat: latitude }));
          uploadForm.append('img', await this.photoCompress(this.rowActive.ImgZoomIn[0].raw));
          
          importPotholeCase(uploadForm).then(response => {
            if ( response.statusCode == 20000 ) {
              this.$message({
                message: "提交成功",
                type: "success",
              });
              
              // this.getList();
            } 
          }).catch(err => {
            console.log(err);
            // this.getList();
          });
        });
        
      }
    },
		setResult(row, flowState) {
			this.$confirm(`確定${ flowState ? '標記' : '撤銷'} 缺失ID ${row.id} 完工？`, "確認", {
				showClose: false,
			}).then(() => {
				this.loading = true;

				setInspectFlowList( row.SerialNo, {
					flowState
				}).then(response => {
					if ( response.statusCode == 20000 ) {
						this.$message({
							message: "提交成功",
							type: "success",
						});
						this.getList();
					} 
				}).catch(err => {
					console.log(err);
					this.getList();
				})
			})
		},
		showMapViewer(row, isPoint=false) {
			// console.log("showMap");
			this.map.data.forEach(feature => this.map.data.remove(feature));
			this.place = row.Place;
			this.dialogMapVisible = true;

			let geoJSON_case = { 
				"type": "FeatureCollection",
				"name": "polyJSON",
				"features": []
			};
			// console.log(row.wkb_geometry);

			geoJSON_case.features.push({
				"type": "Feature",
				"properties": { },
				"geometry": isPoint? row.CenterPt : row.Geometry
			});

			// console.log(geoJSON_case);

			this.map.data.addGeoJson(geoJSON_case);
			this.map.data.setStyle({ 
				strokeColor: '#F56C6C',
				strokeWeight: 3,
				strokeOpacity: 0.9,
				fillColor: '#F56C6C',
				fillOpacity: 0.8
			});

			const depth = row.Geometry.type == "MultiLineString" ? 1 : 2;
			const paths = row.Geometry.coordinates.flat(depth).map(point => ({ lat: point[1], lng: point[0] }));
			const bounds = new google.maps.LatLngBounds();
			paths.forEach(position => bounds.extend(position));
			this.map.fitBounds(bounds);

			const zoom = this.map.getZoom();
			this.map.setZoom(zoom < 21 ? 21 : zoom);
		},
		openImgUpload(row) {
			this.showImgUploadDialog = true;
			this.rowActive = JSON.parse(JSON.stringify(row));
			this.imgObj = { add: [], remove: [] };

			// NOTE: 強制照片上傳
			// this.$nextTick(() => {
			// 	console.log(this.$el.querySelectorAll(".img-upload"));
			// 	this.$el.querySelectorAll(".img-upload").forEach(el => {
			// 		console.log(el);
			// 		el.children[1].children[1].setAttribute('capture', 'environment');
			// 	});
			// })
		},
    openRestoredImgUpload(row) {
			this.showRestoredImgUploadDialog = true;
			this.rowActive = JSON.parse(JSON.stringify(row));
			this.imgObj = { add: [], remove: [] };

		},
    // 建立案件圖片
    handleChangeNew(file, fileList) {
			// console.log(file, fileList);
      // if(fileList.length > 1) fileList.shift();
			if(file.status == 'ready') this.imgObj.add.push(file);
			this.rowActive.ImgZoomIn = fileList;
			// this.imgPreviewUrls = fileList.map(file => file.url);
		},
		handlePreviewNew(file) {
			// console.log(file);
			this.imgPreviewUrls = this.rowActive.ImgZoomIn.map(file => file.url)
			this.imgPreviewIndex = this.imgPreviewUrls.indexOf(file.url);
			this.showImgViewer = true;
		},
		handleRemoveNew(file, fileList) {
			// console.log(file, fileList);
			if(file.status == 'success') this.imgObj.remove.push(file);
			else if(file.status == 'ready') this.imgObj.add = this.imgObj.add.filter(img => img.uid != file.uid);
			this.rowActive.ImgZoomIn = fileList;
		},
    // 缺失照片
		handleChange(file, fileList) {
			// console.log(file, fileList);
			if(file.status == 'ready') this.imgObj.add.push(file);
			this.rowActive.Image = fileList;
			// this.imgPreviewUrls = fileList.map(file => file.url);
		},
		handlePreview(file) {
			// console.log(file);
			this.imgPreviewUrls = this.rowActive.Image.map(file => file.url)
			this.imgPreviewIndex = this.imgPreviewUrls.indexOf(file.url);
			this.showImgViewer = true;
		},
		handleRemove(file, fileList) {
			// console.log(file, fileList);
			if(file.status == 'success') this.imgObj.remove.push(file);
			else if(file.status == 'ready') this.imgObj.add = this.imgObj.add.filter(img => img.uid != file.uid);
			this.rowActive.Image = fileList;
		},
    // 修復後照片
    handleChangeRestored(file, fileList) {
			// console.log(file, fileList);
			if(file.status == 'ready') this.imgObj.add.push(file);
			this.rowActive.RestoredImage = fileList;
			// this.imgPreviewUrls = fileList.map(file => file.url);
		},
		handlePreviewRestored(file) {
			// console.log(file);
			this.imgPreviewUrls = this.rowActive.RestoredImage.map(file => file.url)
			this.imgPreviewIndex = this.imgPreviewUrls.indexOf(file.url);
			this.showImgViewer = true;
		},
		handleRemoveRestored(file, fileList) {
			// console.log(file, fileList);
			if(file.status == 'success') this.imgObj.remove.push(file);
			else if(file.status == 'ready') this.imgObj.add = this.imgObj.add.filter(img => img.uid != file.uid);
			this.rowActive.RestoredImage = fileList;
		},
		photoCompress(file) {
			return new Promise(resolve => {
				const fileReader = new FileReader();
				fileReader.readAsDataURL(file);

				fileReader.onload = () => { 
					const img = new Image();
					img.onload = () => {
						const canvas = document.createElement('canvas');
						// console.log("image: ", img.width, img.height);
						const scale = Math.max(img.width, img.height) >= 1024 ? 1024/Math.max(img.width, img.height) : 1;
						canvas.width = img.width * scale;
						canvas.height = img.height * scale;
						// console.log("canvas: ", canvas.width, canvas.height);
						const canvasContext = canvas.getContext('2d');
						canvasContext.drawImage(img, 0, 0, canvas.width, canvas.height);
						const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
						
						const arr = dataUrl.split(',');
						const mime = arr[0].match(/:(.*?);/)[1];
						const byteStr = atob(arr[1], 'base64');
						console.log(byteStr);
						let uint8arr = new Uint8Array(byteStr.length);
						for(let i = 0; i <= byteStr.length; i++) uint8arr[i] = byteStr.charCodeAt(i);
						const newFile = new File( [uint8arr], file.name, { type: mime });
						
						resolve(newFile);
					}
					img.src = fileReader.result;
				}
			})
		},
		async submitImgUpload() {
			this.loading = true;

			let uploadForm = new FormData();
			uploadForm.append('serialNo', this.rowActive.SerialNo);

			for(const file of this.imgObj.add.filter(f => (f.raw))) uploadForm.append('fileAddList', await this.photoCompress(file.raw));
			for(const file of this.imgObj.remove.filter(f => (f.url))) uploadForm.append('fileRemoveList', file.url);

			await trackingImgUpload(uploadForm).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "更新成功",
						type: "success",
					});
					this.showImgUploadDialog = false;
					// this.rowActive[`${key}Img`] = response.imgList.map(url => ({ name: url.split("/").slice(-1), status: "success", url }));
					this.getList();
				} else {
					this.$message({
						message: "更新失敗",
						type: "error",
					});
				}
				this.loading = false;
			}).catch(err => this.loading = false);	
		},
    async submitRestoredImgUpload() {
			this.loading = true;

			let uploadForm = new FormData();
			uploadForm.append('serialNo', this.rowActive.SerialNo);

			for(const file of this.imgObj.add.filter(f => (f.raw))) uploadForm.append('fileAddList', await this.photoCompress(file.raw));
			for(const file of this.imgObj.remove.filter(f => (f.url))) uploadForm.append('fileRemoveList', file.url);

			await restoredImgUpload(uploadForm).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "更新成功",
						type: "success",
					});
					this.showRestoredImgUploadDialog = false;
					// this.rowActive[`${key}Img`] = response.imgList.map(url => ({ name: url.split("/").slice(-1), status: "success", url }));
					this.getList();
				} else {
					this.$message({
						message: "更新失敗",
						type: "error",
					});
				}
				this.loading = false;
			}).catch(err => this.loading = false);	
		},
		formatTime(time) {
			return moment(time).format("YYYY-MM-DD");
		}
	}
}
</script>

<style lang="sass">
.inspect-fin-report
	margin-bottom: 16px
	.el-checkbox-button
		margin-right: 5px
		.el-checkbox-button__inner
			padding: 6px
			font-size: 12px
			background-color: #1890ff
			color: white
		&.is-checked .el-checkbox-button__inner
			background-color: #67C23A
			border-color: #67C23A
	.filter-container
		.filter-item
			margin-right: 5px
			.el-select.tender-select
				width: 250px
				max-width: 80vw
				.el-input__inner
					padding-left: 10px
					text-align: left
	.case-list
		margin-bottom: 0px
		.el-row
			margin-bottom: 4px
		.case-info
			margin: auto
			& > *
				font-size: 12px
			.case-title
				color: #444
				margin-bottom: 2px
		.el-divider
			margin: 8px 0
		.el-button
			margin: 0 20px
		// 	padding: 5px 10px
	.img-preview
		width: 100%
		// z-index: 3000 !important
		.el-icon-circle-close
			color: white
	.el-upload-list__item 
		transition-duration: 0.02s !important
</style>