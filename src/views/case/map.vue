<template>
	<div class="road-case" v-loading="loading">
		<div id="map" ref="map" />
		<div class="header-bar">
			<h2 class="case-title">缺失地圖</h2>
			<div class="filter-container">
				<div class="filter-item">
					<el-input v-model="listQuery.caseId" placeholder="請輸入">
						<span slot="prepend">缺失編號</span>
					</el-input>
				</div>
				<el-button class="filter-item" type="primary" size="small" icon="el-icon-search" @click="focusCase();">搜尋</el-button>
			</div>
		</div>

		<!-- <el-card class="info-box right">
			<div class="color-box" v-for="(color, index) in options.colorMap" :key="`color_${index}`"  :style="`background-color: ${color.color}; width: 100%; height: 30px;`">{{ color.name.join("、") }}</div>
		</el-card> -->

		<el-card class="info-box left">
			<el-row class="color-box" v-for="(info, index) in caseInfo" :key="`caseInfo_${index}`"  :style="`background-color: ${info.color}; width: 100%;`">
				<el-col :span="10" style="padding-left: 5px">{{ String(info.caseName) || " - " }}</el-col>
				<el-col :span="5">{{ info.total }}</el-col>
				<el-col :span="5">
					<el-switch v-model="selectCase[info.caseName].switch" @change="caseFilter()" />
				</el-col>
				<el-col :span="4">
					<el-select v-model="selectCase[info.caseName].level" placeholder="請選擇" size="mini" popper-class="type-select" @change="caseFilter()">
						<el-option v-for="order in [0, 3, 2, 1]" :key="order" :value="order" :label="options.levelMap[order]" />
					</el-select>
				</el-col>
			</el-row>
		</el-card>
	</div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader";
import moment from "moment";
import { getDistGeo } from "@/api/type"
import { getRoadCaseGeo, setRoadCase } from "@/api/road";

// 載入 Google Map API
const loaderOpt = {
	apiKey: "",
	version: "weekly",
	language: "zh-TW",
	region: "TW",
	libraries: ["places"]
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
			currCaseId: null,
			dataLayer: {},
			infoWindow: null,
			markers: [],
			polyLines: [],
			geoJSON: {},
			caseInfo: [],
			selectCase: {},
			listQuery: {
				caseId: null
			},
			headers: {
				caseInfo: {
					caseId: "缺失編號",
					caseName: "缺失類型",
					caseLevel: "損壞程度",
					roadName: "道路名稱",
					width: "寬度(cm)",
					depth: "深度(cm)"
				}
			},
			options: { 
				levelMap: {
					0: "全部",
					1: "輕",
					2: "中",
					3: "重"
				},
				colorMap: [
					{
						index: 0,
						name: ["龜裂"],
						color: "#F44336"
					},
					{
						index: 1,
						name: ["裂縫", "縱橫裂縫", "塊狀裂縫"],
						color: "#009688"
					},
					{
						index: 2,
						name: ["坑洞", "人孔高差", "薄層剝離"],
						color: "#FF9800"
					},
					{
						index: 3,
						name: ["車轍"],
						color: "#00BCD4"
					},
					{
						index: 4,
						name: ["補綻", "管線回填"],
						color: "#673AB7"
					},
					{
						index: 5,
						name: ["隆起與凹陷"],
						color: "#8BC34A"
					},
					{	
						index: 6,
						name: ["其他"],
						color: "#607D8B"
					}
				]
			}
		};
	},
	computed: {
		geoJSONFilter() {
			let geoJSONFilter = { features: [] };
			if(Object.keys(this.geoJSON).length > 0) {
				geoJSONFilter = JSON.parse(JSON.stringify(this.geoJSON));
				const selectCaseList = Object.keys(this.selectCase).filter(caseName => this.selectCase[caseName].switch);
				const selectCaseLvMap = selectCaseList.reduce((acc, cur) => { 
					acc[cur] = this.selectCase[cur].level == 0 ? this.selectCase[cur].level : this.options.levelMap[this.selectCase[cur].level];
					return acc
				}, {});

				geoJSONFilter.features = geoJSONFilter.features.filter(feature => {
					const caseName = feature.properties.caseName;
					const caseLevel = feature.properties.caseLevel;
					const levelFilter= selectCaseLvMap[feature.properties.caseName];

					return (selectCaseList.includes(caseName)) && (levelFilter == 0 || caseLevel == levelFilter);
				});
			}
			return geoJSONFilter;
		}
	},
	watch: { },
	created() {},
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
			if (this.$route.query.caseId) {
				this.listQuery.caseId = this.$route.query.caseId;
			}
			this.getList();
		}).catch(err => console.log("err: ", err));
	},
	methods: {
		// init google map
		async initMap() {
			// 預設顯示的地點：台北市政府親子劇場
			// const location = {
			// 	lat: 25.0374865, // 經度
			// 	lng: 121.5647688, // 緯度
			// };
			const location = {
				lat: 25.0685406,
				lng: 121.5280918
			}

			// 建立地圖
			this.map = new google.maps.Map(this.$refs.map, {
				center: location, // 中心點座標
				zoom: 14, // 1-20，數字愈大，地圖愈細：1是世界地圖，20就會到街道
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

			this.infoWindow = new google.maps.InfoWindow({ pixelOffset: new google.maps.Size(0, -10) });
			this.infoWindow.addListener('domready', () => {
				this.infoDelBtn = this.$el.querySelector("#map #info-del-btn");
				if(this.infoDelBtn) this.infoDelBtn.addEventListener("click", this.removeCaseStatus);
			})

			getDistGeo().then(response => {
				this.distGeoJSON = response.data.geoJSON;
				this.dataLayer.mask = new google.maps.Data({ map: this.map });
				this.dataLayer.mask.loadGeoJson("/assets/json/NewTaipei.geojson");
				this.dataLayer.mask.setStyle({
					strokeColor: "#000000",
					strokeWeight: 0,
					strokeOpacity: 1,
					fillColor: "#000000",
					fillOpacity: 0.7,
					zIndex: 0
				});

				this.dataLayer.district = new google.maps.Data({ map: this.map });
				// this.dataLayer.district.loadGeoJson("/assets/json/district.geojson");
				// console.log(JSON.stringify(this.distGeoJSON));
				// console.log(distGeoJSON);
				this.dataLayer.district.addGeoJson(response.data.geoJSON);
				this.dataLayer.district.setStyle(feature => {
					// console.log(feature);
					const condition = feature.j.zipCode == 104;
					return {
						strokeColor: "#827717",
						strokeWeight: 3,
						strokeOpacity: 0.2,
						fillColor: "#000000",
						fillOpacity: condition ? 0 : 0.7,
						zIndex: 0
					}
				});

				this.dataLayer.PCIBlock = new google.maps.Data({ map: this.map });
				this.dataLayer.PCIBlock.loadGeoJson("/assets/json/PCIBlock.geojson");
				this.dataLayer.PCIBlock.setStyle({ 
					strokeColor: '#CFD8DC',
					strokeWeight: 1,
					strokeOpacity: 1,
					fillOpacity: 0,
					zIndex: 1
				});

			});
		},
		getList() {
			// if(this.listQuery.caseId.length != 0 && !Number(this.listQuery.caseId)) {
			// 	this.$message({
			// 		message: "請輸入正確缺失編號",
			// 		type: "error",
			// 	});
			// } else {
				this.loading = true;
				this.clearAll();
				this.markers = [];
				this.polyLines = {};
				// this.$router.push({ query: { caseId: this.listQuery.caseId }});

				getRoadCaseGeo().then(response => {
					if(Object.keys(response.data.geoJSON).length == 0) {
						this.$message({
							message: "查無資料",
							type: "error",
						});
					} else {
						this.caseInfo = response.data.summary;
						this.caseInfo.forEach(info => {
							let color = this.options.colorMap.filter(color => color.name == '其他')[0].color;
							let index = this.options.colorMap.filter(color => color.name == '其他')[0].index;
							if(info.caseName) {
								const colorFilter = this.options.colorMap.filter(color => {
									let caseFlag = false;
									for(const name of color.name) {
										caseFlag = (info.caseName.indexOf(name) != -1);
										// console.log(info.caseName, name, caseFlag);
										if(caseFlag) break;
									}

									return caseFlag; 
								})
								// console.log(colorFilter);
								
								if(colorFilter.length > 0) {
									color = colorFilter[0].color;
									index = colorFilter[0].index;
								}
							}

							this.$set(info, "color", color);
							this.$set(info, "index", index);
							// console.log(JSON.stringify(info));
							this.$set(this.selectCase, info.caseName, { switch: true, level: 0 });
						})

						this.caseInfo.sort((a, b) => (a.index - b.index));

						this.geoJSON = response.data.geoJSON;
						// console.log(this.geoJSON);
						this.map.data.addGeoJson(this.geoJSON);
						// this.map.data.setStyle({ 
						// 	strokeColor: '#009688',
						// 	strokeWeight: 1,
						// 	strokeOpacity: 0.5,
						// 	fillColor: '#EF5350',
						// 	fillOpacity: 0.8
						// });
						this.map.data.setStyle(feature => { 
							// console.log(feature.j.caseName);
							let color = this.options.colorMap.filter(color => color.name == '其他')[0].color;
							if(feature.j.caseName) {
								const colorFilter = this.options.colorMap.filter(color => {
									let caseFlag = false;
									for(const name of color.name) {
										caseFlag = (feature.j.caseName.indexOf(name) != -1);
										// console.log(name, caseFlag);
										if(caseFlag) break;
									}

									return caseFlag; 
								})
								// console.log(colorFilter);
								
								if(colorFilter.length > 0) color = colorFilter[0].color;
							}

							// console.log(color);

							if(feature.j.isLine) {
								return { 
									strokeColor: color,
									strokeWeight: 3,
									strokeOpacity: 1,
									fillOpacity: 0,
									zIndex: 5
								};
							} else {
								return { 
									strokeColor: color,
									strokeWeight: 1,
									strokeOpacity: 1,
									fillColor: color,
									fillOpacity: 0.8,
									zIndex: 5
								};
							}
						});

						this.map.data.addListener('click', (event) => {
							console.log("click: ", event);
							// console.log(this.currCaseId);
							this.showCaseContent(event.feature.j, event.latLng);
						});

						// this.map.data.addListener('rightclick', (event) => {
						// 	console.log("rightclick: ",event);

						// 	this.infoWindow.setContent(event.latLng.toString());
						// 	this.infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -10)});
						// 	this.infoWindow.setPosition(event.latLng);

						// 	this.infoWindow.open(this.map);
						// });
					}
					this.loading = false;
					this.focusCase();
				}).catch(err => this.loading = false);
			// }
		},
		removeCaseStatus() {
			// console.log(this.currCaseId);
			setRoadCase(this.currCaseId, {type: 8}).then(response => {
				if ( response.statusCode == 20000 ) {
					this.$message({
						message: "修改成功",
						type: "success",
					});
					this.getList();
				} 
			}).catch(err => {
				console.log(err);
				this.getList();
			})
		},
		caseFilter() {
			// console.log(this.geoJSON.features);
			this.clearAll();

			// let geoJSONFilter = JSON.parse(JSON.stringify(this.geoJSON));
			// const selectCaseList = Object.keys(this.selectCase).filter(caseName => this.selectCase[caseName]);
			// // console.log(selectCaseList);

			// geoJSONFilter.features = geoJSONFilter.features.filter(feature => selectCaseList.includes(feature.properties.caseName));
			// // console.log(geoJSONFilter);
			this.map.data.addGeoJson(this.geoJSONFilter);
		},
		focusCase() {
			if(this.listQuery.caseId.length == 0) return;
			if(this.listQuery.caseId.length != 0 && !Number(this.listQuery.caseId)) {
				this.$message({
					message: "請輸入正確缺失編號",
					type: "error",
				});
				return;
			} 
			let caseSpec = this.geoJSONFilter.features.filter(feature => (feature.properties.caseId == this.listQuery.caseId))[0];
			if(caseSpec == undefined ) {
				this.$message({
					message: "查無資料",
					type: "error",
				});

				return;
			}

			const depth = caseSpec.properties.isLine ? 1 : 2;
			// console.log(caseSpec.properties.isLine, depth);
			const paths = caseSpec.geometry.coordinates.flat(depth).map(point => ({ lat: point[1], lng: point[0] }));
			// console.log(paths);

			const bounds = new google.maps.LatLngBounds();
			paths.forEach(position => bounds.extend(position));
			this.map.fitBounds(bounds);

			this.showCaseContent(caseSpec.properties, paths[Math.floor(paths.length / 2)]);
		},
		showCaseContent(props, position) {
			this.currCaseId = props.caseId;
			let contentText = `<div style="width: 400px;">`;
			for(const key in this.headers.caseInfo) {
				if(props[key]) {
					contentText += `<div class="el-row" style="margin-bottom: 4px">`;
					contentText += `<div class="el-col el-col-8" style="padding-left: 5px; font-size: 18px; line-height: 18px;">${this.headers.caseInfo[key]}</div>`;
					contentText += `<div class="el-col el-col-16" style="font-size: 18px; line-height: 18px;">${props[key]}</div>`;
					contentText += `</div>`;
				}
			}
			// for(const img of event.feature.j.img) {
			// 	contentText += `<img src="https://img.bellsgis.com/images/casepic_o/${img}" style="object-fit: scale-down;">`
			// }
			contentText += `<img src="https://img.bellsgis.com/images/online_pic/${props.caseId}.jpg" class="img" onerror="this.className='img hide-img'">`;
			contentText += `<button type="button" id="info-del-btn" class="el-button el-button--default" style="height: 38px; width: 38px;"><i aria-hidden="true" class="el-icon-close" style="font-size: 20px; line-height: 40px; color: #EF5350;"></i></button>`;
			contentText += `</div>`;
			// console.log(contentText);
			this.infoWindow.setContent(contentText);
			this.infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -10)});
			this.infoWindow.setPosition(position);

			this.infoWindow.open(this.map);
		},
		clearAll() {
			this.infoWindow.close();
			this.map.data.forEach(feature => this.map.data.remove(feature));
			for(const polyline of Object.values(this.polyLines)) polyline.setMap(null);
			for(const markers of this.markers) markers.setMap(null);
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
.type-select .el-select-dropdown__item
	padding: 0 5px
	text-align: center
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
		width: 250px
		background-color: rgba(white, 0.7)
		z-index: 1
		&.left
			top: 140px
			left: 15px
		&.right
			top: 140px
			right: 20px
		.el-card__body
			padding: 2px
			.color-box
				line-height: 30px
				color: white
				margin-bottom: 2p
			.el-select
				width: 38px
				.el-input__inner
					padding: 0
					text-align: center
					background-color: transparent
					color: #FFF
				.el-input__suffix
					display: none
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
			.img
				width: 100%
				object-fit: scale-down
				&.hide-img
					display: none
			#info-del-btn
				position: absolute
				bottom: 25px
				right: 30px
				background-color: rgba(#fff, 0.3)
				& i.el-icon-close
					font-size: 30px
					color: #EF5350
					position: absolute
					top: 50%
					left: 50%
					transform: translate(-50%, -50%)
</style>