<template>
	<div class="road-case" v-loading="loading">
		<div id="map" ref="map" />
		<div class="header-bar">
			<h2 class="case-title">鋪面缺失</h2>
			<!-- <div class="filter-container">
				<div class="filter-item">
					<el-input v-model="listQuery.roadId" placeholder="請輸入">
						<span slot="prepend">道路Id</span>
					</el-input>
				</div>
				<el-button class="filter-item" type="primary" size="small" icon="el-icon-search" @click="getList();">搜尋</el-button>
			</div> -->
		</div>
		<el-card class="info-box">
			<div class="color-box" v-for="(color, index) in options.colorMap" :key="`color_${index}`"  :style="`background-color: ${color.color}; width: 100%; height: 30px;`">{{ color.name.join("、") }}</div>
		</el-card>
	</div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader";
import moment from "moment";
import { getRoadCaseGeo } from "@/api/road";

// 載入 Google Map API
const loaderOpt = {
	apiKey: "",
	version: "weekly",
	language: "zh-TW",
	region: "TW",
	libraries: ["places"],
};

// apiKey
if(!sessionStorage.devMode && process.env.VUE_APP_MAP_KEY != undefined) loaderOpt.apiKey = process.env.VUE_APP_MAP_KEY;
const loader = new Loader(loaderOpt);

export default {
	name: "roadCase",
	components: { },
	data() {
		return {
			loading: false,
			screenWidth: window.innerWidth,
			areaLimit: [139, 325],
			map: null,
			dataLayer: {},
			markers: [],
			polyLines: [],
			geoJSON: {},
			geoInfo: {},
			listQuery: {},
			headers: { },
			options: { 
				colorMap: [
					{
						name: ["龜裂"],
						color: "#F44336"
					},
					{
						name: ["裂縫", "縱橫裂縫", "塊狀裂縫"],
						color: "#009688"
					},
					{
						name: ["坑洞", "人孔高差", "薄層剝離"],
						color: "#FF9800"
					},
					{
						name: ["車轍"],
						color: "#00BCD4"
					},
					{
						name: ["補綻", "管線回填"],
						color: "#673AB7"
					},
					{
						name: ["隆起與凹陷"],
						color: "#8BC34A"
					},
					{	
						name: ["其他"],
						color: "#607D8B"
					}
				]
			}
		};
	},
	computed: { },
	watch: { },
	created() { },
	async mounted() {
		// Google Map錯誤處理
		window.gm_authFailure = () => { 
			console.log("Google Map Failure");
			// session.devMode: 時效5分鐘
			sessionStorage.devMode = true;
			sessionStorage.dueTime = new Date().getTime() + (5*60*1000);
			location.reload();
		};

		// 初始化Google Map
		loader.load().then(async() => {
			await this.initMap();
			this.getList();
		}).catch(err => console.log("err: ", err));
	},
	methods: {
		// init google map
		async initMap() {
			// 預設顯示的地點：台北市政府親子劇場
			const location = {
				lat: 25.0374865, // 經度
				lng: 121.5647688, // 緯度
			};

			// 建立地圖
			this.map = new google.maps.Map(this.$refs.map, {
				center: location, // 中心點座標
				zoom: 13, // 1-20，數字愈大，地圖愈細：1是世界地圖，20就會到街道
				maxZoom: 24,
				minZoom: 13,
				/*
					roadmap 顯示默認道路地圖視圖。
					satellite 顯示 Google 地球衛星圖像。
					hybrid 顯示正常和衛星視圖的混合。
					terrain 顯示基於地形信息的物理地圖。
				*/
				// mapTypeId: "roadmap",
				fullscreenControl: false,
				mapTypeControl: false,
				streetViewControl: false,
				rotateControl: false,
				tilt: 0,
				styles: [
					{
						stylers: [{ visibility: "on" }],
					},
					{
						elementType: "geometry",
						stylers: [{ color: "#f5f5f5" }]
					},
					{
						elementType: "labels.text.fill",
						stylers: [{ color: "#616161" }]
					},
					{
						elementType: "labels.text.stroke",
						stylers: [{ color: "#f5f5f5" }]
					},
					{
						featureType: "administrative",
						elementType: "all",
						stylers: [{ visibility: "off" }]
					},
					{
						featureType: "poi",
						elementType: "all",
						stylers: [{ visibility: "off" }],
					},
					{
						featureType: "road",
						elementType: "geometry",
						stylers: [{ color: "#FFFFFF" }]
					},
					{
						featureType: "road.arterial",
						elementType: "labels.text.fill",
						stylers: [{ color: "#757575" }]
					},
					{
						featureType: "road.highway",
						elementType: "geometry",
						stylers: [{ color: "#DADADA" }]
					},
					{
						featureType: "road.highway",
						elementType: "labels.text.fill",
						stylers: [{ color: "#616161" }]
					},
					{
						featureType: "road.local",
						elementType: "labels.text.fill",
						stylers: [{ color: "#9E9E9E" }]
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
					},
					{
						featureType: "water",
						elementType: "geometry",
						stylers: [{ color: "#C9C9C9" }]
					},
					{
						featureType: "water",
						elementType: "labels.text.fill",
						stylers: [{ color: "#9E9E9E" }]
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

			this.dataLayer.district = new google.maps.Data({ map: this.map });
			this.dataLayer.district.loadGeoJson("/assets/json/district.geojson");
			this.dataLayer.district.setStyle({
				strokeColor: "#827717",
				strokeWeight: 3,
				strokeOpacity: 0.2,
				fillOpacity: 0
			});
		},
		getList() {
			// if(!Number(this.listQuery.roadId)) {
			// 	this.$message({
			// 		message: "請輸入正確道路Id",
			// 		type: "error",
			// 	});
			// } else {
				this.loading = true;
				this.clearAll();
				this.markers = [];
				this.polyLines = {};
				// this.$router.push({ query: { roadId: this.listQuery.roadId }});

				getRoadCaseGeo().then((response) => {
					if(Object.keys(response.data.geoJSON).length == 0) {
						this.$message({
							message: "查無資料",
							type: "error",
						});
					} else {
						this.geoJSON = response.data.geoJSON;
						this.map.data.addGeoJson(this.geoJSON);
						// this.map.data.setStyle({ 
						// 	strokeColor: '#009688',
						// 	strokeWeight: 1,
						// 	strokeOpacity: 0.5,
						// 	fillColor: '#EF5350',
						// 	fillOpacity: 0.8
						// });
						this.map.data.setStyle(feature => { 
							// console.log(feature.h.caseName);
							let color = this.options.colorMap.filter(color => color.name == '其他')[0].color;
							if(feature.h.caseName) {
								const colorFilter = this.options.colorMap.filter(color => {
									let caseFlag = false;
									for(const name of color.name) {
										caseFlag = (feature.h.caseName.indexOf(name) != -1);
										// console.log(name, caseFlag);
										if(caseFlag) break;
									}

									return caseFlag; 
								})
								// console.log(colorFilter);
								
								if(colorFilter.length > 0) color = colorFilter[0].color;
							}

							// console.log(color);

							if(feature.h.isLine) {
								return { 
									strokeColor: color,
									strokeWeight: 2,
									strokeOpacity: 1,
									fillOpacity: 0
								};
							} else {
								return { 
									strokeColor: color,
									strokeWeight: 1,
									strokeOpacity: 1,
									fillColor: color,
									fillOpacity: 0.8
								};
							}
								
						});
					}

					this.loading = false;
				}).catch(err => this.loading = false);
			// }
		},
		clearAll() {
			this.map.data.forEach(feature => this.map.data.remove(feature));
			for(const polyline of Object.values(this.polyLines)) polyline.setMap(null);
			for(const markers of this.markers) markers.setMap(null);
		},
		// handleSelBlockChange(selection) {
		// 	this.selectBlock = selection;
		// },
		handleMouseEnter(row, column, cell, event) {
			// console.log(row.blockId);
			
			this.map.data.revertStyle();
			this.map.data.forEach(feature => {
				if(feature.h.blockId == row.blockId) this.map.data.overrideStyle(feature, { fillColor: "#FFF176" });
			});
		},
		handleMouseLeave(row, column, cell, event) {
			// console.log(row.blockId);
			this.map.data.revertStyle();
		},
		formatter(row, column) {
			if (Number(row[column.property])) return row[column.property].toLocaleString();
			else return row[column.property] || "-";
		},
		formatTime(time) {
			return moment(time).utc().format("YYYY-MM-DD");
		}
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.road-case
	position: relative
	height: 100%
	width: 100%
	.header-bar
		position: absolute
		top: 0
		z-index: 1
		padding-left: 10px
		.case-title
			text-shadow: 0px 0px 5px white
			text-stroke: 0.6px white
			-webkit-text-stroke: 0.6px white
	.info-box
		position: absolute
		width: 300px
		top: 20px
		right: 20px
		background-color: rgba(white, 0.7)
		z-index: 1
		.el-card__body
			.color-box
				width: 100%
				line-height: 30px
				color: white
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
</style>