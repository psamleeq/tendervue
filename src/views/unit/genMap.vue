<template>
	<div class="road-unitGen" v-loading="loading">
		<div id="map" ref="map" />
		<div class="header-bar">
			<h2 class="road-title">維護單元產生</h2>
			<div class="filter-container">
				<div class="filter-item">
					<el-input v-model="listQuery.roadId" placeholder="請輸入">
						<span slot="prepend">道路Id</span>
					</el-input>
				</div>
				<el-button class="filter-item" type="primary" size="small" icon="el-icon-search" @click="getList();">搜尋</el-button>

				<div class="filter-item step-box">
					<el-steps :active="stepOrder" simple>
						<el-step icon="el-icon-add-location" @click.native="switchStep(0)">
							<template slot="title">
								<div>{{ geoInfo.roadName || " - " }}</div>
								<div>{{ geoInfo.area.toLocaleString() }} ㎡ </div>
							</template>
						</el-step>
						<el-step icon="el-icon-edit-outline" @click.native="switchStep(1)">
							<template slot="title">
								<div>切分距離</div>
								<div>{{ listQuery.splitLen }} m </div>
							</template>
						</el-step>
						<el-step icon="el-icon-upload" @click.native="switchStep(2)">
							<template slot="title">
								<div>區塊數量</div>
								<div>{{ geoInfo.blocks.length }}</div>
							</template>
						</el-step>
					</el-steps>
				</div>
			</div>
		</div>

		<div class="info-box">
			<el-card v-if="stepOrder == 0 && geoInfo.roadName.length != 0" class="road-info">
				<div slot="header" class="info-title">道路資訊</div>
				<el-row v-for="(text, key) in headersInfo.road" :key="key">
					<el-col :span="8">{{ text }}: </el-col>
					<el-col :span="16">
						<span v-if="key == 'area'">{{ geoInfo[key].toLocaleString() }} ㎡</span>
						<span v-else>{{ geoInfo[key] }}</span>
					</el-col>
				</el-row>
				<el-row>
					<el-col :offset="18">
						<el-button type="success" size="small" icon="el-icon-check" :disabled="geoInfo.points.length == 0" @click="splitLines()">線段</el-button>
					</el-col>
				</el-row>
			</el-card>

			<el-card v-if="stepOrder == 1 && geoInfo.lines.length != 0" class="road-info">
				<div slot="header">
					<div class="info-title">線段資訊</div>
					<div class="info-btn">
						<el-input 
							v-model="listQuery.splitLen"
							type="number"
							:min="0"
							placeholder="公尺"
							@blur="() => { if (listQuery.splitLen < 0) listQuery.splitLen = 0; }"
						>
							<span slot="prepend">切分距離</span>
						</el-input>
						<el-button type="success" size="small" icon="el-icon-check" style="margin-left: 5px" @click="createBlocks()">切分</el-button>
					</div>
				</div>
				<el-button class="btn-switch-line" type="info" icon="el-icon-refresh" circle plain size="mini" @click="switchLines" />
				<el-collapse accordion>
					<el-collapse-item :class="[ 'line-label', { 'base' : id == listQuery.baseLineId } ]" v-for="(line, id) in geoInfo.lines" :key="`lines_${id}`" :name="`lines_${id}`">
						<template slot="title">
							<el-radio v-model="listQuery.baseLineId" :label="Number(id)">線段{{ id }}({{ line.range[0] }} - {{ line.range[1] }}) - {{ line.len.toLocaleString() }}m</el-radio>
						</template>
						<el-row v-for="(point, index) in line.points" :key="`point_${index}`" type="flex" justify="center" align="middle">
							<el-col :span="6">
								<el-checkbox-group v-model="selectPt[id]" style="display: inline-flex; width: 100%;" @change="resetLines()">
									<el-checkbox style="margin: auto" :label="lineIndex(line.range[0], index) " :key="`checkBox_${index}`">{{ lineIndex(line.range[0], index) }}</el-checkbox>
								</el-checkbox-group>
							</el-col>
							<el-col :span="18">{{ [ point.lng, point.lat ] }}</el-col>
						</el-row>
					</el-collapse-item>
				</el-collapse>
			</el-card>

			<el-card v-if="stepOrder == 2 && geoInfo.blocks.length != 0" class="road-info">
				<div slot="header">
					<el-row>
						<el-col :span="18" class="info-title">切塊資訊</el-col>
						<el-col :span="6">
							<el-button type="success" size="small" icon="el-icon-check" style="margin-left: 5px" @click="setBlock()">送出</el-button>
						</el-col>
					</el-row>
				</div>
				<el-table
					ref="blockTable"
					empty-text="目前沒有資料"
					:data="geoInfo.blocks"
					fit
					highlight-current-row
					:header-cell-style="{'background-color': '#F2F6FC'}"
					:row-class-name="({row, rowIndex})=>{row.index = rowIndex; return 'blockTableRow';}"
					style="width: 100%"
					@selection-change="(selection) => selectBlock = selection"
					@cell-mouse-enter="handleMouseEnter"
					@cell-mouse-leave="handleMouseLeave"
				>
					<el-table-column type="selection" width="50" align="center" />
					<el-table-column
						v-for="(text, key) in headersInfo.block"
						:key="key"
						:prop="key"
						:label="text"
						align="center"
						:formatter="formatter"
					/>
				</el-table>
			</el-card>
		</div>
	</div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader";
import moment from "moment";
const { calcDistance, calArea } = require('@/utils/geo-tools');
import { getRoadUnitGeo } from "@/api/road";

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
	name: "roadUnitGen",
	components: { },
	data() {
		return {
			loading: false,
			screenWidth: window.innerWidth,
			stepOrder: 0,
			areaLimit: [139, 325],
			map: null,
			markers: [],
			polyLines: [],
			boundaryJSON: {},
			geoJSON_Ori: {},
			geoJSON_Split: {},
			geoInfo: {
				roadName: "",
				area: 0,
				points: [],
				lines: [],
				blocks: []
			},
			isShortBound: false,
			boundary: [],
			listQuery: {
				roadId: null,
				splitLen: 20,
				baseLineId: 1
			},
			selectPt: {},
			selectBlock: [],
			lineFilter: {},
			headersInfo: {
				road: {
					roadName: "道路名稱",
					area: "面積"
				},
				// line: {
				// 	index: "序號",
				// 	point: "座標"
				// },
				block: {
					blockId: "單位編碼",
					area: "面積"
				}
			},
			options: {
				line: {
					base: {
						color: "#EF5350",
						width: 6
					},
					others: {
						color: "#827717",
						width: 5
					}
				}
			},
			iconStyle: { }
		};
	},
	computed: { },
	watch: {
		"listQuery.baseLineId"() {
			for(const [ id, polyline ] of Object.entries(this.polyLines)) {
				polyline.setOptions({ 
					strokeColor: id == this.listQuery.baseLineId ? this.options.line.base.color : this.options.line.others.color,
					strokeWeight: id == this.listQuery.baseLineId ? this.options.line.base.width : this.options.line.others.width,
				});
			}
		}
	},
	created() { },
	mounted() {
		// Google Map錯誤處理
		window.gm_authFailure = () => { 
			console.log("Google Map Failure");
			// session.devMode: 時效5分鐘
			sessionStorage.devMode = true;
			sessionStorage.dueTime = new Date().getTime() + (5*60*1000);
			location.reload();
		};

		// 初始化Google Map
		loader.load().then(() => {
			this.initMap();
			if (this.$route.query.roadId) {
				this.listQuery.roadId = this.$route.query.roadId;
				this.getList();
			}
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
				maxZoom: 30,
				minZoom: 13,
				/*
					roadmap 顯示默認道路地圖視圖。
					satellite 顯示 Google 地球衛星圖像。
					hybrid 顯示正常和衛星視圖的混合。
					terrain 顯示基於地形信息的物理地圖。
				*/
				mapTypeId: "hybrid",
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
						stylers: [{ color: "#314054"}]
					},
					{
						elementType: "labels.text.fill",
						stylers: [{ color: "#746855" }]
					},
					{
						elementType: "labels.text.stroke",
						stylers: [{ color: "#242F3E" }]
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
						stylers: [{ color: "#38414E" }]
					},
					{
						featureType: "road",
						elementType: "geometry.stroke",
						stylers: [{ color: "#212A37" }]
					},
					{
						featureType: "road",
						elementType: "labels",
						stylers: [{ visibility: "off" }]
					},
					{
						featureType: "road.highway",
						elementType: "geometry",
						stylers: [{ color: "#746855" }]
					},
					{
						featureType: "road.highway",
						elementType: "geometry.stroke",
						stylers: [{ color: "#1F2835" }]
					},
					{
						featureType: "road.highway",
						elementType: "labels.text.fill",
						stylers: [{ color: "#F3D19C" }]
					},
					{
						featureType: "road.local",
						elementType: "labels",
						stylers: [{ visibility: "off" }]
					},
					{
						featureType: "transit",
						elementType: "all",
						stylers: [{ visibility: "off" }],
					},
					// {
					// 	featureType: "water",
					// 	elementType: "geometry",
					// 	stylers: [{ color: "#17263C" }]
					// },
					// {
					// 	featureType: "water",
					// 	elementType: "labels.text.fill",
					// 	stylers: [{ color: "#515C6D" }]
					// },
					// {
					// 	featureType: "water",
					// 	elementType: "labels.text.stroke",
					// 	stylers: [{ color: "#17263C" }]
					// }
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

			// marker icon格式
			this.iconStyle = {
				placemark_circle: {
					url: "http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png",
					anchor: new google.maps.Point(15, 15),
					scaledSize: new google.maps.Size(30, 30)
				},
				ylw_blank: {
					url: "https://maps.google.com/mapfiles/kml/paddle/ylw-blank.png",
					anchor: new google.maps.Point(15, 30),
					scaledSize: new google.maps.Size(30, 30)
				},
				grn_pushpin: {
					url: "https://maps.google.com/mapfiles/kml/pushpin/grn-pushpin.png",
					anchor: new google.maps.Point(10, 35),
					scaledSize: new google.maps.Size(35, 35)
				}
			}
		},
		getList() {
			if(!Number(this.listQuery.roadId)) {
				this.$message({
					message: "請輸入正確道路Id",
					type: "error",
				});
			} else {
				this.loading = true;
				this.clearAll();
				this.markers = [];
				this.polyLines = {};
				this.$router.push({ query: { roadId: this.listQuery.roadId }});

				getRoadUnitGeo({ roadId: this.listQuery.roadId }).then((response) => {
					if(response.data.result.boundary == null) {
						this.$message({
							message: "查無資料",
							type: "error",
						});
						this.geoInfo.roadName = response.data.result.roadName;

					} else {
						this.boundaryJSON = JSON.parse(response.data.result.boundary);
						// console.log(this.boundaryJSON.coordinates[0]);
						const bLat = { min: response.data.result.latMin, max: response.data.result.latMax };
						const bLng = { min: response.data.result.lngMin, max: response.data.result.lngMax };

						this.geoInfo = {
							roadName: response.data.result.roadName,
							area: response.data.result.area,
							points: [],
							lines: [],
							blocks: []
						};

						// 建立區塊
						const resJSON = JSON.parse(response.data.result.geoJSON);
						this.geoJSON_Ori = { 
							"type": "FeatureCollection",
							"name": "polyJSON",
							"features": [
								{
									"type": "Feature",
									"properties": {},
									"geometry": resJSON
								}
							]
						};
						
						this.map.data.addGeoJson(this.geoJSON_Ori);
						this.map.data.setStyle({ 
							strokeWeight: 1,
							strokeOpacity: 0.5,
							fillColor: '#409EFF',
							fillOpacity: 0.8
						});

						const paths = resJSON.coordinates.flat().flat().map(point => ({ lat: point[1], lng: point[0] }));
						const bounds = new google.maps.LatLngBounds();
						paths.forEach(position => bounds.extend(position));
						this.map.fitBounds(bounds);
						this.createMarkers();
					}

					this.loading = false;
				}).catch(err => this.loading = false);
			}
		},
		setBlock() {
			//TODO: 單元存入資料庫
			this.stepOrder = 3;
		},
		switchStep(index) {
			// console.log(index, this.stepOrder);
			if(index >= this.stepOrder) return;
			this.stepOrder = index;
			console.log(index, this.stepOrder);
		},
		createMarkers() {
			// 建立端點
			for(const [ index, point ] of this.boundaryJSON.coordinates[0].entries()) {
				const [ lng, lat ] = point;
				// if(index != 0) this.geoInfo.lines[this.geoInfo.lines.length-1].push({ lat, lng });

				// const limit = Math.pow(10, -5);
				// if(Math.abs(bLat.min - lat) < limit || Math.abs(bLat.max - lat) < limit || Math.abs(bLng.min - lng) < limit|| Math.abs(bLng.max - lng) < limit) {
					if(index < this.boundaryJSON.coordinates[0].length - 1) {
					// this.geoInfo.points.push({ index: index, position: { lat, lng } });
					// this.geoInfo.lines.push([{ lat, lng }]);
					const marker = new google.maps.Marker({
						title: `${index}: ${JSON.stringify(point)}`,
						index: index,
						isPin: false,
						isDel: false,
						map: this.map,
						position: { lat, lng },
						icon: this.iconStyle.ylw_blank
					})

					marker.addListener('click', (event) => {
						// console.log(event);

						if(!marker.isPin) {
							marker.isPin = true;
							marker.isDel = false;
							this.geoInfo.points.push({ index: marker.index, position: event.latLng.toJSON() });
							marker.setLabel({
								// text: `${this.geoInfo.points.length}`,
								text: `${marker.index}`,
								color: 'white',
								fontSize: '20px',
								fontWeight: 'bold'
							});
							marker.setIcon(this.iconStyle.grn_pushpin);
						} else {
							marker.isPin = marker.isDel = false;
							marker.setLabel("");
							this.geoInfo.points = this.geoInfo.points.filter(point => point.index != marker.index);
							marker.setIcon(this.iconStyle.ylw_blank);
						}
						// this.infoWindow.setContent(description);
						// this.infoWindow.setPosition(event.latLng);
						// this.infoWindow.open(this.map);
					});

					marker.addListener('rightclick', (event) => {
						// console.log(event);

						if(!marker.isDel) {
							marker.isDel = true;
							marker.isPin = false;
							this.selectPt = this.selectPt.filter(point => point.index != marker.index);
							// this.geoInfo.points.push({ index: marker.index, position: event.latLng.toJSON() });
							marker.setLabel("");
							marker.setIcon(this.iconStyle.placemark_circle);
						} else {
							marker.isPin = marker.isDel = false;
							marker.setLabel("");
							this.selectPt.push(marker.index);
							// this.geoInfo.points = this.geoInfo.points.filter(point => point.index != marker.index);
							marker.setIcon(this.iconStyle.ylw_blank);
						}
						// this.infoWindow.setContent(description);
						// this.infoWindow.setPosition(event.latLng);
						// this.infoWindow.open(this.map);
					});

					this.markers.push(marker);
				}
			}
			// }
		},
		splitLines() {
			if(this.geoInfo.points.length == 0 || this.geoInfo.points.length != 4) {
				this.$message({
					message: "請標記4個點",
					type: "error",
				});
			} else {
				this.stepOrder = 1;
				this.geoInfo.points.sort((a, b) => (a.index - b.index));

				this.boundary = this.geoInfo.points.reduce((acc, cur, id, arr) => {
					const index = id+1 <= arr.length - 1 ? id+1 : 0;
					const dist = calcDistance(cur.position, arr[index].position);
					const endRange = arr[index].index != 0 ? arr[index].index : this.boundaryJSON.coordinates[0].length - 1;
					acc.push({ range: [ cur.index, endRange ], dist });

					return acc;
				}, []).sort((a, b) => (b.dist - a.dist));

				const points = this.boundary.slice(0, 2).sort((a, b) => (a.range[0] - b.range[0]));
				this.createLines(points);
			}
		},
		createLines(points) {
			for(const polyline of Object.values(this.polyLines)) polyline.setMap(null);
			this.polyLines = {};

			let index = 0;
			this.geoInfo.lines = this.boundaryJSON.coordinates[0].reduce((acc, cur, id, arr) => {
				if(index > points.length - 1) return acc;
				let range = points[index].range;
				if(id < range[0]) return acc;

				const [ lng, lat ] = cur;
				if(Object.keys(acc).length == 0 || ( range[0] <= range[1] && id > range[1])) {
					// console.log(id, range[0], range[1]);
					if(id != range[0]) {
						if(++index > points.length - 1) return acc;
						range = points[index].range;
					}
					if(id >= range[0]) acc[index+1] = { range: range, points: [{ lat, lng }]};
					else acc[index+1] = { range: range, points: [] };
				} else if(id >= range[0]) {
					// console.log(id, range[0], range[1]); 
					acc[index+1].points.push({ lat, lng });

					if(range[0] > range[1] && id == arr.length-1) {
						for(let i = 1; i <= range[1]; i++) acc[index+1].points.push({ lat: arr[i][1], lng: arr[i][0]});
					}
				}

				return acc;
			}, {});

			for(const[ id, line] of Object.entries(this.geoInfo.lines)) {
				line.points = line.points.filter((point, index) => line.points.indexOf(point) == index);
				line.len = this.calcLineLen(line.points);

				this.$set(this.selectPt, String(id), Array.from({length: line.points.length}, (_, i) => this.lineIndex(line.range[0], i)));
			}

			// 建立線段
			for(const [ id, path ] of Object.entries(this.geoInfo.lines)) {
				this.polyLines[id] = new google.maps.Polyline({
					path: path.points,
					geodesic: true,
					strokeOpacity: 1,
					strokeColor: id == this.listQuery.baseLineId ? this.options.line.base.color : this.options.line.others.color,
					strokeWeight: id == this.listQuery.baseLineId ? this.options.line.base.width : this.options.line.others.width,
					map: this.map
				});

				// this.polyLines.push(polyLine);
			}
		},
		switchLines() {
			this.isShortBound = !this.isShortBound;
			const indexArr = this.isShortBound ? [2, 4] : [0, 2];
			const points = this.boundary.slice(indexArr[0], indexArr[1]).sort((a, b) => (a.range[0] - b.range[0]));
			this.createLines(points);
		},
		createBlocks() {
			this.resetLines();
			this.stepOrder = 2;

			this.geoInfo.blocks = [];
			this.selectBlock = [];
			let splitPObj = {};
			splitPObj[this.listQuery.baseLineId] = this.splitLine(this.lineFilter[this.listQuery.baseLineId].points);
			for(const id in this.lineFilter) {
				if (id == this.listQuery.baseLineId) continue;
				splitPObj[id] = this.splitLine_Per(this.lineFilter[id].points, splitPObj[this.listQuery.baseLineId]);
			}
			for(const [id, splitPList] of Object.entries(splitPObj)) console.log(`${id}: ${splitPList.length}`);
			// console.log(JSON.parse(JSON.stringify(splitPObj)));

			this.geoJSON_Split = this.getGeoJson(splitPObj);
			// const geoJsonData = JSON.stringify(geoJson, null, 2);
			// console.log(geoJson);

			this.map.data.forEach(feature => this.map.data.remove(feature));
			this.map.data.addGeoJson(this.geoJSON_Split);
			this.map.data.setStyle(feature => {
				// console.log(feature);
				return {
					strokeWeight: feature.j["stroke-width"],
					strokeColor: feature.j.stroke,
					strokeOpacity: feature.j["stroke-opacity"],
					fillOpacity: feature.j["fill-opacity"],
					fillColor: feature.j.fill
				}
			});

			// this.map.data.forEach(feature => console.log(feature.j.blockId));

			// NOTE: test
			this.map.data.addListener("click", (event) => {
				console.log(`${event.feature.j.area.toLocaleString()} ㎡`,);
			});

			this.map.data.addListener('mouseover', (event) => {
				const row = this.geoInfo.blocks.filter((block) => block.blockId == event.feature.j.blockId)[0];
				if(this.$refs.blockTable) this.$refs.blockTable.setCurrentRow(row);
				this.map.data.revertStyle();
				this.map.data.overrideStyle(event.feature, { fillColor: "#FFF176" });
			});

			this.map.data.addListener('mouseout', function(event) {
				// if(this.$refs.blockTable) this.$refs.blockTable.setCurrentRow();
				this.map.data.revertStyle();
			});

			this.$nextTick(() => this.$refs.blockTable.toggleAllSelection());
		},
		resetLines() {
			this.lineFilter = JSON.parse(JSON.stringify(this.geoInfo.lines));

			// 變更marker icon
			this.markers.forEach(marker => {
				// console.log(marker.index, this.selectPt[lineId]);
				if(!marker.isPin && Object.values(this.selectPt).flat().includes(marker.index)) marker.setIcon(this.iconStyle.ylw_blank);
				if(!marker.isPin && !Object.values(this.selectPt).flat().includes(marker.index))  marker.setIcon(this.iconStyle.placemark_circle);
			});

			Object.keys(this.geoInfo.lines).forEach(id => {
				// 調整lines的點
				const line = this.geoInfo.lines[id];
				// console.log(id, line.points);
				this.lineFilter[id].points = line.points.filter((_, i) => (this.selectPt[id].includes(this.lineIndex(line.range[0], i))));
				// console.log(lineFilter[id].points);

				// 變更線段
				const path = this.lineFilter[id].points;
				// console.log(id, path);
				this.polyLines[id].setPath(path);
			})
		},
		clearAll() {
			this.stepOrder = 0;
			this.map.data.forEach(feature => this.map.data.remove(feature));
			for(const polyline of Object.values(this.polyLines)) polyline.setMap(null);
			for(const markers of this.markers) markers.setMap(null);
		},
		// 計算線段長度
		calcLineLen(points) {
			return points.reduce((acc, curr, index) => {
				if (index + 1 < points.length) acc += calcDistance(curr, points[index + 1]);
				return acc;
			}, 0);
		},
		// 線性插值
		interpolation(start, end, different) {
			const dist = calcDistance(start, end);
			const lat = different * (end.lat - start.lat) / dist + start.lat;
			const lng = different * (end.lng - start.lng) / dist + start.lng;
			return { lat, lng };
		},
		//計算垂直點: { lat: -1, lng: -1 } -> 不在線段內
		getFootOfPer(start, end, pt) {
			const dLat = start.lat - end.lat; //Y
			const dLng = start.lng - end.lng; //X

			if (Math.abs(dLat) < 0.000000001 && Math.abs(dLng) < 0.000000001) return { lat: -1, lng: -1 };
			const u = ((pt.lng - start.lng) * dLng + (pt.lat - start.lat) * dLat) / (dLng * dLng + dLat * dLat);
			const footOfPer = { lat: start.lat + u * dLat, lng: start.lng + u * dLng };
			// console.log(calcDistance(start, footOfPer), calcDistance(start, end));

			if(calcDistance(start, footOfPer) > calcDistance(start, end)) return { lat: -1, lng: -1 };
			else return footOfPer;
		},
		//切割線段 - 線段長度
		splitLine(linesPosSpec) {
			let pointList = [{ index: 0, point: linesPosSpec[0] }];
			let pointInfo = { dist: 0, index: 0, point: pointList[pointList.length - 1].point };
			
			for (let i = 0; i < linesPosSpec.length; i = pointInfo.index + 1) {
				pointInfo.point = pointList[pointList.length - 1].point;
				pointInfo.dist = 0;
				let dist = 0;
				for (const [index, point] of linesPosSpec.entries()) {
					if (index <= pointInfo.index) continue;
					dist += calcDistance(pointInfo.point, point);
					if (dist != 0 && dist <= this.listQuery.splitLen) pointInfo = { dist, index, point };
					else break;
				}

				if (pointInfo.index + 1 >= linesPosSpec.length) pointList.push({ index: linesPosSpec.length - 1, point: linesPosSpec[linesPosSpec.length - 1] });
				else {
					pointList.push({
						index: pointInfo.index,
						point: this.interpolation(pointInfo.point, linesPosSpec[pointInfo.index + 1], this.listQuery.splitLen - pointInfo.dist)
					});
				}
			}
			return pointList
		},
		//切割線段 - 垂直點
		splitLine_Per(linesPosSpec, splitPList) {
			let pointList = [{ index: linesPosSpec.length-1, point: linesPosSpec[linesPosSpec.length-1] }];
			let pointInfo = { index: 0, point: {} };

			for (const [ index, splitP ] of splitPList.entries()) {
				if(index == 0) continue;
				for (let i = linesPosSpec.length - 1; i >= 0; i--) {
					if (i - 1 < 0) pointList.push({ index: 0, point: linesPosSpec[0] });
					else {
						const footOfPer = this.getFootOfPer(linesPosSpec[i], linesPosSpec[i-1], splitP.point);
						// console.log(i, JSON.stringify(linesPosSpec[i]), JSON.stringify(linesPosSpec[i-1]), JSON.stringify(splitP.point), JSON.stringify(footOfPer));
						if (footOfPer.lat == -1 && footOfPer.lng == -1) continue;
						pointInfo.index = i;

						pointList.push({
							index: pointInfo.index,
							point: footOfPer
						});

						break;
					}
				}
			}
			return pointList
		},
		splitBlock(splitPList1, splitPList2, line1, line2) {
			const limit = Math.max(splitPList1.length, splitPList2.length);
			let borders = [];
			
			for (let i = 0; i < limit - 1; i++) {
				let splitPList1Curr, splitPList1Next, splitPList2Curr, splitPList2Next;
				
				if (i < splitPList1.length - 1) {
					splitPList1Curr = splitPList1[i];
					splitPList1Next = splitPList1[i + 1];
				} else splitPList1Curr = splitPList1Next = splitPList1[splitPList1.length - 1];

				if (i < splitPList2.length - 1) {
					splitPList2Curr = splitPList2[i];
					splitPList2Next = splitPList2[i + 1];
				} else splitPList2Curr = splitPList2Next = splitPList2[splitPList2.length - 1];

				// console.log(splitPList1Curr, splitPList1Next, splitPList2Curr, splitPList2Next);

				let border = [[splitPList1Curr.point.lng, splitPList1Curr.point.lat]];
				for (let a = splitPList1Curr.index + 1; a <= splitPList1Next.index; a++) border.push([line1[a].lng, line1[a].lat]);
				border.push([splitPList1Next.point.lng, splitPList1Next.point.lat]);
				border.push([splitPList2Next.point.lng, splitPList2Next.point.lat]);
				for (let b = splitPList2Next.index; b >= splitPList2Curr.index + 1; b--) border.push([line2[b].lng, line2[b].lat]);
				border.push([splitPList2Curr.point.lng, splitPList2Curr.point.lat]);

				border.push([splitPList1Curr.point.lng, splitPList1Curr.point.lat]);

				// console.log(border);
				borders.push([ border ]);
			}
			return borders
		},
		getGeoJson(splitPObj) {
			let geoJson = {
				"type": "FeatureCollection",
				"name": "splitJSON",
				"features": []
			};

			for (const [id, splitPList] of Object.entries(splitPObj)) {
				if(id == this.listQuery.baseLineId) continue;
				for (const [index, border] of this.splitBlock(splitPObj[this.listQuery.baseLineId], splitPList, this.lineFilter[this.listQuery.baseLineId].points, this.lineFilter[id].points).entries()) {
					const area = calArea(border.flat());
					let fillColor = "#90CAF9";
					if(area < this.areaLimit[0] || area > this.areaLimit[1]) fillColor = "#EF5350";

					// console.log(border.flat().map(point => ({ lat: point[1], lng: point[0] })));

					const block = {
						blockId: index+1,
						area: area,
						points: border.flat().map(point => ({ lat: point[1], lng: point[0] }))
					};
					this.geoInfo.blocks.push(block);

					const feature = {
						"type": "Feature",
						"properties": {
							"stroke": "#555555",
							"stroke-opacity": 0.5,
							"stroke-width": 1,
							"fill": fillColor,
							"fill-opacity": 0.8,
							"area": area,
							"blockId": index+1
						},
						"geometry": {
							"type": "Polygon",
							"coordinates": border
						}
					};
					geoJson.features.push(feature);
				}
			}

			return geoJson
		},
		// handleSelBlockChange(selection) {
		// 	this.selectBlock = selection;
		// },
		handleMouseEnter(row, column, cell, event) {
			// console.log(row.blockId);
			
			this.map.data.revertStyle();
			this.map.data.forEach(feature => {
				if(feature.j.blockId == row.blockId) this.map.data.overrideStyle(feature, { fillColor: "#FFF176" });
			});
		},
		handleMouseLeave(row, column, cell, event) {
			// console.log(row.blockId);
			this.map.data.revertStyle();
		},
		lineIndex(min, index) {
			const polyMax = this.boundaryJSON.coordinates[0].length - 1;
			const lineIndex = (min + index) % polyMax;
			return lineIndex;
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
.road-unitGen
	position: relative
	height: 100%
	width: 100%
	.header-bar
		position: absolute
		top: 0
		z-index: 1
		padding-left: 10px
		.road-title
			text-shadow: 0px 0px 5px white
			text-stroke: 0.6px white
			-webkit-text-stroke: 0.6px white
		.step-box
			width: 600px
			margin-left: 100px
			.el-steps.el-steps--simple
				padding: 5px 40px 5px 20px
			.el-step__icon-inner.el-icon-add-location
				font-size: 24px
			.el-step__head.is-finish, .el-step__title.is-finish
				cursor: pointer
			.el-step__main
				margin-left: 10px
				.el-step__title > *, .el-step__arrow
					text-align: center
					cursor: default
	.info-box
		position: absolute
		top: 150px
		left: 10px
		z-index: 1
		.road-info
			width: 360px
			background-color: rgba(white, 0.7)
			margin: 5px
			// padding: 5px
			font-size: 18px 
			color: #555
			.el-card__body
				max-height: 400px
				overflow-x: hidden
				overflow-y: auto
			.btn-switch-line
				position: relative
				margin-left: 90%
				margin-bottom: 5px
			.info-title
				font-weight: bold
				margin-bottom: 5px
			input[type=number]
				padding: 0
				overflow: hidden
				text-align: center
				&::-webkit-inner-spin-button
					transform: scale(1.2, 1) translateX(-11%)
			.info-btn
				display: inline-flex
				margin-bottom: 5px
			.line-label
				width: 100%
				.el-collapse-item__header
					background-color: rgba(#827717, 0.8)
					padding: 5px
					&.is-active
						transition: 0.5s
				&.base .el-collapse-item__header
					background-color: rgba(#EF5350, 0.8)
				.el-collapse-item__content
						height: 100%
			.blockTableRow
				cursor: pointer
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