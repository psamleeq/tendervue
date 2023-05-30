<template>
	<div class="case-mark" v-loading="loading"> 
		<div class="header-bar">
			<h2 class="route-title">缺失標記</h2>
			<div class="filter-container">
				<span class="filter-item">
					<el-input v-model="listQuery.inspectId" placeholder="請輸入">
						<span slot="prepend">巡查Id</span>
					</el-input>
				</span>
				<el-button class="filter-item" type="success" icon="el-icon-download" @click="getCarList()">載入</el-button>
				<br>

				<span class="filter-item">
					<el-input v-model="listQuery.inspectId" placeholder="請輸入">
						<span slot="prepend">缺失Id</span>
					</el-input>
				</span>
				<el-button class="filter-item" type="success" icon="el-icon-download" @click="getCarList()">載入</el-button>
				
			</div>
		</div>
		<el-row>
			<el-col ref="leftPanel" :span="6" style="position: relative; width: 25%;">
				<div id="map" ref="map" />
				<div class="btn-map">
					<!-- <div ref="compass" class="btn-action btn-compass" style="transform: rotate(0deg)" @click="setHeading(0)" /> -->
					<el-button class="btn-action btn-target" plain icon="el-icon-aim" @click="setMarkerPosition()" />
				</div>
				<div class="touch-div" ref="splitLine">
					<span />
					<span />
				</div>
			</el-col>
			<el-col ref="rightPanel" class="info-panel" :span="18" style="position: relative; width: 75%;" >
				<panorama-view ref="panoramaView" :listQuery="listQuery" :panoramaInfo.sync="panoramaInfo" @showPanoramaLayer="showPanoramaLayer" @setMarkerPosition="setMarkerPosition" @setHeading="setHeading" @addMarker="addMarker" @clearMarker="clearMarker" @uploadCase="uploadCase" />
			</el-col>
		</el-row> 
	</div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader";
import moment from 'moment'
import { uploadInspectionCase } from "@/api/inspection";
import data2blob from '@/utils/data2blob.js';
import PanoramaView from '@/components/PanoramaView';

// 載入 Google Map API
const loaderOpt = {
	apiKey: "",
	version: "weekly",
	language: "zh-TW",
	region: "TW",
	libraries: ["places"],
};

// TODO: apiKey先關閉
if(!sessionStorage.devMode && process.env.VUE_APP_MAP_KEY != undefined) loaderOpt.apiKey = process.env.VUE_APP_MAP_KEY;
const loader = new Loader(loaderOpt);

export default {
	name: "caseMark",
	components: { PanoramaView },
	data() {
		return {
			loading: false,
			map: null,
			sceneId: null,
			clientStartX: 0,
			geoCoder: {},
			polyLine: [],
			markers: [],
			markersTemp: [],
			pointCurr: null,
			pickerOptions: {
				firstDayOfWeek: 1,
				shortcuts: [
					{
						text: "今日",
						onClick(picker) {
							const date = moment();
							picker.$emit("pick", date);
						},
					},
					{
						text: "昨日",
						onClick(picker) {
							const date = moment().subtract(1, "d");
							picker.$emit("pick", date);
						}
					},
					{
						text: "前日",
						onClick(picker) {
							const date = moment().subtract(2, "d");
							picker.$emit("pick", date);
						}
					}
				],
				disabledDate(date) {
					return moment(date).valueOf() >= moment().endOf("d").valueOf();
				},
			},
			searchDate: moment().startOf("d"),
			searchRange: "",
			listQuery: {
				inspectId: "",
				carId: 1
			},
			panoramaInfo: {
				data: [],
				sceneSetting: {}
			},
			options: {
				// districtList: {
				// 	// 100: {
				// 	// 	"name": "中正區",
				// 	// 	"engName": "Zhongzheng"
				// 	// },
				// 	103: {
				// 		"name": "大同區",
				// 		"start": "2023/2/1"
				// 	},
				// 	104: {
				// 		"name": "中山區",
				// 		"start": "2022/6/1"
				// 	},
				// 	// 105: {
				// 	// 	"name": "松山區",
				// 	// 	"engName": "Songshan"
				// 	// },
				// 	// 106: {
				// 	// 	"name": "大安區",
				// 	// 	"engName": "Da’an"
				// 	// },
				// 	// 108: {
				// 	// 	"name": "萬華區",
				// 	// 	"engName": "Wanhua",
				// 	// },
				// 	// 110: {
				// 	// 	"name": "信義區",
				// 	// 	"engName": "Xinyi"
				// 	// },
				// 	// 111: {
				// 	// 	"name": "士林區",
				// 	// 	"engName": "Shilin"
				// 	// },
				// 	// 112: {
				// 	// 	"name": "北投區",
				// 	// 	"engName": "Beitou"
				// 	// },
				// 	// 114: {
				// 	// 	"name": "內湖區",
				// 	// 	"engName": "Neihu"
				// 	// },
				// 	// 115: {
				// 	// 	"name": "南港區",
				// 	// 	"engName": "Nangang"
				// 	// },
				// 	// 116: {
				// 	// 	"name": "文山區",
				// 	// 	"engName": "Wenshan"
				// 	// }
				// },
				carId: {
					1: {
						// 1: "ATE-5102",
						1: "RDX-6883",
						2: "RDQ-6279",
						// 3: "ATE-3192",
						3: "RDX-6881",
					},
					2: {
						1: "ATE-3236",
						2: "BFX-7552",
					},
					3: {
						1: "ALV-3038",
						2: "APD-3308",
						3: "AAA-0000",
					},
					4: {
						1: "ATE-3287",
						2: "ATE-3192",
					},
					5: {
						1: "BPG-0891",
						2: "BFX-7551",
					}
				},
			},
		};
	},
	computed: {	},
	created() {
		// Google Map錯誤處理
		window.gm_authFailure = () => { 
			console.log("Google Map Failure");
			// session.devMode: 時效5分鐘
			sessionStorage.devMode = true;
			sessionStorage.dueTime = new Date().getTime() + (5*60*1000);
			location.reload();
		};

		// 初始化Google Map
		loader.load().then(() => this.initMap()).catch(err => console.log("err: ", err));
	},
	mounted() { 
		this.leftPanel = this.$refs.leftPanel.$el;
		this.rightPanel = this.$refs.rightPanel.$el;
		this.screenWidth = this.leftPanel.offsetWidth + this.rightPanel.offsetWidth;
		const splitLine = this.$refs.splitLine;

		splitLine.onmousedown = e => {
			// console.log(e);
			this.screenWidth = this.leftPanel.offsetWidth + this.rightPanel.offsetWidth;
			this.clientStartX = e.clientX;
			e.preventDefault();

			document.onmousemove = e => { this.moveHandle(e.clientX); };

			document.onmouseup = e => {
				document.onmouseup = null;
				document.onmousemove = null;
			};
		};
	},
	methods: {
		//NOTE: test
		addMarker({ position, type }) {
			console.log(type, position);

			let icon;
			if(type == 2) {
				icon = { 
					url: `/assets/icon/icon_greenDot.png`,
					scaledSize: new google.maps.Size(6, 6) 
				};
			} else if (type == 3) {
				icon = { 
					url: `/assets/icon/icon_blueDot.png`,
					scaledSize: new google.maps.Size(4, 4) 
				};
			}
			this.markersTemp.push(
				new google.maps.Marker({ 
					position, 
					icon,
					map: this.map
				})
			);

			this.map.setCenter(position);
		},
		clearMarker() {
			for(const marker of this.markersTemp) marker.setMap(null);
			this.markersTemp = [];
		},
		// init google map
		initMap() {
			// 預設顯示的地點：台北市政府親子劇場
			const location = {
				lat: 25.0374865, // 經度
				lng: 121.5647688, // 緯度
			};

			// 建立地圖
			this.map = new google.maps.Map(this.$refs.map, {
				center: location, // 中心點座標
				zoom: 13, // 1-20，數字愈大，地圖愈細：1是世界地圖，20就會到街道
				minZoom: 13,
				// maxZoom: 19,
				/*
					roadmap 顯示默認道路地圖視圖。
					satellite 顯示 Google 地球衛星圖像。
					hybrid 顯示正常和衛星視圖的混合。
					terrain 顯示基於地形信息的物理地圖。
				*/
				// mapTypeId: "satellite",
				fullscreenControl: false,
				mapTypeControl: false,
				streetViewControl: false,
				rotateControl: false,
				heading: 0,
				tilt: 0,
				mapId: process.env.VUE_APP_MAP_ID,
				styles: [
					{
						stylers: [{ visibility: "on" }],
					},
					{
						featureType: "poi",
						elementType: "all",
						stylers: [{ visibility: "off" }],
					},
					{
						featureType: "transit",
						elementType: "all",
						stylers: [{ visibility: "off" }],
					},
					{
						featureType: "road",
						elementType: "labels",
						stylers: [{ visibility: "off" }]
					}
				],
			});

			// NOTE: 設定路名在KML之上，只有在非開發模式才能載入多圖層
			if(loaderOpt.apiKey.length != 0) {
				// NOTE: 疊上StyledMapType
				const labelsMapType = new google.maps.StyledMapType(
					[
						{
							stylers: [{ visibility: 'off'}]
						}, 
						{
							featureType: "road",
							elementType: 'labels',
							stylers: [{ visibility: 'on' }]
						}
					], 
					{
						name: 'Labels'
					}
				);
				this.map.overlayMapTypes.push(labelsMapType);
			}

			this.infoWindow = new google.maps.InfoWindow({ pixelOffset: new google.maps.Size(0, -10) });

			// 建立marker
			this.pointCurr = new google.maps.Marker({
				map: this.map,
				icon: {
					url: "/assets/icon/truck.png",
					anchor: new google.maps.Point(12, 12),
					scaledSize: new google.maps.Size(24, 24)
				}
			});

			this.getList();
		},
		getList() {
			fetch('/test/streetView.json').then(response => response.json()).then(json => {
				// this.panoramaInfo = json;
				// this.panoramaInfo = Object.assign({}, this.panoramaInfo, json);
				this.$set(this.panoramaInfo, "data", json.data);
				this.$set(this.panoramaInfo, "sceneSetting", json.sceneSetting);
				// console.log(this.panoramaInfo);
				this.setPanoramaLayer();
			});
		},
		uploadCase(caseInfo) {
			let uploadForm = new FormData();
			uploadForm.append('inspectId', this.listQuery.inspectId);
			uploadForm.append('dateReport', this.formatTime(caseInfo.dateReport));
			uploadForm.append('distressType', caseInfo.distressType);
			uploadForm.append('distressLevel', caseInfo.distressLevel);
			uploadForm.append('millingLength', caseInfo.millingLength);
			uploadForm.append('millingWidth', caseInfo.millingWidth);
			uploadForm.append('place', caseInfo.place);
			uploadForm.append('direction', caseInfo.direction);
			uploadForm.append('lane', caseInfo.lane);
			uploadForm.append('geoJson', JSON.stringify(caseInfo.geoJson));
			uploadForm.append('imgZoomIn', data2blob(caseInfo.imgZoomIn, 'image/jpeg'), 'imgZoomIn.jpg');
			uploadForm.append('imgZoomOut', data2blob(caseInfo.imgZoomOut, 'image/jpeg'), 'imgZoomOut.jpg');

			console.log(uploadForm);

			uploadInspectionCase(uploadForm).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "新增成功",
						type: "success",
					});
				} 
				this.loading = false;
			}).catch(err => {
				console.log(err);
				this.loading = false;
				this.isUpload = false;
			})
		},
		setHeading(azimuth) {
			azimuth = Math.abs(azimuth) > 360 ? azimuth % 360 : azimuth;
			// console.log("setHeading: ", azimuth);
			// this.$refs.compass.style.transform = `rotate(${-azimuth}deg)`;
			this.map.setHeading(azimuth);
		},
		async setPanoramaLayer() {
			// console.log("setPanoramaLayer");
			for(const polyline of Object.values(this.flattenObj(this.polyLine)).flat()) polyline.setMap(null);
			this.$refs.panoramaView.setStreetViewList();
			await this.createPolyLine();
			// await this.createMarker();
		},
		async createPolyLine() {
			this.polyLine = [];
			const lineInfo = this.panoramaInfo.data;
			if (!lineInfo) return;

			this.$refs.panoramaView.setPanoramaScene();

			// 掛載 polyline Layer(street view)
			lineInfo.forEach((polyInfo, index) => {
				const path = polyInfo.map((info) => info.position)
				this.polyLine.push(
					new google.maps.Polyline({
						path,
						geodesic: true,
						strokeColor: '#409EFF',
						strokeOpacity: 1,
						strokeWeight: 3,
						map: this.map,
					})
				);

				this.polyLine[index].addListener("click", (event) => {
					const pointPos = event.latLng.toJSON();
					const posList = this.panoramaInfo.data[index].map(info => ({ ...info.position, sceneId: info.fileName }));
					const minDistObj = posList.reduce((minDistObj, curr) => {
							const distance = Math.sqrt(Math.pow(pointPos.lat - curr.lat, 2) + Math.pow(pointPos.lng - curr.lng, 2));
							if (minDistObj.dist > distance) {
								minDistObj.dist = distance;
								minDistObj.sceneId = curr.sceneId;
							}
							return minDistObj;
						},
						{ dist: Infinity, sceneId: "" }
					);
					this.showPanoramaLayer(minDistObj.sceneId);
				})

				// const bounds = new google.maps.LatLngBounds();
				// path.forEach(position => bounds.extend(position));
				// this.map.fitBounds(bounds);
			})
			this.showPanoramaLayer(this.panoramaInfo.data[0][0].fileName);
		},
		async createMarker() {
			this.markers = [];
			const markerInfos = this.panoramaInfo.data;
			if (!markerInfos) return;

			this.$refs.panoramaView.setPanoramaScene();

			// 掛載 marker (street view)

			const icon = { 
				url: `/assets/icon/icon_orangeDot.png`,
				scaledSize: new google.maps.Size(4, 4) 
			} 

			markerInfos.forEach((markerInfo, index) => {
				markerInfo.forEach((info, index) => {
					const marker = new google.maps.Marker({ 
						title: info.fileName,
						position: info.position, 
						icon: icon,
						map: this.map
					})
					this.markers.push(marker);

					marker.addListener("click", (event) => {
						const sceneId = marker.getTitle();
						console.log(sceneId);
						this.showPanoramaLayer(sceneId);
					});

					marker.addListener("mouseover", (event) => {
						this.infoWindow.setContent(event.latLng.toString());
						this.infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -10)});
						this.infoWindow.setPosition(event.latLng);

						this.infoWindow.open(this.map);
					});

					marker.addListener("mouseout", (event) => {
						this.infoWindow.close();
					});
				})
			});
		},
		showPanoramaLayer(sceneId) {
			// console.log("showPanoramaLayer");
			console.log(sceneId);
			this.sceneId = sceneId;
			this.setMarkerPosition() 

			this.$refs.panoramaView.panorama.loadScene(sceneId);
			// this.$refs.panoramaView.panorama.setUpdate(true);
			// this.$refs.panoramaView.panorama.setUpdate(false);
			this.showPanorama = this.$refs.panoramaView.showPanorama = true;
		},
		setMarkerPosition(sceneId) {
			// console.log("setMarkerPosition: ", sceneId);
			this.sceneId = sceneId ? sceneId : this.sceneId;
			const pointInfo = this.panoramaInfo.data.flat().filter(pt => pt.fileName == this.sceneId)[0];
			this.pointCurr.setPosition(pointInfo.position);
			// this.setHeading(pointInfo.azimuth);
			this.map.setCenter(pointInfo.position);
			this.map.setZoom(20);
		},
		moveHandle(nowClientX) {
			const computedPercent = (nowClientX - this.clientStartX) / this.screenWidth * 100;
			// console.log("computedPercent: ", computedPercent);
			const leftBoxWidth = parseInt(this.leftPanel.style.width);
			// console.log("leftBoxWidth: ", leftBoxWidth);
			let changePercent = Math.ceil((leftBoxWidth + computedPercent) * 100) / 100;
			if (changePercent < 25) changePercent = 25;
			else if (changePercent > 50) changePercent = 50;
			// console.log("changePercent: ", changePercent);

			this.leftPanel.style.width = `${changePercent}%`;
			this.rightPanel.style.width = `${100 - changePercent}%`;
			this.clientStartX = nowClientX;
			this.$refs.panoramaView.panorama.resize();
		},
		dateShortcuts(index) {
			this.timeTabId = index;

			const DATE_OPTION = {
				TODAY: 0,
				YESTERDAY: 1,
				DAYBEFOREYEST: 2
			};

			switch (index) {
				case DATE_OPTION.TODAY:
					this.searchDate = moment();
					break;
				case DATE_OPTION.YESTERDAY:
					this.searchDate = moment().subtract(1, "d");
					break;
				case DATE_OPTION.DAYBEFOREYEST:
					this.searchDate = moment().subtract(2, "d");
					break;
			}
			this.getCarList();
		},
		formatter(row, column) {
			if(Number(row[column.property])) return row[column.property].toLocaleString();
			else return row[column.property];
		},
		formatTime(time) {
			return moment(time).format("YYYY-MM-DD HH:mm:ss");
		},
		flattenObj(obj) {
			let result = {};
			for(const i in obj) {
				if((typeof obj[i]) === 'object' && !Array.isArray(obj[i])) {
					const temp = this.flattenObj(obj[i]);
					for(const j in temp) result[`${i}.${j}`] = temp[j];
				} else result[i] = obj[i];
			}
			return result;
		}
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.case-mark
	position: relative
	height: 100%
	width: 100%
	.header-bar
		position: absolute
		top: 0
		z-index: 10
		padding-left: 10px
		.route-title
			text-stroke: 0.6px white
			-webkit-text-stroke: 0.6px white
			.route-info
				background-color: rgba(white, 0.5)
				padding: 0 5px
				font-size: 18px 
				color: #555
		.filter-container 
			& > *
				padding-right: 5px
			.el-select
				width: 120px
			.el-input__inner
				padding-left: 5px
				text-align: center
		.filter-item
			margin-right: 5px
	.touch-div 
		position: absolute
		top: 0
		height: 100%
		left: 100%
		width: 20px
		display: flex
		justify-content: center
		align-items: center
		cursor: col-resize
		z-index: 20
		span 
			width: 2px
			background: #eee
			margin: 0 2px
			height: 15px
	#map
		overflow: hidden
		background: none !important
		// position: absolute
		height: calc(100vh - 50px)
		// width: 100vw
		[role="region"] > div:first-child > div:first-child
			z-index: 120 !important
		.gm-style-iw.gm-style-iw-c
			table, tr, td
				font-family: 'Noto Sans TC', '微軟正黑體', 'Microsoft JhengHei', sans-serif
				border-collapse: collapse !important
				border: none !important
				padding: 5px
	.btn-map
		display: flex
		flex-direction: column
		justify-content: space-around
		position: absolute
		width: 40px
		// height: 80px
		bottom: 120px
		right: 10px
		.btn-action
			position: relative
			padding: 0 !important
			background-color: #fff
			min-width: 40px !important
			i 
				font-size: 24px
			&.btn-target
				height: 40px
			&.btn-compass
				height: 40px
				border-radius: 50%
				border: 1px solid #fff
				margin-bottom: 5px
				background-color: rgba(#000, 0.1)
				background-image: url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2250%22%20width%3D%2250%22%3E%0A%3Cpath%20d%3D%22m24.5078%206-3.2578%2018h7.5l-3.25781-18h-0.984376zm-3.2578%2020%203.2578%2018h0.9844l3.2578-18h-7.5zm1.19531%200.9941h5.10938l-2.5547%2014.1075-2.5547-14.1075z%22%2F%3E%0A%3C%2Fsvg%3E%0A')
				background-size: cover
				background-repeat: no-repeat
				background-position: center
				transition: 0.1s
	.info-panel
		height: calc(100vh - 50px)
		background-color: #F0F8FF
</style>