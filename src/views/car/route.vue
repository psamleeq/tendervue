<template>
  <div class="car-route" v-loading="loading"> 
		<div class="header-bar">
			<h2>
				車巡管理
				<span v-if="carId.length != 0" style="font-size: 18px; color: #aaa" >車號 {{ carId }} (路線 {{ listQuery.inspectionId }})</span>
			</h2>
			<div class="filter-container">
				<el-select v-model="listQuery.modeId" @change="getCarList()">
					<el-option v-for="(text, id) in options.modeId" :key="`model_${id}`" :label="text" :value="Number(id)" />
				</el-select>
				<el-select v-model="listQuery.inspectionId" placeholder="請選擇路線" @change="getCarInfo()">
					<el-option v-for="car in carList" :key="`car_${car.id}`" :label="`路線${car.id} (${car.carId})`" :value="Number(car.id)" />
				</el-select>
				<!-- <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList()">搜尋</el-button>
				<el-button
					class="filter-item"
					type="info"
					icon="el-icon-document"
					@click="handleDownload"
				>輸出報表</el-button> -->
			</div>
		</div>
		<el-row>
			<el-col :span="16">
				<div id="map" ref="map" />
			</el-col>
			<el-col class="info-panel" :span="8">
				<!-- <iframe width="720" height="405" src="https://www.youtube.com/embed/d148YHkaAGg?controls=0&autoplay=1&mute=1&rel=0&modestbranding=1" frameborder="0" allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture;" /> -->
				<!-- <iframe src="http://bimtest.sytes.net:5080/WebRTCAppEE/play.html?name=246612205179051969409588&autoplay=true" frameborder="0" /> -->
				<iframe width="560" height="315" src="http://media.bellsgis.com:8080/WebRTCAppEE/play.html?id=246612205179051969409588_720p6000kbps_6.mp4&playOrder=vod" frameborder="0" allowfullscreen></iframe>
				<div class="car-info-panel">
					<i class="el-icon-truck" />
					<div v-if="Object.keys(carInfo).length > 0" class="car-info">
						<el-row v-for="(text, key) in headers" :key="key" >
							<el-col :span="8">{{ text }}: </el-col>
							<el-col :span="16">{{ carInfo[key] }}</el-col>
						</el-row>
					</div>
				</div>
			</el-col>
		</el-row> 

    <!-- <h5 v-if="list.length != 0">查詢期間：{{ searchRange }}</h5> -->

    <!-- <el-table
      empty-text="目前沒有資料"
      :data="list"
      border
      fit
      highlight-current-row
      :header-cell-style="{'background-color': '#F2F6FC'}"
      stripe
      style="width: 100%"
    >
      <el-table-column
        v-for="(value, key) in headers"
        :key="key"
        :prop="key"
        :label="value.name"
        align="center"
				:formatter="formatter"
        :sortable="value.sortable"
      />
    </el-table> -->
		<!-- <el-dialog v-el-drag-dialog class="streaming" :visible="true" width="720px" :modal="false" :modal-append-to-body="false" :append-to-body="false" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" center> -->
			<!-- <iframe width="720" height="405" src="https://www.youtube.com/embed/d148YHkaAGg?controls=0&autoplay=1&mute=1&rel=0&modestbranding=1" frameborder="0" allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture;" /> -->
			<!-- <iframe src="http://bimtest.sytes.net:5080/WebRTCAppEE/play.html?name=246612205179051969409588&autoplay=true" frameborder="0" width="720" height="405"></iframe>
		</el-dialog> -->

  </div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader";
import moment from 'moment'
import { getInspectionList, getSpecInspection, getSpecInspectionTracks } from "@/api/car";
import elDragDialog from '@/directive/el-drag-dialog';

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
  name: "carRoute",
	directives: { elDragDialog },
  data() {
    return {
      loading: false,
			map: null,
			polyLine: null,
			markers: {
				start: null,
				end: null
			},
      // timeTabId: 4,
      // dateTimePickerVisible: false,
      // screenWidth: window.innerWidth,
      // daterange: [moment().startOf("year").toDate(), moment().endOf("year").toDate()],
      // searchRange: "",
			listQuery: {
				modeId: 3,
				inspectionId: ""
			},
      headers: {
				id: "路線",
				carId: "車號",
        driverId: "駕駛",
				modeId: "巡查方式",
				createdAt: "開始時間"
      },
			options: {
				modeId: {
					1: "手持巡查",
					2: "手持巡查(AI)",
					3: "車輛巡查",
					4: "車輛巡查(AI)"
				}
			},
			carList: [],
      carInfo: [],
			carTracks: []
    };
  },
	computed: {
		carId() {
			const carFilterList = this.carList.filter(car => car.id == this.listQuery.inspectionId);
			return carFilterList.length > 0 ? carFilterList[0].carId : "";
		}
	},
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
		this.getCarList();
	},
  methods: {
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
				maxZoom: 19,
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

			// 建立marker
			this.markers.start = new google.maps.Marker({
				map: this.map,
				icon: {
					url: "/assets/icon/icon_redDot.png",
					anchor: new google.maps.Point(5, 5),
					scaledSize: new google.maps.Size(10, 10)
				}
			});

			this.markers.end = new google.maps.Marker({
				map: this.map,
				icon: {
					url: "/assets/icon/truck.png",
					anchor: new google.maps.Point(12, 12),
					scaledSize: new google.maps.Size(24, 24)
				}
			});
		},
		getCarList() {
			//TODO: 測試
			// this.carList = [
			// 	{
			// 		"id": 32,
			// 		"driverId": 1,
			// 		"carId": 1,
			// 		"pathId": 1,
			// 		"modeId": 3,
			// 		"createdAt": "2022-09-05T01:55:36.660Z",
			// 		"isDeleted": false
			// 	},
			// 	{
			// 		"id": 36,
			// 		"driverId": 1,
			// 		"carId": 1,
			// 		"pathId": 1,
			// 		"modeId": 3,
			// 		"createdAt": "2022-09-05T03:27:17.564Z",
			// 		"isDeleted": false
			// 	}
			// ];
			this.listQuery.inspectionId = "";

			getInspectionList({
				modeId: this.listQuery.modeId
			}).then((response) => {
				if (response.result.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.carList = response.result;
				}
				this.loading = false;
			}).catch(err => { this.loading = false; });
		},
    getCarInfo() {
      //TODO: 測試
			// this.carInfo = {
			// 	"id": 32,
			// 	"driverId": 1,
			// 	"carId": 1,
			// 	"pathId": 1,
			// 	"modeId": 3,
			// 	"createdAt": "2022-09-05T01:55:36.660Z",
			// 	"isDeleted": false
			// };
			// this.carInfo.modeId = this.options.modeId[this.carInfo.modeId];
			// this.carInfo.createdAt = this.formatTime(this.carInfo.createdAt);
			// this.getCarTrack();

			getSpecInspection(this.listQuery.inspectionId).then((response) => {
				if (Object.keys(response.result).length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.carInfo = response.result;
					this.carInfo.modeId = this.options.modeId[this.carInfo.modeId];
					this.carInfo.createdAt = this.formatTime(this.carInfo.createdAt);

					this.getCarTrack();
				}
				this.loading = false;
			}).catch(err => { this.loading = false; });
    },
		getCarTrack() {
			if(this.polyLine != undefined) this.polyLine.setMap(null);
			for(const marker of Object.values(this.markers)) marker.setMap(null);

			getSpecInspectionTracks(this.listQuery.inspectionId).then((response) => {
				if (response.result.length == 0) {
					this.$message({
						message: "查無資料",
						type: "error",
					});
				} else {
					this.carTracks = response.result;

					const paths = this.carTracks.map(point => ({ lat: point.lat, lng: point.long }));
					// 建立路線
					this.polyLine = new google.maps.Polyline({
						path: paths,
						geodesic: true,
						strokeColor: "#9E9D24",
						strokeOpacity: 1,
						strokeWeight: 5,
						map: this.map
					})

					const bounds = new google.maps.LatLngBounds();
					paths.forEach(position => {
						bounds.extend(position);
					});
					this.map.fitBounds(bounds);

					this.markers.start.setPosition(paths[1]);
					this.markers.end.setPosition(paths[paths.length-1]);
					for(const marker of Object.values(this.markers)) marker.setMap(this.map);
				}
				this.loading = false;
			}).catch(err => { this.loading = false; });
    },
		formatter(row, column) {
      if(Number(row[column.property])) return row[column.property].toLocaleString();
      else return row[column.property];
    },
    formatTime(time) {
      return moment(time).utc().format("YYYY-MM-DD HH:mm:ss");
    },
    handleDownload() {
      let tHeader = Object.values(this.headers);
      let filterVal = Object.keys(this.headers);
      // tHeader = [ "日期", "星期", "DAU", "新增帳號數", "PCU", "ACU", "儲值金額", "DAU帳號付費數", "DAU付費率", "DAU ARPPU", "DAU ARPU", "新增帳號儲值金額", "新增帳號付費數", "新增付費率", "新增帳號ARPPU", "新增帳號ARPU" ]
      // filterVal = [ "date", "weekdayText", "dau", "newUser", "pcu", "acu", "amount", "dauPaid", "dauPaidRatio", "dauARPPU", "dauARPU", "newUserAmount", "newUserPaid", "newUserPaidRatio", "newUserARPPU", "newUserARPU" ]
      let data = this.formatJson(filterVal, this.list);

      import("@/vendor/Export2Excel").then((excel) => {
        excel.export_json_to_excel({
          header: tHeader,
          data,
        });
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    }
  },
};
</script>

<style lang="sass">
// *
// 	border: 1px solid #000
// 	box-sizing: border-box
.car-route
	position: relative
	height: 100%
	width: 100%
	.header-bar
		position: absolute
		top: 0
		z-index: 1
		padding-left: 10px
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
		// .streaming
		// 	z-index: 0 !important
		// 	.el-dialog
		// 		top: -20px
		// 		left: -350px
		// 		.el-dialog__header
		// 			height: 0
		// 			background-color: #409EFF
		// 		.el-dialog__body
		// 			padding: 0
		// 			height: 405px
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
	.info-panel
		background-color: #E6EE9C
		height: calc(100vh - 50px)
		iframe
			height: calc(100vw / 3 / 1.5)
			width: 100%
		.car-info-panel
			position: relative
			height: 100%
			width: 100%
			i.el-icon-truck
				position: absolute
				bottom: 50%
				left: 50%
				transform: translateX(-50%)
				color: white
				font-size: 2000%
				opacity: 0.8
			.car-info
				padding: 20px
</style>