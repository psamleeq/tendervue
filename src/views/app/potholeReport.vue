<template>
	<div class="app-container pothole-report" v-loading="loading">
		<h2>坑洞回報
			<el-checkbox-button v-model="listQuery.filter" @change="getList">
				<span v-if="listQuery.filter">已完工</span>
				<span v-else>未完工</span>
			</el-checkbox-button>
		</h2>
		<div class="filter-container">
			<el-select v-model="listQuery.contractId" placeholder="請選擇" style="width: 110px;">
				<el-option v-for="(text, id) in options.ContractId" :key="`contractId${id}`" :label="text" :value="Number(id)" />
			</el-select>

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

			<el-date-picker
				v-model="listQuery.dateRange"
				type="datetimerange"
				class="filter-item"
				range-separator="至"
				start-placeholder="開始日期"
				end-placeholder="結束日期"
				align="right" />

			<div class="filter-item">
				<el-button type="primary" @click="getList()">搜尋</el-button>
				<el-button type="warning" @click="showImportCaseDialog = true">建立案件</el-button>
			</div>
		</div>
		<div v-for="caseSpec in list" :key="caseSpec.id" class="case-list">
			<el-row :gutter="10" type="flex" align="center" justify="center">
				<el-col :span="8">
					<el-image class="img-preview" style="width: 100%; height: 100%; cursor: pointer" :src="caseSpec.ImgZoomIn" :preview-src-list="[caseSpec.ImgZoomIn, caseSpec.RestoredImage]" fit="cover" />
				</el-col>
				<el-col :span="8">
					<el-image class="img-preview" style="width: 100%; height: 100%; cursor: pointer" :src="caseSpec.RestoredImage" :preview-src-list="[caseSpec.ImgZoomIn, caseSpec.RestoredImage]" fit="cover">
						<div slot="error" class="image-slot">
							<span>尚未上傳</span>
						</div>
					</el-image>
				</el-col>
				<el-col :span="16" :md="12" class="case-info">
					<el-popover placement="right" :disabled="screenWidth >= 992">
						<el-button-group>
							<el-button type="info" size="mini" @click="showMapViewer(caseSpec, false)">地圖</el-button>
							<!-- <el-button v-if="caseSpec.FlowState == 0" type="primary" size="mini" @click="setResult(caseSpec, 1)">完工</el-button>
							<el-button v-else size="mini" @click="setResult(caseSpec, 0)">撤銷</el-button>
							<el-button v-if="caseSpec.FlowState == 0" :type="caseSpec.ImgZoomIn.length == 0 ? 'success' : ''" size="mini" @click="openImgUpload(caseSpec)">缺失照片</el-button>  -->
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
					<!-- <el-button v-if="caseSpec.FlowState == 0" type="primary" @click="setResult(caseSpec, 2)">完工</el-button>
					<el-button v-else size="mini" @click="setResult(caseSpec, 0)">撤銷</el-button> -->
					<!-- <br> -->
					<!-- <el-button v-if="caseSpec.FlowState == 0" :type="caseSpec.ImgZoomIn.length == 0 ? 'success' : ''" @click="openImgUpload(caseSpec)">缺失照片</el-button> -->
					<el-button v-if="caseSpec.FlowState == 0" :type="caseSpec.RestoredImage.length == 0 ? 'success' : ''" @click="openRestoredImgUpload(caseSpec)">修復後照片</el-button>
				</el-col>
				</el-row>
			<el-divider />
		</div>
		<pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" />

		<el-dialog v-loading="loading" width="360px" title="建立專案" :visible.sync="showImportCaseDialog">
			<el-form>
				<el-form-item label="分隊">
					<el-select v-model="contractId" placeholder="請選擇" style="margin-left: 37px; width: 200px;">
						<el-option 
							v-for="(val, type) in options.ContractId" 
							:key="type" 
							:label="val" 
							:value="type">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="contractId == 1" label="區域">
					<el-select v-model="zipCode" style="margin-left: 37px; width: 200px;">
						<el-option label="中山區" value="104" />
						<el-option label="大同區" value="103" />
					</el-select>
				</el-form-item>
				<el-form-item label="缺失程度">
					<el-select v-model="distressLevel" placeholder="請選擇" style="margin-left: 10px; width: 200px;">
						<el-option 
							v-for="(val, type) in options.DistressLevel" 
							:key="type" 
							:label="val" 
							:value="type">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="預估長度">
					<el-input style="margin-left:10px; width: 200px;" v-model="millingLength"></el-input>
				</el-form-item>
				<el-form-item label="預估寬度">
					<el-input style="margin-left:10px; width: 200px;" v-model="millingWidth"></el-input>
				</el-form-item>
				<el-form-item label="預估面積">
					<el-input style="margin-left:10px; width: 200px;" v-model="millingArea"></el-input>
				</el-form-item>
				<el-form-item label="地址">
					<el-input style="margin-left:38px; width: 200px;" v-model="place"></el-input>
				</el-form-item>
				<el-form-item label="路向">
					<el-select v-model="direction" placeholder="請選擇" style="margin-left: 37px; width: 200px;">
						<el-option 
							v-for="(val, type) in options.Direction" 
							:key="type" 
							:label="val" 
							:value="type">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="車道">
					<el-select v-model="lane" placeholder="請選擇" style="margin-left: 37px; width: 200px;">
						<el-option 
							v-for="(val, type) in options.Lane" 
							:key="type" 
							:label="val" 
							:value="type">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="圖片上傳">
					<el-upload 
						:class="[ 'img-upload', { hide: showUpload } ]"
						style="margin-top: 10px;"
						action="#" 
						accept="image/jpeg, image/jpg" 
						:auto-upload="false" 
						list-type="picture-card"
						:limit = "1"
						:on-change="handleChangeNew" 
						:on-preview="handlePreviewNew" 
						:on-remove="handleRemoveNew">
						<i class="el-icon-plus avatar-uploader-icon"></i>
						<div slot="tip" class="el-upload__tip">只能上傳jpg文件，且不超過500kb</div>
					</el-upload>
				</el-form-item>
			</el-form>

			<div slot="footer" class="dialog-footer">
				<el-button @click="showImportCaseDialog = false;">取消</el-button>
				<el-button type="success" @click="createCase()">創建案件</el-button>
			</div>
		</el-dialog>

		<!-- Dialog: 建立坑洞案件(上傳修補後照片) -->
		<el-dialog v-loading="loading" width="300px" title="照片上傳(修補後)" :visible.sync="showRestoredImgUploadDialog" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
			<el-row type="flex" align="middle">
				<el-upload :class="[ 'img-upload', { hide: showUpload } ]" action="#" accept="image/jpeg, image/jpg" :auto-upload="false" list-type="picture-card" :limit = "1" :on-change="handleChangeRestored" :on-preview="handlePreviewRestored" :on-remove="handleRemoveRestored">
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
import { getDTypeMap } from "@/api/type";
import { getInspectFlowPotholeList, restoredImgUpload, importPotholeCase } from "@/api/app";
import Pagination from "@/components/Pagination";
import MapViewer from "@/components/MapViewer";
import ElImageViewer from 'element-ui/packages/image/src/image-viewer';

export default {
	name: "potholeReport",
	components: { Pagination, MapViewer, ElImageViewer },
	data() {
		return {
			loading: false,
			dialogMapVisible: true,
			showImgViewer: false,
			showRestoredImgUploadDialog: false,
			showImportCaseDialog: false,
			showUpload: false,
			screenWidth: window.innerWidth,
			listQuery: {
				filter: false,
				filterType: 1,
				filterStr: '',
				contractId: 1,
				dateRange: [ moment().startOf("day").toDate(), moment().endOf("day").toDate() ],
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
					2: "第二車道",
					3: "第三車道",
					4: "第四車道",
					5: "第五車道"
				}
			}
		}
	},
	created() { 
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
			if(this.listQuery.contractId == null || this.listQuery.dateRange.length == 0) {
				this.$message({
					message: "請選擇分隊和時間",
					type: "error",
				});
			} else {
				this.loading = true;
				this.list = [];

				getInspectFlowPotholeList({
					filter: this.listQuery.filter,
					contractId: this.listQuery.contractId,
					place: (this.listQuery.filterType == 1 && this.listQuery.filterStr.length != 0) ? this.listQuery.filterStr : null,
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
							// l.ImgZoomIn = { name: l.ImgZoomIn && l.ImgZoomIn.length > 0 ? l.ImgZoomIn.split("/").slice(-1) : '', status: "success", url: l.RestoredImage };
							// l.RestoredImage = { name: l.RestoredImage && l.RestoredImage.length > 0 ? l.RestoredImage.split("/").slice(-1) : '', status: "success", url: l.RestoredImage };
						})

						this.$nextTick(() => document.documentElement.scrollTop = this.scrollTop);
					}
					this.getImportCaseList();
					this.loading = false;
				}).catch(err => this.loading = false);
			}
		},
		createCase() {
			if (this.contractId == 0 || (this.contractId == 1 && this.zipCode == 0) || this.distressLevel == 0 || 
					this.millingLength == 0 || this.millingWidth == 0 || this.millingArea == 0 || 
					this.place.length == 0 || this.direction.length == 0 || this.lane.length == 0
				) {
				this.$message({
					message: '請輸入對應的資料',
					type: 'warning',
				});
			} else {
				this.loading = true;
				
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
					uploadForm.append('img', await this.photoCompress(this.rowActive.ImgZoomIn.raw));
					
					importPotholeCase(uploadForm).then(response => {
						if ( response.statusCode == 20000 ) {
							this.$message({
								message: "建立成功",
								type: "success",
							});
							
							this.showImportCaseDialog = false;
							this.getList();
						} else {
							this.$message({
								message: "建立失敗",
								type: "error",
							});
							this.loading = false;
						}		
					}).catch(err => this.loading = false);
				});
				
			}
		},
		showMapViewer(row) {
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
				"geometry": row.CenterPt
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
			this.map.setCenter({ lat: Number(row.lat), lng: Number(row.lng) });

			const zoom = this.map.getZoom();
			this.map.setZoom(zoom < 21 ? 21 : zoom);
		},
		openRestoredImgUpload(row) {
			this.showRestoredImgUploadDialog = true;
			this.rowActive = JSON.parse(JSON.stringify(row));
		},
		// 建立案件圖片
		handleChangeNew(file) {
			// console.log(file, fileList);
			this.showUpload = true;
			this.rowActive.ImgZoomIn = file;
		},
		handlePreviewNew(file) {
			// console.log(file);
			this.imgPreviewUrls = this.rowActive.ImgZoomIn.url;
			this.imgPreviewIndex = this.imgPreviewUrls.indexOf(file.url);
			this.showImgViewer = true;
		},
		handleRemoveNew() {
			this.rowActive.ImgZoomIn = '';
			this.showUpload = false;
		},
		// 修復後照片
		handleChangeRestored(file) {
			// console.log(file, fileList);
			this.showUpload = true;
			this.rowActive.RestoredImage = file;
		},
		handlePreviewRestored(file) {
			// console.log(file);
			this.imgPreviewUrls = this.rowActive.RestoredImage.url;
			this.imgPreviewIndex = this.imgPreviewUrls.indexOf(file.url);
			this.showImgViewer = true;
		},
		handleRemoveRestored() {
			// console.log(file, fileList);
			this.rowActive.RestoredImage = '';
			this.showUpload = false;
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
						// console.log(byteStr);
						let uint8arr = new Uint8Array(byteStr.length);
						for(let i = 0; i <= byteStr.length; i++) uint8arr[i] = byteStr.charCodeAt(i);
						const newFile = new File( [uint8arr], file.name, { type: mime });
						
						resolve(newFile);
					}
					img.src = fileReader.result;
				}
			})
		},
		async submitRestoredImgUpload() {
			this.loading = true;

			let uploadForm = new FormData();
			uploadForm.append('serialNo', this.rowActive.id);
			uploadForm.append('img', await this.photoCompress(this.rowActive.RestoredImage.raw));

			await restoredImgUpload(uploadForm).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "更新成功",
						type: "success",
					});
					this.showRestoredImgUploadDialog = false;
					this.getList();
				} else {
					this.$message({
						message: "更新失敗",
						type: "error",
					});
					this.loading = false;
				}
			}).catch(err => this.loading = false);	
		},
		formatTime(time) {
			return moment(time).format("YYYY-MM-DD");
		}
	}
}
</script>

<style lang="sass">
.pothole-report
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
		.image-slot
			position: absolute
			left: 50%
			top: 50%
			transform: translate(-50%, -50%)
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
	.img-upload
		.el-upload--picture-card
			display: inline-block
			.el-upload-list__item
				transition-duration: 0.02s !important
		&.hide .el-upload--picture-card
			display: none
</style>