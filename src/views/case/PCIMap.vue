<template>
	<div class="PCI-map" v-loading="loading">
		<div id="map" ref="map" />
		<div class="header-bar">
			<h2 class="map-title">查核地圖</h2>
			<div class="filter-container">
				<div class="filter-item">
					<el-input v-model="listQuery.filterId" placeholder="請輸入">
						<!-- <span slot="prepend">缺失編號</span> -->
						<el-select slot="prepend" v-model="listQuery.filterType" popper-class="type-select">
							<el-option label="區塊編號" :value="1" />
							<el-option label="道路名稱" :value="2" />
						</el-select>
					</el-input>
				</div>
				<el-button class="filter-item" type="primary" size="small" icon="el-icon-search" @click="search()">搜尋</el-button>
			</div>
		</div>

		<!-- <el-card class="info-box right">
			<div class="color-box" v-for="(color, index) in options.colorMap" :key="`color_${index}`"  :style="`background-color: ${color.color}; width: 100%; height: 30px;`">{{ color.name.join("、") }}</div>
		</el-card> -->

		<div class="info-box left">
			<el-card>
				<el-collapse>
					<el-collapse-item class="collapse-label" title="鋪面狀況指數">
						<el-row class="color-box" v-for="key in [ 6, 5, 4, 3, 2, 1, 0 ]" :key="`PCILevel_${key}`"  :style="`background-color: ${options.PCILevel[key].color}; width: 100%; margin-bottom: 0px`">
							<el-col :span="7" style="padding: 0 5px">{{ options.PCILevel[key].description }}</el-col>
							<el-col :span="7">({{ options.PCILevel[key].range[0] }} - {{ options.PCILevel[key].range[1] }})</el-col>
							<el-col :span="10">{{ options.PCILevel[key].total }}</el-col>
						</el-row>
					</el-collapse-item>
					<el-collapse-item class="collapse-label" title="缺失類型">
							<el-row :class="[ 'color-box', { 'active' : selectCase[info.caseName].switch } ]" v-for="(info, index) in caseInfo" :key="`caseInfo_${index}`"  :style="`background-color: ${info.color}; width: 100%; margin-bottom: 0px`">
								<el-col :span="10" style="padding: 0 5px">{{ String(info.caseName) || " - " }}</el-col>
								<el-col :span="14">{{ info.total }}</el-col>
							</el-row>
					</el-collapse-item>
				</el-collapse>
			</el-card>
		</div>

		<el-image-viewer
			v-if="showImgViewer"
			class="img-preview"
			:on-close="() => { showImgViewer = false; }"
			:url-list="imgUrls"
		/>
	</div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader";
import moment from "moment";
// import { getDistGeo } from "@/api/type";
import { getPCIBlock, getRoadCaseGeo } from "@/api/road";
import { calPCI } from "@/api/tool";
import ElImageViewer from 'element-ui/packages/image/src/image-viewer';

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
	name: "PCIMap",
	components: { ElImageViewer },
	data() {
		return {
			loading: false,
			showImgViewer: false,
			screenWidth: window.innerWidth,
			// map: null,
			imgUrls: [],
			// dataLayer: {},
			infoWindow: null,
			markers: [],
			polyLines: [],
			// geoJSON: {},
			caseInfo: [],
			selectCase: {},
			listQuery: {
				filterType: 1,
				filterId: null
			},
			headers: {
				// PCIInfo
				blockId: "區塊編號",
				roadName: "道路名稱",
				PCIValue: "PCI",

				// caseInfo
				caseId: "缺失編號",
				caseName: "缺失類型",
				caseLevel: "損壞程度",
				length: "長度(m)",
				area: "面積(㎡)",
				depth: "深度(cm)"
			},
			options: { 
				PCILevel: {
					6: {
						text: "veryGood",
						description: "很好",
						range: [ 85, 100 ],
						color: "#00B900",
						total: 0
					},
					5: {
						text: "good",
						description: "好",
						range: [ 70, 85 ],
						color: "#C1FE00",
						total: 0
					},
					4: {
						text: "fair",
						description: "尚可",
						range: [ 55, 70 ],
						color: "#FEFE00",
						total: 0
					},
					3: {
						text: "poor",
						description: "差",
						range: [ 40, 55 ],
						color: "#F40088",
						total: 0
					},
					2: {
						text: "veryPoor",
						description: "很差",
						range: [ 25, 40 ],
						color: "#F40000",
						total: 0
					},
					1: {
						text: "serious",
						description: "嚴重",
						range: [ 10, 25 ],
						color: "#A72126",
						total: 0
					},
					0: {
						text: "failed",
						description: "不合格",
						range: [ 0, 10 ],
						color: "#666666",
						total: 0
					},
				},
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
						color: "#B71C1C"
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
	computed: { },
	watch: { },
	created() {
		this.dataLayer = { 
			PCIBlock: {}
		};
		this.geoJSON = {};
	},
	async mounted() {
		this.loading = true;
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
			if (this.$route.query.blockId) {
				this.listQuery.filterType = 1;
				this.listQuery.filterId = this.$route.query.blockId;
			} else if (this.$route.query.roadName) {
				this.listQuery.filterType = 2;
				this.listQuery.filterId = this.$route.query.roadName;
			}
			this.getList();
		}).catch(err => console.log("err: ", err));
	},
	methods: {
		// init google map
		async initMap() {
			return new Promise(resolve => {
				// console.log("initMap");
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
					const infoDelBtn = this.$el.querySelector("#map #info-del-btn");
					if(infoDelBtn) infoDelBtn.addEventListener("click", this.removeCaseStatus);

					const infoScrnFullBtn = this.$el.querySelector("#map #info-scrn-full-btn");
					if(infoScrnFullBtn) infoScrnFullBtn.addEventListener("click", () => { this.showImgViewer = true });
				});
				resolve();

				// 載入區域GeoJson
				this.dataLayer.mask = new google.maps.Data({ map: this.map });
				this.dataLayer.mask.loadGeoJson(`/assets/json/NewTaipei.geojson?t=${Date.now()}`);
				this.dataLayer.mask.setStyle({
					strokeColor: "#000000",
					strokeWeight: 0,
					strokeOpacity: 1,
					fillColor: "#000000",
					fillOpacity: 0.7,
					zIndex: 0
				});

				this.dataLayer.district = new google.maps.Data({ map: this.map });
				this.dataLayer.district.loadGeoJson(`/assets/json/district.geojson?t=${Date.now()}`);
				this.dataLayer.district.setStyle(feature => {
					// console.log(feature);
					const condition = feature.j.TOWNNAME == '中山區'
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
				this.dataLayer.case = new google.maps.Data({ map: this.map });
			})
		},
		async getList() {
			this.loading = true;
			this.clearAll();

			// 載入case GeoJSON
			this.markers = [];
			this.polyLines = {};
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

					this.geoJSON.case = JSON.parse(response.data.geoJSON);
					// console.log(this.geoJSON.case);
					this.dataLayer.case.addGeoJson(this.geoJSON.case);

					this.dataLayer.case.setStyle(feature => { 
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
								strokeColor: '#BDBDBD',
								strokeWeight: 1,
								strokeOpacity: 1,
								fillColor: color,
								fillOpacity: 1,
								zIndex: 5
							};
						}
					});

					this.dataLayer.case.addListener('click', (event) => {
						this.showContent(event.feature.j, event.latLng);
					});
				}
			}).catch(err => this.loading = false);

			// 載入PCI切塊 GeoJson
			getPCIBlock().then(async (response) => {
				// console.log("getPCIBlock");
				if(Object.keys(response.data.geoJSON).length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					const summary = response.data.summary[0];
					Object.keys(this.options.PCILevel).forEach(key => {
						const levelText = this.options.PCILevel[key].text;
						this.options.PCILevel[key].total = summary[levelText];
					})
					
					this.geoJSON.block = JSON.parse(response.data.geoJSON);
					this.dataLayer.PCIBlock.addGeoJson(this.geoJSON.block);
					this.dataLayer.PCIBlock.setStyle(feature => {
						// console.log(feature);
						const PCISpec = feature.j.PCIValue;
						let  filterLevel = [];
						if(PCISpec == -1) filterLevel = [[ "-1", { description: "不合格", color: '#666666' }]];
						else if(PCISpec == 100) filterLevel = [[ "6", { description: "很好", color: '#00B900' }]];
						else filterLevel = Object.entries(this.options.PCILevel).filter(([key, level]) => {	
							// console.log(level, PCISpec);
							return PCISpec >= level.range[0] && PCISpec < level.range[1]
						});
						// console.log(filterLevel);

						return {
							strokeColor: '#FFF',
							strokeWeight: 1,
							strokeOpacity: 1,
							fillColor: filterLevel[0][1].color,
							fillOpacity: filterLevel[0][0] != -1 ? 1 - filterLevel[0][0] * 0.1 : 0.4,
							zIndex: filterLevel[0][0] != -1 ? 2 : 1
						}
					});

					this.dataLayer.PCIBlock.addListener('click', (event) => {
						this.showContent(event.feature.j, event.latLng);
					});

					await this.focusMap();
					this.loading = false;
				}
			})
		},
		async search() {
			this.loading = true;
			await this.focusMap();
			this.loading = false;
		},
		async focusMap() {
			// console.log("focusMap");
			return new Promise(resolve => {
				this.dataLayer.PCIBlock.revertStyle();

				if(!this.listQuery.filterId || this.listQuery.filterId.length == 0) resolve();
				if(this.listQuery.filterType == 1 && this.listQuery.filterId.length != 0 && !Number(this.listQuery.filterId)) {
					this.$message({
						message: "請輸入正確編號",
						type: "error",
					});
					resolve();
				} else {
					const key = this.listQuery.filterType == 1 ? 'blockId' : 'roadName';
					let query = {};
					query[key] = this.listQuery.filterId;
					this.$router.push({ query });

					// let blockSpec;
					// this.dataLayer.PCIBlock.forEach(features =>{ 
					// 	if(features.j[key] == this.listQuery.filterId) blockSpec = features;
					// });

					let featureList = [];
					this.dataLayer.PCIBlock.forEach(feature =>{ 
						if(feature.j[key] == this.listQuery.filterId) featureList.push(feature);
					});
					
					// if(blockSpec != undefined ) {
					for(const feature of featureList) {
						this.dataLayer.PCIBlock.overrideStyle(feature, { strokeColor: "#FF6F00", zIndex: 3 });
					}
					
					if(featureList.length == 0) {
					// if(blockSpec == undefined ) {
						this.$message({
							message: "查無資料",
							type: "error",
						});

						resolve();
					}

					// const paths = blockSpec.geometry.coordinates.flat(2).map(point => ({ lat: point[1], lng: point[0] }));
					// const paths = blockSpec.getGeometry();
					const paths = featureList[0].getGeometry();
					// console.log(paths);

					const bounds = new google.maps.LatLngBounds();
					// paths.forEach(position => bounds.extend(position));
					paths.forEachLatLng(position => bounds.extend(position));
					this.map.fitBounds(bounds);

					resolve();	
				}
			})
		},
		showContent(props, position) {
			// console.log(props);
			this.imgUrls = [ `https://img.bellsgis.com/images/online_pic/${props.caseId}.jpg` ];
			let contentText = `<div style="width: 400px;">`;
			for(const key in this.headers) {
				// console.log(key);
				if(props[key]) {
					contentText += `<div class="el-row" style="margin-bottom: 4px">`;
					contentText += `<div class="el-col el-col-8" style="padding-left: 5px; font-size: 18px; line-height: 18px;">${this.headers[key]}</div>`;
					contentText += `<div class="el-col el-col-16" style="font-size: 18px; line-height: 18px;">${props[key]}</div>`;
					contentText += `</div>`;
				}
			}

			contentText += `<img src="https://img.bellsgis.com/images/online_pic/${props.caseId}.jpg" class="img" onerror="this.className='img hide-img'">`;
			contentText += `<button type="button" id="info-scrn-full-btn" class="info-btn scrn-full el-button el-button--default" style="height: 30px; width: 30px;"><i class="el-icon-full-screen btn-text"></i></button></img>`;
			contentText += `</div>`;
			// console.log(contentText);
			this.infoWindow.setContent(contentText);
			this.infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -10)});
			this.infoWindow.setPosition(position);

			this.infoWindow.open(this.map);
		},
		clearAll() {
			this.infoWindow.close();

			for(const layer of Object.values(this.dataLayer)) layer.forEach(feature => this.dataLayer.case.remove(feature));
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
.PCI-map
	position: relative
	height: 100%
	width: 100%
	.header-bar
		position: absolute
		top: 0
		z-index: 1
		padding-left: 10px
		.map-title
			text-shadow: 0px 0px 5px white
			text-stroke: 0.6px white
			-webkit-text-stroke: 0.6px white
		.filter-item.filter
			position: relative
			margin: -8px 10px auto 5px
			& > div:first-child
				display: inline-block
				width: auto
				padding: 0 5px
				color: #bbb
				font-size: 12px
				// background-color: white
		.el-select
			width: 85px
			.el-input__inner
				padding-left: 8px
				padding-right: 10px
			.el-input__suffix
				right: 0
				margin-right: -3px
				transform: scale(0.7)
	.info-box
		position: absolute
		width: 250px
		// background-color: rgba(white, 0.7)
		z-index: 1
		&.left
			top: 140px
			left: 15px
		&.right
			top: 140px
			right: 20px
		.collapse-label
			width: 100%
			.el-collapse-item__header
				padding: 5px
				&.is-active
					transition: 0.5s
			.el-collapse-item__content
				height: 100%
				padding-bottom: 0
		.el-card__body
			padding: 2px
			.info-title
				text-align: center
				margin-bottom: 0
				line-height: 24px
			.color-box
				line-height: 30px
				*
					color: #ECEFF1
					text-shadow: 0px 0px 1px rgba(#263238, 0.6)
				div:last-child
					text-align: right
					padding-right: 5px
			.el-switch .el-switch__core
				border: 1px solid #DCDFE6 !important
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
			.info-btn
				position: absolute
				right: 30px
				&.scrn-full
					padding: 0
					bottom: 25px
					background-color: rgba( #FFF, 0.3)
					border-color:  #FFF
				& .btn-text
					position: absolute
					top: 50%
					left: 50%
					transform: translate(-50%, -50%)
					font-size: 14px
					line-height: 20px
					color: #EF5350
					&.el-icon-full-screen
						color:  #FFF
						line-height: 30px
						font-size: 20px
						width: 30px
</style>