<template>
	<div class="app-container inspect-fin-report" v-loading="loading">
		<h2>巡查回報</h2>
		<div class="filter-container">
			<div v-if="listQuery.tenderRound > 0" class="filter-item">
				<div class="select-contract el-input el-input--medium el-input-group el-input-group--prepend">
					<div class="el-input-group__prepend">
						<span>合約</span>
					</div>
					<el-select v-model.number="listQuery.tenderRound" class="tender-select" popper-class="type-select tender">
						<el-option v-for="(val, type) in options.tenderRoundMap" :key="type" :label="val.name" :value="Number(type)" />
					</el-select>
					<div class="el-input-group__append">
						<el-button v-if="listQuery.tenderRound > 0" type="primary" size="mini" icon="el-icon-search" @click="getList()" />
					</div>
				</div>
			</div>
		</div>
		<div v-for="caseSpec in list" :key="caseSpec.id" class="case-list">
			<el-row :gutter="10" type="flex" align="center" justify="center">
				<el-col :span="6">
					<el-image class="img-preview" style="width: 100%; height: 100%; cursor: pointer" :src="caseSpec.ImgZoomIn" :preview-src-list="[caseSpec.ImgZoomIn, caseSpec.ImgZoomOut]" fit="cover" />
				</el-col>
				<el-col :span="16" class="case-info">
					<el-row :gutter="3">
						<el-col :span="4" class="case-title">日期: </el-col>
						<el-col :span="10">{{ formatTime(caseSpec.DateCreate) }}</el-col>
						<el-col :span="4" class="case-title">ID: </el-col>
						<el-col :span="6">{{ caseSpec.id }}</el-col>
					</el-row>
					<el-row :gutter="3">
						<el-col :span="4" class="case-title">類型: </el-col>
						<el-col :span="10">{{ options.DistressType[caseSpec.DistressType] }}</el-col>
						<el-col :span="4" class="case-title">程度: </el-col>
						<el-col :span="6">{{ options.DistressLevel[caseSpec.DistressLevel] }}</el-col>
					</el-row>
					<el-row>
						<el-col :span="4" class="case-title">地址: </el-col>
						<el-col :span="20">{{ caseSpec.Place }}</el-col>
					</el-row>
				</el-col>
				<el-col :span="4">
					<el-button type="info" size="mini" @click="showMapViewer(caseSpec, false)">地圖</el-button>
					<br>
					<el-button type="primary" size="mini">完工</el-button>
					<br>
					<el-button type="success" size="mini" @click="openCamera()">照片</el-button>
				</el-col>
			</el-row>
			<el-divider />
		</div>
		<pagination :total="total" :pageCurrent.sync="listQuery.pageCurrent" :pageSize.sync="listQuery.pageSize" @pagination="getList" />

		<canvas ref="canvasCamera" style="display: none" />

		<!-- 拍攝視窗 -->
		<el-dialog title="拍攝" :visible.sync="showCameraDialog" width="100%" :before-close="() => closeCamera()">
			<el-image v-if="imgSrc.length != 0" style="width: 100%" :src="imgSrc" fit="contain" />
			<video v-else ref="video" v-loading="loading" style="width: 100%" />
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" @click="closeCamera()">取消</el-button>
				<el-button v-if="imgSrc.length == 0" type="primary" size="mini" @click="shoot()">拍攝</el-button>
				<span v-else>
					<el-button type="info" size="mini" @click="reShoot()">重拍</el-button>
					<el-button type="success" @click="closeCamera()">上傳</el-button>
				</span>
			</span>
		</el-dialog>

		<!-- map -->
		<el-dialog class="dialog-map" :visible.sync="dialogMapVisible" width="100%">
			<map-viewer :map.sync="map"/>
		</el-dialog>
	</div>
</template>

<script>
import moment from "moment";
import { getTenderRound } from "@/api/type";
import { getCaseTrackingList } from "@/api/inspection";
import Pagination from "@/components/Pagination";
import MapViewer from "@/components/MapViewer";

export default {
	name: "inspectFinReport",
	components: { Pagination, MapViewer },
	data() {
		return {
			loading: false,
			dialogMapVisible: true,
			showCameraDialog: false,
			listQuery: {
				tenderRound: 91,
				pageCurrent: 1,
				pageSize: 50
			},
			total: 0,
			list: [],
			imgSrc: "",
			map: {},
			options: {
				tenderRoundMap: {},
				DistressType: {
					15: "坑洞",
					29: "縱向及橫向裂縫",
					16: "龜裂",
					32: "車轍",
					18: "隆起與凹陷",
					34: "人手孔缺失",
					51: "薄層剝離",
					21: "其他",
					50: "塊狀裂縫",
					53: "推擠",
					65: "補綻及管線回填",
					54: "冒油",
					55: "波浪狀鋪面",
					56: "車道與路肩分離",
					49: "滑溜裂縫",
					66: "骨材剝落",
					58: "人孔高差"
				},
				DistressLevel: {
					1: "輕",
					2: "中",
					3: "重"
				}
			}
		}
	},
	created() {
		// 支援舊版瀏覽器
		if(navigator.mediaDevices == undefined) {
			navigator.mediaDevices = {};
			if (navigator.mediaDevices.getUserMedia === undefined) {
				navigator.mediaDevices.getUserMedia = function (constraints) {
					// 如果有 getUserMedia 的話
					const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

					// 如果瀏覽器根本没實現它 - 那麽就返回一个 error 到 promise 的 reject 来保持一個统一的接口
					if (!getUserMedia) {
						return Promise.reject(
							new Error("getUserMedia is not implemented in this browser"),
						);
					}

					// 否则，为老的 navigator.getUserMedia 方法包裹一个 Promise
					return new Promise(function (resolve, reject) {
						getUserMedia.call(navigator, constraints, resolve, reject);
					});
				};
			}
		} 
			
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

			if(Object.keys(this.options.tenderRoundMap).length > 0) {
				if(!Object.keys(this.options.tenderRoundMap).includes(String(this.listQuery.tenderRound))) {
					this.listQuery.tenderRound = this.$route.query.surveyId = Number(Object.keys(this.options.tenderRoundMap)[0]);
				}
			}
			if(Object.keys(this.options.tenderRoundMap).length == 0) {
				this.options.tenderRoundMap = { "-1": { id: -1 }};
				this.listQuery.tenderRound = -1;
			}
		});
	},
	mounted() {
		this.dialogMapVisible = false;
	},
	methods: {
		getList() {
			this.loading = true;
			this.list = [];
			const tenderRound = this.options.tenderRoundMap[this.listQuery.tenderRound];

			getCaseTrackingList({
				surveyId: tenderRound.id,
				pageCurrent: this.listQuery.pageCurrent,
				pageSize: this.listQuery.pageSize
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
						this.$set(l, "DeviceTypePlus", Number(`${l.DeviceType}${l.RestoredType}`));
						l.MillingLength = Math.round(l.MillingLength * 100) / 100;
						l.MillingWidth = Math.round(l.MillingWidth * 100) / 100;
						l.MillingArea = Math.round(l.MillingArea * 100) / 100;
					})

					this.$nextTick(() => document.documentElement.scrollTop = this.scrollTop);
				}
				this.getImportCaseList();
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		showMapViewer(row, isPoint=false) {
			// console.log("showMap");
			this.map.data.forEach(feature => this.map.data.remove(feature));
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
		openCamera() {
			if(navigator.mediaDevices == undefined) {
				this.$message({
					message: "不支援拍照",
					type: "error",
				});
			} else {
				this.showCameraDialog = true; 
				this.loading = true;
				navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment"  } }).then(stream => {
					this.$refs.video.srcObject = stream;
					this.$refs.video.onloadedmetadata = () => { 
						this.$refs.video.play(); 
						this.loading = false;
					};
				}).catch(err => console.log(err));
			}
		},
		shoot() {
			const { videoWidth, videoHeight } = this.$refs.video;
			const scale = Math.max(videoWidth, videoHeight) >= 1024 ? 1024/Math.max(videoWidth, videoHeight) : 1;

			const canvas = this.$refs.canvasCamera;
			canvas.width = videoWidth * scale;
			canvas.height = videoHeight * scale;
			const context = canvas.getContext("2d");
			context.drawImage(this.$refs.video, 0, 0, canvas.width, canvas.height);

			const image = canvas.toDataURL('image/jpeg', 0.8);
			this.imgSrc = image;
			this.$refs.video.srcObject.getTracks()[0].stop();
		},
		reShoot() {
			this.imgSrc = '';
			this.openCamera();
		},
		closeCamera() {
			if(this.$refs.video != undefined) this.$refs.video.srcObject.getTracks()[0].stop();
			this.showCameraDialog = false;
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
	.filter-container
		.filter-item
			margin-right: 5px
			.el-select.tender-select
				min-width: 230px
				max-width: 80vw
				.el-input__inner
					padding-left: 10px
					text-align: left
	.case-list
		margin-bottom: 0px
		.el-row
			margin-bottom: 4px
		.case-info > *
			font-size: 12px
			.case-title
				color: #444
		.el-divider
			margin: 8px 0
		.el-button
			padding: 5px 10px
	.img-preview
		width: 100%
		.el-image-viewer__mask
			opacity: 0.7
		.el-icon-circle-close
			color:  #FFF
</style>