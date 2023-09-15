<template>
	<div class="case-inspection-map" v-loading="loading">
		<div id="map" ref="map" />
		<div class="header-bar">
			<h2 class="case-title">巡查地圖</h2>
			<div class="filter-container">
				<span class="filter-item" style="display: inline-flex">
					<el-button :type="showLayerAttach ? 'primary' : 'info'" @click="beforeShowLayerAttach()">路線圖層</el-button>
					<el-card v-if="showLayerAttach" :body-style="{ padding: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)' }">
						<span v-if="blockInfo.total != 0">覆蓋率: {{ blockInfo.ratio }}% </span>
						<el-button-group>
							<!-- <el-button type="primary" size="small" @click="getRouteList()">載入</el-button> -->
							<el-button type="success" size="small" :disabled="blockList.length == 0" @click="intersectRoute()">比對</el-button>
							<el-button type="info" size="small" :disabled="blockList.length == 0" @click="clearRouteLayer()">清空</el-button>
						</el-button-group>
						<el-divider direction="vertical" />

						<div class="filter-item">
							<el-input v-model="listQuery.filterId" size="small" placeholder="請輸入">
								<span slot="prepend">道路名稱</span>
							</el-input>
						</div>
						<el-button class="filter-item" type="primary" size="small" icon="el-icon-search" @click="search()">搜尋</el-button>
					</el-card>
				</span>
				<br>
				<div v-if="listQuery.tenderRound > 0" class="filter-item">
					<div class="select-contract el-input el-input--medium el-input-group el-input-group--prepend">
						<div class="el-input-group__prepend">
							<span>合約</span>
						</div>
						<el-select v-model.number="listQuery.tenderRound" class="tender-select" popper-class="type-select tender">
							<el-option v-for="(val, type) in options.tenderRoundMap" :key="type" :label="val.name" :value="Number(type)" />
						</el-select>
					</div>
				</div>
				<el-button v-if="listQuery.tenderRound > 0" class="filter-item" type="success" @click="getList()">載入</el-button>
				<br>
				<el-button-group v-if="inspectIdList.length > 0"  style="margin: -5px 0 10px 20px">
					<el-button type="success" size="mini" :plain="listQuery.inspectId != 0" @click="changeInspect(0)">全部</el-button>
					<el-button v-for="inspectId in inspectIdList" :key="inspectId" type="primary" size="mini" :plain="listQuery.inspectId != inspectId" @click="changeInspect(inspectId)">{{ inspectId }}</el-button>
					<el-button type="info" size="mini" @click="changeInspect(-1)">隱藏</el-button>
				</el-button-group>
			</div>
		</div>

		<el-card v-if="caseInfo.length > 0" class="info-box left">
			<el-row style="text-align: center">缺失類型_{{ filterIdNow.length != 0 ? filterIdNow : inspectIdNow == 0 ? '全部' : inspectIdNow }}</el-row>
			<el-row class="color-box active" v-for="(info, index) in caseInfo" :key="`caseInfo_${index}`"  :style="`background-color: ${info.color}; width: 100%; margin-bottom: 0px`">
				<el-col :span="14" style="padding: 0 5px">{{ String(info.caseName) || " - " }}</el-col>
				<el-col :span="10" style="text-align: right; padding: 0 5px">{{ info.total }}</el-col>
			</el-row>
		</el-card>

		<el-card v-if="caseList.length > 0" class="info-box right">
			<el-table 
				empty-text="目前沒有資料" 
				:data="caseList"
				size="mini"
				fit 
				:header-cell-style="{'background-color': '#F2F6FC'}"
				max-height="550px"
				style="width: 100%;"
				@cell-mouse-enter="handleMouseEnter"
				@cell-mouse-leave="handleMouseLeave"
			>
				<el-table-column 
					v-for="(value, key) in headers" 
					:key="key" 
					:prop="key" 
					:label="value"
					:formatter="(row, column, cellValue) => (cellValue != undefined ? cellValue : '-')"
					:width="['caseId', 'caseLevel'].includes(key) ? 70 : null"
					align="center"
					:filters="getFilter(key)"
					:filter-method="handleFilter"
				/>
			</el-table>
		</el-card>

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
import { getPanoramaJson, getInspectionCaseGeoJson, getInspectionRoute } from "@/api/inspection";
import { getTenderRound, getDistMap } from "@/api/type";
import ElImageViewer from 'element-ui/packages/image/src/image-viewer';

// 載入 Google Map API
const loaderOpt = {
	apiKey: "",
	version: "weekly",
	language: "zh-TW",
	region: "TW",
	libraries: ["places", "geocoding"],
};

// apiKey
if(!sessionStorage.devMode && process.env.VUE_APP_MAP_KEY != undefined) loaderOpt.apiKey = process.env.VUE_APP_MAP_KEY;
const loader = new Loader(loaderOpt);

export default {
	name: "caseInspectionMap",
	components: { ElImageViewer },
	data() {
		return {
			loading: false,
			showLayerAttach: false,
			showImgViewer: false,
			// map: null,
			// dataLayer: {},
			// polyLine: {},
			infoWindow: null,
			caseInfo: {},
			caseList: [],
			inspectIdList: [],
			blockList: [],
			caseGeoJson: {},
			inspectIdNow: 0,
			filterIdNow: "",
			listQuery: {
				tenderRound: 91,
				inspectId: 0
			},
			blockInfo: {
				total: 0,
				intersect: 0,
				ratio: 0
			},
			headers: {
				caseId: "Id",
				caseName: "類型",
				caseLevel: "程度"
			},
			options: { 
				tenderRoundMap: { },
				districtMap: { },
				imgTypeMap: {
					"imgZoomIn": "近照",
					"imgZoomOut": "遠照"
				},
				caseColorMap: [
					{
						index: 0,
						name: ["龜裂"],
						color: "#B71C1C"
					},
					{
						index: 1,
						name: ["縱橫裂縫", "縱向及橫向裂縫", "塊狀裂縫"],
						color: "#009688"
					},
					{
						index: 2,
						name: ["坑洞", "人孔高差", "薄層剝離", "人手孔缺失"],
						color: "#FF9800"
					},
					{
						index: 3,
						name: ["車轍", "隆起與凹陷", "推擠", "波浪狀鋪面"],
						color: "#00BCD4"
					},
					{
						index: 4,
						name: ["補綻", "管線回填", "車道與路肩分離"],
						color: "#673AB7"
					},
					{
						index: 5,
						name: ["骨材剝落", "滑溜裂縫"],
						color: "#8BC34A"
					},
					{	
						index: 6,
						name: ["其他"],
						color: "#607D8B"
					}
				],
				caseTypeMap: {
					15: "坑洞",
					29: "縱向及橫向裂縫",
					16: "龜裂",
					32: "車轍",
					18: "隆起與凹陷",
					34: "人手孔缺失(不列入PCI)",
					51: "薄層剝離",
					21: "其他(不列入PCI)",
					50: "塊狀裂縫",
					53: "推擠",
					65: "補綻及管線回填",
					54: "冒油",
					55: "波浪狀鋪面",
					56: "車道與路肩分離",
					49: "滑溜裂縫",
					66: "骨材剝落",
					58: "人孔高差(只列入PCI)"
				},
				caseTypeMapOrder: [ 15, 29, 16, 32, 18, 34, 51, 21, 50, 53, 65, 54, 55, 56, 49, 66, 58 ],
				caseLevelMap: {
					1: "輕",
					2: "中",
					3: "重"
				},
				roadDir: {
					// 0: "無",
					1: "順向",
					2: "逆向"
				}
			}
		};
	},
	computed: { },
	watch: { },
	created() {
		this.dataLayer = { caseNow: {}, route: {} };
		this.polyLine = {};

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
	async mounted() {
		// this.loading = true;
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
			await getDistMap().then(response => {
				Object.keys(response.data.districtMap).filter(key => key != 1000 && key <= 1001).forEach(key => {
					this.$set(this.options.districtMap, key, response.data.districtMap[key]);
				})
			});
		}).catch(err => console.log("err: ", err));
	},
	methods: {
		// init google map
		async initMap() {
			return new Promise(resolve => {
				const location = {
					lat: 25.0685406,
					lng: 121.5280918
				}

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

				// 載入區域GeoJson
				this.dataLayer.mask = new google.maps.Data({ map: this.map });
				// this.dataLayer.mask.loadGeoJson(`/assets/json/NewTaipei.geojson?t=${Date.now()}`);
				this.dataLayer.mask.loadGeoJson(`/assets/json/Taiwan.geojson?t=${Date.now()}`);
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
				// console.log(JSON.stringify(this.distGeoJSON));
				// console.log(distGeoJSON);

				// 缺失
				this.dataLayer.caseNow = new google.maps.Data({ map: this.map });
				this.setDataLayer(this.dataLayer.caseNow);

				// 巡查路線(預定)
				this.dataLayer.route = new google.maps.Data({ map: this.map });
				this.dataLayer.route.setStyle({ 
					strokeColor: '#FFF',
					strokeWeight: 1,
					strokeOpacity: 1,
					fillColor: '#FF8C00',
					fillOpacity: 0.6,
					zIndex: 1
				});
				
				this.infoWindow = new google.maps.InfoWindow({ pixelOffset: new google.maps.Size(0, -10) });
				this.infoWindow.addListener('domready', () => {
					const caseImg = this.$el.querySelector("#map #case-img");
					if(caseImg) {
						const clickHandle = caseImg.addEventListener("click", () => { 
							this.showImgViewer = true;
							caseImg.removeEventListener("click", clickHandle);
						});
					}
				});

				// jsts
				this.geometryFactory = new jsts.geom.GeometryFactory();
				resolve();
			})
		},
		setDataLayer(dataLayer, isPrev=false) {
			dataLayer.setStyle(feature => { 
				// console.log(feature.getProperty("caseName"));
				let color = this.options.caseColorMap.filter(color => color.name == '其他')[0].color;
				if(feature.getProperty("DistressType")) {
					const colorFilter = this.options.caseColorMap.filter(color => {
						let caseFlag = false;
						const distressType = this.options.caseTypeMap[feature.getProperty("DistressType")];
						for(const name of color.name) {
							caseFlag = (distressType.indexOf(name) != -1);
							// console.log(name, caseFlag);
							if(caseFlag) break;
						}

						return caseFlag; 
					})
					// console.log(colorFilter);
					
					if(colorFilter.length > 0) color = colorFilter[0].color;
				}

				// console.log(color);

				if(feature.getProperty("isPoint")) {
					return { 
						icon: { 
							url: `/assets/icon/icon_case_${this.options.caseLevelMap[feature.getProperty("DistressLevel")]}.png`,
							anchor: new google.maps.Point(5, 5),
							scaledSize: new google.maps.Size(25, 25),
						}
					};
				} else if(feature.getProperty("isLine")) {
					return { 
						strokeColor: isPrev ? '#556B2F' : color,
						strokeWeight: 3,
						strokeOpacity: isPrev ? 0.4 : 0.8,
						fillOpacity: 0,
						zIndex: 10
					};
				} else {
					return { 
						strokeColor: isPrev ? '#556B2F' : color,
						strokeWeight: 1,
						strokeOpacity: 1,
						fillColor: color,
						fillOpacity: isPrev ? 0.3 : 0.7,
						zIndex: 10
					};
				}
			});
			dataLayer.addListener('mouseover', (event) => { 
				this.showCaseContent(event.feature, event.latLng);
			});
			dataLayer.addListener('mouseout', (event) => { 
				this.infoWindow.close();
			});
		},
		getList() {
			this.loading = true;
			this.inspectIdList = [];
			this.clearAll();
			const tenderRound = this.options.tenderRoundMap[this.listQuery.tenderRound];

			getPanoramaJson({
				surveyId: tenderRound.id
			}).then(async response => {
				if(response.data.inspection.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
					this.loading = false;
				} else {
					this.dataLayer.district.setStyle(feature => {
						// console.log(feature);
						const condition = tenderRound.zipCode == 1001 || this.options.districtMap[tenderRound.zipCode].district.includes(feature.getProperty("TOWNNAME"));
						return {
							strokeColor: "#827717",
							strokeWeight: 3,
							strokeOpacity: 0.2,
							fillColor: "#000000",
							fillOpacity: condition ? 0 : 0.7,
							zIndex: 0
						}
					});

					this.inspectIdList = response.data.inspection.map(l => l.InspectId);
					let path = [];
					for(const inspecData of response.data.inspection) {
						await fetch(inspecData.url).then(response => response.json()).then(async (json) => {
							const posData = json.data.flat().map(info => info.position);
							path.push(...posData);
							await this.createPolyLine(inspecData.InspectId, json.data);
						});
					}
					this.getCaseList();
					if(this.showLayerAttach) this.getRouteList();
					else this.clearRouteLayer();

					const bounds = new google.maps.LatLngBounds();
					path.forEach(position => {
						if(position.lat >= 22 && position.lat <= 26 && position.lng >= 120 && position.lng <= 122) bounds.extend(position);
					});
					this.map.fitBounds(bounds);

					// this.loading = false;
				}
			}).catch(err => this.loading = false);
		},
		getCaseList() {
			const tenderRound = this.options.tenderRoundMap[this.listQuery.tenderRound];
			getInspectionCaseGeoJson({
				surveyId: tenderRound.id
			}).then(response => {
				this.caseGeoJson[0] = response.data.caseGeoJson.caseNow;
				this.caseGeoJson[0].features.sort((a, b) => (a.properties.DistressType - b.properties.DistressType));
				this.createCaseInfo();
				this.createCaseList();

				for(const inspectId of this.inspectIdList) {
					const featureFilter = response.data.caseGeoJson.caseNow.features.filter(feature => feature.properties.InspectId == inspectId);
					this.caseGeoJson[inspectId] = {
						"type": "FeatureCollection",
						"name": "caseGeoJSON",
						"features": featureFilter
					};
				}
				this.dataLayer.caseNow.addGeoJson(this.caseGeoJson[0]);
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		createCaseInfo(featureList = this.caseGeoJson[this.listQuery.inspectId].features) {
			this.caseInfo = featureList.reduce((acc, cur) => {
				if(acc.length == 0 || acc[acc.length-1].DistressType != cur.properties.DistressType) {
					let color = this.options.caseColorMap.filter(color => color.name == '其他')[0].color;
					let index = this.options.caseColorMap.filter(color => color.name == '其他')[0].index;
					const caseName = this.options.caseTypeMap[cur.properties.DistressType];

					if(caseName != undefined) {
						const colorFilter = this.options.caseColorMap.filter(color => {
							let caseFlag = false;
							for(const name of color.name) {
								caseFlag = (caseName.indexOf(name) != -1);
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

					acc.push({ 
						DistressType: cur.properties.DistressType, 
						caseName, 
						color,
						index,
						total: 1 
					});
				} else acc[acc.length-1].total++;

				return acc
			}, [])

			this.caseInfo.sort((a, b) => (b.total - a.total));
		},
		createCaseList(featureList = this.caseGeoJson[this.listQuery.inspectId].features) {
			this.caseList = featureList.map(feature => ({
				caseId: feature.properties.Id,
				caseName: this.options.caseTypeMap[feature.properties.DistressType],
				caseLevel: this.options.caseLevelMap[feature.properties.DistressLevel]
			}));

			this.caseInfo.sort((a, b) => (b.total - a.total));
		},
		getFilter(property) {
			if(property == 'caseName') return this.caseInfo.map(caseSpec => ({ text: caseSpec.caseName, value: caseSpec.caseName }));
			else if(property == 'caseLevel') return Object.keys(this.options.caseLevelMap).map(key => ({ text: this.options.caseLevelMap[key], value: this.options.caseLevelMap[key] }));
			else return null;
		},
		handleFilter(value, row, column) {
			return row[column.property] === value;
		},
		handleMouseEnter(row, column, cell, event) {
			let featureList = [];
			this.dataLayer.caseNow.forEach(feature =>{ 
				if(feature.getProperty("Id") == row.caseId) featureList.push(feature);
			});
			const bounds = new google.maps.LatLngBounds();
			for(const feature of featureList) {
				this.dataLayer.caseNow.overrideStyle(feature, { strokeColor: "#8FBC8F", strokeWeight: 4 });
				const paths = feature.getGeometry();
				this.showCaseContent(feature, feature.getProperty("CenterPt"));
				// console.log(paths);
				paths.forEachLatLng(position => bounds.extend(position));
			}
			this.map.fitBounds(bounds);
		},
		handleMouseLeave(row, column, cell, event) {
			// console.log(row.blockId);
			this.dataLayer.caseNow.revertStyle();
		},
		getRouteList() {
			this.loading = true;
			this.dataLayer.route.forEach(feature => this.dataLayer.route.remove(feature));
			const tenderRound = this.options.tenderRoundMap[this.listQuery.tenderRound];

			getInspectionRoute({
				zipCode: tenderRound.zipCode,
				inspectRound: 0,
			}).then(response => {
				if (response.data.blockList.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.blockList = response.data.blockList;

					let geoJSON = {
						"type": "FeatureCollection",
						"name": "blockJSON",
						"features": []
					};

					for (const blockSpec of this.blockList) {
						let feature = {
							"type": "Feature",
							"properties": {
								"id": blockSpec.id,
								"roadName": blockSpec.roadName
							},
							"geometry": JSON.parse(blockSpec.geometry)
						};
						geoJSON.features.push(feature);
					}
					this.dataLayer.route.addGeoJson(geoJSON);
				}
				this.loading = false;
			}).catch(err => this.loading = false);
		},
		clearRouteLayer() {
			this.blockInfo = { total: 0, intersect: 0, ratio: 0 };
			this.filterIdNow = "";

			this.dataLayer.route.forEach(feature => this.dataLayer.route.remove(feature));
			this.showLayerAttach = false;
		},
		beforeShowLayerAttach() {
			this.showLayerAttach = !this.showLayerAttach; 
			this.filterIdNow = "";
			if(this.showLayerAttach) this.getRouteList();
			else this.clearRouteLayer();
		},
		changeInspect(inspectId) {
			for(const key in this.polyLine) for(const polyline of this.polyLine[key]) polyline.setMap(inspectId == 0 ? this.map : null);
			this.listQuery.inspectId = inspectId;

			if(inspectId == -1) return;
			else this.inspectIdNow = inspectId;

			this.loading = true;
			this.createCaseInfo();
			this.createCaseList();
			if(inspectId != 0) for(const polyLine of this.polyLine[inspectId]) polyLine.setMap(this.map);

			this.dataLayer.caseNow.forEach(feature => this.dataLayer.caseNow.remove(feature));
			this.dataLayer.caseNow.addGeoJson(this.caseGeoJson[inspectId]);

			this.loading = false;
		},
		async search() {
			this.loading = true;
			await this.focusMap();
			this.loading = false;
		},
		async focusMap() {
			return new Promise(resolve => {
				// console.log("focusMap");
				this.dataLayer.route.revertStyle();
				this.filterIdNow = "";

				if(!this.listQuery.filterId || this.listQuery.filterId.length == 0) resolve();
				else {
					let featureList = [];
					this.dataLayer.route.forEach(feature =>{ 
						if(feature.getProperty("roadName") == this.listQuery.filterId) featureList.push(feature);
					});

					if(featureList.length == 0) {
					// if(blockSpec == undefined ) {
						this.$message({
							message: "查無資料",
							type: "error",
						});
						resolve();
					} else {
						this.filterIdNow = this.listQuery.filterId;
						this.intersectCase();

						const bounds = new google.maps.LatLngBounds();
						for(const feature of featureList) {
							this.dataLayer.route.overrideStyle(feature, { fillColor: "#87CEEB", strokeWeight: 1,  zIndex: 3 });
							const paths = feature.getGeometry();
							// console.log(paths);
							paths.forEachLatLng(position => bounds.extend(position));
						}
						this.map.fitBounds(bounds);
						resolve();	
					}
				}
			})
		},
		async createPolyLine(inspectId, lineInfo) {
			// 掛載 polyline Layer(street view)
			lineInfo.forEach((polyInfo, index) => {
				const path = polyInfo.map((info) => info.position);
				if(this.polyLine[inspectId] == undefined) this.polyLine[inspectId] = [];
				this.polyLine[inspectId].push(
					new google.maps.Polyline({
						path,
						geodesic: true,
						strokeColor: '#409EFF',
						strokeOpacity: 1,
						strokeWeight: 3,
						map: this.map,
						zIndex: 10
					})
				);
			})
		},
		showCaseContent(feature, position) {
			const caseTypeStr = `${feature.getProperty("Id")} - ${this.options.caseTypeMap[feature.getProperty("DistressType")]} (${this.options.caseLevelMap[feature.getProperty("DistressLevel")]})`;
			this.setCaseImgViewer({ imgUrls: [ `${feature.getProperty("ImgZoomOut")}` ] });
			let contentText = `<div style="width: 200px;">`;
			contentText += `<div> ${caseTypeStr} </div>`;
			contentText += `<img src="${feature.getProperty("ImgZoomOut")}" class="case-img" id ="case-img" onerror="this.className='case-img hide-img'">`;
			contentText += `</div>`;

			this.infoWindow.setContent(contentText);
			this.infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -10)});
			this.infoWindow.setPosition(position);

			this.infoWindow.open(this.map);
		},
		setCaseImgViewer({ imgUrls, isOpen=false }) {
			if(imgUrls != null) this.imgUrls = imgUrls;
			this.showImgViewer = isOpen;
		},
		intersectRoute() {
			this.blockInfo = { total: 0, intersect: 0, ratio: 0 };

			this.dataLayer.route.revertStyle();
			let polyLineArr = [];
			if(this.listQuery.inspectId == 0) polyLineArr = Object.values(this.polyLine).flat(1);
			else polyLineArr = this.polyLine[this.listQuery.inspectId];

			const jstsRoutePoints = polyLineArr.flat(1).map(polyLine => polyLine.getPath().getArray()).flat(1).map(pos => this.createJstsGeometry([[ pos.lng(), pos.lat() ]]));

			this.dataLayer.route.forEach(feature => {
				this.blockInfo.total++;

				feature.toGeoJson(json => {
					const jstsBlockPolygon = this.createJstsGeometry(json.geometry.coordinates.flat(2));
					for(let i=0; i <= jstsRoutePoints.length - 1; i++) {
						// console.log(i);
						if(i == 0) this.loading = true;
						if(jstsBlockPolygon.contains(jstsRoutePoints[i])) {
							// console.log("BINGO: ", i);
							this.blockInfo.intersect++;
							this.dataLayer.route.overrideStyle(feature, { fillColor: "#8FBC8F" });
							this.loading = false;
							break;
						} else if(i == jstsRoutePoints.length - 1) {
							this.dataLayer.route.overrideStyle(feature, { fillColor: "#DC143C" });
							this.loading = false;
						}
					}
					this.$set(this.blockInfo, "ratio", Math.round(this.blockInfo.intersect / this.blockInfo.total * 10000) / 100);
				});
			})
		},
		intersectCase() {
			const jstsBlockPolygon = this.blockList
				.filter(block => block.roadName == this.listQuery.filterId)
				.map(block => this.createJstsGeometry(JSON.parse(block.geometry).coordinates.flat(2)));

			let featureList = [];
			this.dataLayer.caseNow.forEach(feature => {
				feature.toGeoJson(json => {
					const flatNum = (json.geometry.type == 'MultiLineString') ? 1 : 2;
					const jstsCasePolygon = this.createJstsGeometry(json.geometry.coordinates.flat(flatNum));

					for(let i=0; i <= jstsBlockPolygon.length - 1; i++) {
						// console.log(i);
						if(i == 0) this.loading = true;
						if(jstsCasePolygon.intersects(jstsBlockPolygon[i])) {
							// console.log("BINGO: ", json);
							featureList.push(json);
							// console.log(featureList);
							this.createCaseInfo(featureList);
							this.createCaseList(featureList);
							// this.dataLayer.caseNow.overrideStyle(feature, { strokeColor: "#8FBC8F", strokeWeight: 4 });
							this.loading = false;
							break;
						} else if(i == jstsCasePolygon.length - 1) {
							this.loading = false;
						}
					}
				});
			})
		},
		createJstsGeometry(boundary) {
			// console.log(boundary);
			let coordinates = boundary.map(coord => new jsts.geom.Coordinate(coord[1], coord[0]));

			if (coordinates.length == 1) return this.geometryFactory.createPoint(coordinates[0]);
			else if (coordinates.length >= 4) {
				if(coordinates[0].compareTo(coordinates[coordinates.length-1]) != 0) coordinates.push(coordinates[0]);
				const shell = this.geometryFactory.createLinearRing(coordinates);
				return this.geometryFactory.createPolygon(shell);
			} else {
				return this.geometryFactory.createLineString(coordinates);
			}
		},
		clearAll() {
			// console.log("clearAll");
			this.listQuery.inspectId = 0;
			this.blockInfo = { total: 0, intersect: 0, ratio: 0 };

			this.dataLayer.caseNow.forEach(feature => this.dataLayer.caseNow.remove(feature));
			this.caseGeoJson = {};
			this.caseInfo = {};

			for(const key in this.polyLine) for(const polyline of this.polyLine[key]) polyline.setMap(null);
			this.polyLine = {};

			this.dataLayer.route.revertStyle();
		},
	},
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.case-inspection-map
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
		.el-select.tender-select
			width: 400px
			.el-input__inner
				padding-left: 8px
				padding-right: 10px
			.el-input__suffix
				right: 0
				margin-right: -3px
				transform: scale(0.7)
		.select-district
			.el-select .el-input__inner
				border-top-left-radius: 0
				border-bottom-left-radius: 0
				padding-left: 10px
				text-align: left
	.info-box
		position: absolute
		width: 250px
		background-color: rgba(white, 0.7)
		z-index: 1
		&.right
			top: 120px
			right: 15px
		&.left
			top: 220px
			left: 15px
		.el-card__body
			padding: 2px
			max-height: 600px
			overflow-x: hidden
			overflow-y: auto
			.info-title
				text-align: center
				margin-bottom: 0
				line-height: 24px
			.color-box
				line-height: 30px
				*
					color: #ECEFF1
					text-shadow: 0px 0px 1px rgba(#263238, 0.6)
			.el-table
				.el-table__body
					width: 100% !important
					.el-table__row
						cursor: pointer
	.img-preview
		width: 100%
		.el-image-viewer__mask
			opacity: 0.7
		.el-icon-circle-close
			color:  #FFF
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
			.case-img
				cursor: pointer
				width: 100%
				object-fit: scale-down
				&.hide-img
					display: none
</style>