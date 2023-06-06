<template>
	<div ref="panoramaView" class="panorama-view">
		<div id="panorama">
			<div v-if="localEnv && panorama" style="position: absolute; top: 0; left: 0; z-index:99; background-color: rgba(255, 255, 255, 0.6); padding: 5px 10px">
				<el-input
					class="searchBox"
					v-model="testQuery.sceneId"
					placeholder="sceneId"
					style="display: inline-block; width: 180px"
					@change="showPanoramaLayer(testQuery.sceneId)"
				/>
				<div> {{ panorama.getScene() }}</div>
				<div>{{ panoramaTestInfo }} </div>
				<div>{{ panoramaTestInfo.position }}</div>
			</div>

			<el-card v-if="hotSpotIdList.dot.length > 1" class="info-box right">
				<el-form :model="caseInfo" label-width="70px" size="small">
					<el-form-item prop="date" label="通報時間">
						<el-date-picker
							v-model="caseInfo.dateReport"
							type="date"
							placeholder="日期"
							:clearable="false"
							size="mini"
						/>
					</el-form-item>
					<el-form-item prop="type" label="缺失類型">
						<el-select v-model="caseInfo.distressType" size="mini" @change="calcCaseInfo">
							<el-option v-for="(name, key) in options.caseTypeMap" :key="key" :label="name" :value="key" />
						</el-select>
					</el-form-item>
					<el-form-item prop="level" label="缺失程度">
						<el-select v-model="caseInfo.distressLevel" size="mini">
							<el-option v-for="(name, level) in options.caseLevelMap" :key="level" :label="name" :value="level" />
						</el-select>
					</el-form-item>
					<el-form-item prop="millingLength" label="預估長" style="margin-bottom: 0">
						<el-input v-model="caseInfo.millingLength" size="mini" style="width: 130px" />
					</el-form-item>
					<el-form-item prop="millingWidth" label="預估寬" style="margin-bottom: 0">
						<el-input v-model="caseInfo.millingWidth" size="mini" style="width: 130px" />
					</el-form-item>
					<el-form-item prop="millingArea" label="預估面積">
						<el-input v-model="caseInfo.millingArea" size="mini" style="width: 130px" />
					</el-form-item>
					<el-form-item prop="address" label="地址" style="margin-bottom: 0">
						<el-input v-model="caseInfo.place" type="textarea" autosize />
					</el-form-item>
					<el-form-item prop="roadDir" label="車道">
						<el-input class="road-dir" v-model="caseInfo.lane" size="mini">
							<el-select slot="prepend" v-model="caseInfo.direction" popper-class="type-select" size="mini">
								<el-option v-for="(name, id) in options.roadDir" :key="id" :label="name" :value="Number(id)" />
							</el-select>
						</el-input>
					</el-form-item>
					<el-form-item v-for="(imgName, imgType) in options.imgTypeMap" :key="imgType" :prop="imgType" :label="imgName">
						<el-row :gutter="15" style="position: relative">
							<el-col :span="10">
								<el-popover v-if="caseInfo[imgType].length > 0" popper-class="imgHover" placement="left" trigger="hover">
									<el-image style="width: 100%; height: 100%" :src="caseInfo[imgType]" fit="contain" />
									<el-image slot="reference" style="width: 100px; height: 100px" :src="caseInfo[imgType]" fit="contain" />
								</el-popover>
							</el-col>
							<el-col class="btn-img-action" :span="8">
								<el-button type="success" size="mini" @click="screenshot(imgType)">截圖</el-button>
								<el-button v-if="caseInfo[imgType].length > 0" type="danger" size="mini" @click="caseInfo[imgType] = ''">刪除</el-button>
							</el-col>
						</el-row>
					</el-form-item>
				</el-form>
				<el-button-group class="btn-action-group">
					<el-button type="success" @click="uploadCase()" @disabled="isUpload">新增</el-button>
					<el-button type="danger" @click="clearHotSpot()" @disabled="isUpload">清除</el-button>
				</el-button-group>
			</el-card>
		</div>
	</div>
</template>

<script>
import moment from "moment";
import html2canvas from 'html2canvas';
const { calcDistance, calArea } = require('@/utils/geo-tools');
const cameraHeight = 2.5; // 攝影機高度

export default {
	name: "panoramaView",
	props: {
		loading: {
			required: true,
			type: Boolean
		},
		listQuery: {
			type: Object,
			required: true
		},
		panoramaInfo: {
			type: Object,
			required: true
		},
		options: {
			type: Object,
			required: true
		},
		caseGeoJson: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			localEnv: process.env.NODE_ENV == 'development',
			panorama: null,
			prevSceneId: [],
			hotSpotId: 0,
			hotSpotIdList: {
				dot: [],
				case: []
			},
			imageSize: {
				width: 7689,
				height: 3840
			},
			testQuery: {
				sceneId: ""
			},
			panoramaTestInfo: {
				Pitch: 0,
				Yaw: 0,
				Hfov: 0,
				position: {}
			},
			caseInfo: {
				dateReport: moment().startOf("d"),
				distressType: "",
				distressLevel: "",
				millingLength: 0,
				millingWidth: 0,
				millingArea: 0,
				place: "",
				direction: 0,
				lane: 1,
				imgZoomIn: "",
				imgZoomOut: ""
			}
		}
	},
	computed: {
		panoramaInfoProps: {
			get() {
				return this.panoramaInfo
			},
			set(val) {
				this.$emit('update:panoramaInfo', val)
			}
		},

	},
	created() { },
	mounted() {
		// init panorama
		// console.log("panorama_mounted");
		this.panorama = pannellum.viewer("panorama", { scenes: {}, keyboardZoom: false, hotSpotDebug: false });
		this.panorama.on("load", () => this.panorama.resize() );
		this.panorama.on("scenechange", () => this.resetCaseHotSpot() );

		this.panorama.on('mousedown', (evt) => {
			this.$emit('setHeading', this.panorama.getNorthOffset()+this.panorama.getYaw());
			if(!evt.shiftKey) return;

			// coords[0] is pitch, coords[1] is yaw
			const [ pitch , yaw ] = this.panorama.mouseEventToCoords(evt);
			const hotSpot = this.addDotHotSpot({ pitch, yaw }, 1);

			// NOTE: convert to image coordinates
			// const x = (yaw / 360 + 0.5) * this.imageSize.width;
			// const y = (0.5 - pitch / 180) * this.imageSize.height;
			// console.log(x, y);

			// NOTE: 預估缺失位置(ME)
			// const distance = this.getDistance(pitch);
			// console.log("distance: ", distance);
			// const position = this.getPosition(distance, yaw);
			// this.addDotHotSpot(this.getCoords(position), 2);

			// NOTE: 預估缺失位置(詹博)
			hotSpot.coordinates = this.transformMatrix(pitch, yaw);

			// NOTE: 在「地圖」上顯示
			this.$emit("addMarker", { id: hotSpot.id, position: hotSpot.coordinates, type: 3 });

			//NOTE: 在「環景」上顯示
			// this.addDotHotSpot(this.getCoords(hotSpot.coordinates), 3);

			// TODO: 排序點(目前非矩形not work)
			// let hotSpotIdOrder = [ this.hotSpotIdList.dot[0] ];
			// for(let i = 1; i < this.hotSpotIdList.dot.length; i++) {
			// 	const hotSpotPos = hotSpotIdOrder[hotSpotIdOrder .length - 1].coordinates;
			// 	const distanceList = this.hotSpotIdList.dot.filter(hotSpot => !hotSpotIdOrder.includes(hotSpot)).map((hotSpot) => {
			// 		return { id: hotSpot.id, distance: calcDistance(hotSpotPos, hotSpot.coordinates)  }
			// 	}).sort((a, b) => (a.distance - b.distance));

			// 	console.log(i, distanceList);
			// 	const hotSpotFilter = this.hotSpotIdList.dot.filter(hotSpot => hotSpot.id == distanceList[0].id)[0];
			// 	hotSpotIdOrder.push(hotSpotFilter);
			// }
			// this.hotSpotIdList.dot = hotSpotIdOrder;

			// 估算長度 & 面積
			this.calcCaseInfo();
		});
		this.panorama.on('mouseup', (evt) => {
			this.$emit('setHeading', this.panorama.getNorthOffset()+this.panorama.getYaw());
		});
		this.panorama.on('animatefinished', () => {
			const panoramaInfo = Object.values(this.panoramaInfoProps.data).flat().filter(l => l.fileName == this.panorama.getScene())[0];
			this.panoramaTestInfo = { Pitch: this.panorama.getPitch(), Yaw: this.panorama.getYaw(), Hfov: this.panorama.getHfov(), position: panoramaInfo.position };
			this.$emit('setHeading', this.panorama.getNorthOffset()+this.panorama.getYaw());
		});

		this.$el.querySelector("#panorama .pnlm-compass").addEventListener("click", (evt) => {
			const northOffset = this.panorama.getNorthOffset();
			this.panorama.setYaw(-northOffset);
			// this.$emit('setHeading', 0);

			evt.stopPropagation();
		});
	},
	methods: {
		setStreetViewList() {
			// console.log("setStreetViewList");
			// console.log(JSON.parse(JSON.stringify(this.panoramaInfo)));
			// this.panoramaInfoProps.streetViewList = {};
			// console.log(JSON.parse(JSON.stringify(this.panoramaInfoProps)));

			const lineInfoList = this.panoramaInfoProps.data;
			const panoramaUrl = this.panoramaInfoProps.sceneSetting.assetsUrl;

			for (const lineInfo of lineInfoList) {
				lineInfo.forEach((info, index) => {
					const panoramaPhotoUrl = `${panoramaUrl}/${info.fileName}`;

					this.panoramaInfoProps.streetViewList[info.fileName] = {
						type: "equirectangular",
						panorama: panoramaPhotoUrl,
						hfov: this.panoramaInfoProps.sceneSetting.hfov,
						yaw: this.panoramaInfoProps.sceneSetting.yaw,
						horizonRoll: this.panoramaInfoProps.sceneSetting.horizonRoll,
						compass: true,
						northOffset: info.azimuth,
						autoLoad: true,
					};

					let hotSpots = [];
						const clickHandlerFunc = (evt, clickHandlerArgs) => {
							if(clickHandlerArgs) {
								this.clearHotSpot(clickHandlerArgs.sceneIdNow);
								this.$emit('setMarkerPosition', clickHandlerArgs.sceneIdNow);
							}
						};

						if (index >= 0 && index < lineInfo.length - 1) {
							hotSpots.push({
								pitch: this.panoramaInfoProps.sceneSetting.pitch,
								yaw: this.panoramaInfoProps.sceneSetting.yaw,
								type: "scene",
								text: lineInfo[index + 1].fileName,
								sceneId: lineInfo[index + 1].fileName,
								clickHandlerArgs: {
									sceneIdNow: lineInfo[index].fileName
								},
								clickHandlerFunc
							});
						}

						if (index > 0 && index < lineInfo.length) {
							hotSpots.push({
								pitch: this.panoramaInfoProps.sceneSetting.pitch,
								yaw: this.panoramaInfoProps.sceneSetting.yaw + 180,
								type: "scene",
								text: lineInfo[index - 1].fileName,
								sceneId: lineInfo[index - 1].fileName,
								targetYaw: this.panoramaInfoProps.sceneSetting.yaw + 180,
								clickHandlerArgs: {
									sceneIdNow: lineInfo[index].fileName
								},
								clickHandlerFunc
							});
						}

					this.panoramaInfoProps.streetViewList[info.fileName]["hotSpots"] = hotSpots;
					this.$emit('update:panoramaInfo',this.panoramaInfoProps);
				});
			}	
		},
		removeAllScene() {
			for (const sceneId of this.prevSceneId) this.panorama.removeScene(sceneId);
			this.prevSceneId = [];
		},
		setPanoramaScene() {
			this.removeAllScene();

			// 掛載panorama scene
			for (const sceneId in this.panoramaInfoProps.streetViewList) {
				const panoramaInfo = this.panoramaInfoProps.streetViewList[sceneId];
				this.panorama.addScene(sceneId, panoramaInfo);
				this.prevSceneId.push(sceneId);
			}
		},
		showPanoramaLayer(sceneId) {
			// console.log("showPanoramaLayer");
			this.$emit("showPanoramaLayer", sceneId);
		},
		uploadCase() {
			this.$confirm(`確定上傳缺失?`, "確認", { showClose: false }).then(() => {
				this.$emit('update:loading', true);
				this.isUpload = true;

				let coordinates = this.hotSpotIdList.dot.map(hotSpot => ([hotSpot.coordinates.lng, hotSpot.coordinates.lat]));
				coordinates.push(coordinates[0]);
				// console.log(coordinates);
				this.caseInfo.geoJson = {
					"type": this.caseInfo.distressType == 29 ? "MultiLineString" : 'MultiPolygon',
					"coordinates": this.caseInfo.distressType == 29 ? [ coordinates ] : [[ coordinates ]]
				};
				console.log(this.caseInfo);

				this.$emit("uploadCase", this.caseInfo);
			}).catch(err => console.log(err));
		},
		// 估算長度 & 面積
		calcCaseInfo() {
			if(this.caseInfo.distressType == 29 && this.hotSpotIdList.dot.length >= 2) {
				this.caseInfo.millingLength =  this.hotSpotIdList.dot.reduce((acc, cur, index, array) => {
					console.log("index: ", index);
					if(array[index + 1] == undefined) return Math.round(acc * 100) / 100;
					return acc += calcDistance(cur.coordinates, array[index + 1].coordinates);
				}, 0)
			}
			if(this.caseInfo.distressType != 29 && this.hotSpotIdList.dot.length >= 4) {
				const distanceList = this.hotSpotIdList.dot.reduce((acc, cur, index, array) => {
					const nextIndex = (index + 1) % array.length;
					const distance = calcDistance(cur.coordinates, array[nextIndex].coordinates);
					acc.push(distance);

					return acc
				}, []).sort();

				this.caseInfo.millingLength = Math.round(Math.max(...distanceList) * 100) / 100;
				this.caseInfo.millingWidth = Math.round(Math.min(...distanceList) * 100) / 100;
				this.caseInfo.millingArea = Math.round(calArea(this.hotSpotIdList.dot.map(hotSpot => ([ hotSpot.coordinates.lng, hotSpot.coordinates.lat ]))) * 100) / 100;
			}
		},
		screenshot(imgType="imgZoomIn", hfov) {
			hfov = (hfov != undefined) ? hfov : this.panorama.getHfov();
			this.panorama.setHfov(hfov, 100, () => {

				// 街景截圖
				const imgUrl = this.panorama.getRenderer().render(
					this.panorama.getPitch() / 180 * Math.PI,
					this.panorama.getYaw() / 180 * Math.PI,
					this.panorama.getHfov() / 180 * Math.PI,
					{ 'returnImage': true }
				)

				// 載入街景截圖
				const img = new Image();
				img.addEventListener("load", async () => {
					const canvas = document.createElement('canvas');
					canvas.width = img.width;
					canvas.height = img.height;
					// console.log("canvas: ", canvas.width, canvas.height);
					const canvasContext = canvas.getContext('2d');
					canvasContext.drawImage(img, 0, 0);

					// 隱藏DOM
					this.$el.querySelector("#panorama canvas").setAttribute("data-html2canvas-ignore", true);
					const ignoreDomList = [
						// 切換場景圖示
						...this.$el.querySelectorAll("#panorama .pnlm-hotspot-base.pnlm-hotspot"),
						// 缺失標記圖示
						...this.$el.querySelectorAll("#panorama .pnlm-hotspot-base.hotSpotIcon.alert")
					];
					for(const dom of ignoreDomList) dom.setAttribute("data-html2canvas-ignore", true);

					// 畫線
					const containerDom = this.$el.querySelector(".pnlm-render-container");
					const dotDomList = this.$el.querySelectorAll("#panorama .pnlm-hotspot-base.hotSpotIcon.redDot");
					const hotSpotIdOrder = this.hotSpotIdList.dot.map(hotSpot => hotSpot.id);
					const { x: x_bg, y: y_bg, width: width_bg, height: height_bg } = containerDom.getBoundingClientRect();
					const [ ratio_width, ratio_height ] = [ canvas.width / width_bg , canvas.height / height_bg ];
					// console.log("containerDom: ", containerDom.getBoundingClientRect());
					let begin;
					canvasContext.beginPath();
					canvasContext.lineWidth = 3;
					canvasContext.strokeStyle = 'red';
					// for(const [ index, dom ] of dotDomList.entries()) {
					for(const [index, hotSpotId] of hotSpotIdOrder.entries()) {
						const dom = [...dotDomList].filter(dom => dom.classList.contains(`id_${hotSpotId}`))[0];
						// console.log(index, dom.getBoundingClientRect());
						const { x: x_el, y: y_el, width: width_el, height: height_el } = dom.getBoundingClientRect();
						const [ x, y ] = [ (x_el - x_bg + width_el/2) * ratio_width, (y_el - y_bg + height_el/2) * ratio_height ];
						// console.log(x, y);
						if(index == 0) {
							begin = { x, y }
							canvasContext.moveTo(x, y);
						} else canvasContext.lineTo(x, y);
				
						if(this.caseInfo.distressType != 29 && index == hotSpotIdOrder.length - 1) canvasContext.lineTo(begin.x, begin.y);
					}
					canvasContext.closePath();
					canvasContext.stroke();
					
					// 產出jpg
					html2canvas(containerDom, { canvas, backgroundColor: 'rgba(0, 0, 0, 0)' }).then(canvas => {
						this.caseInfo[imgType] = canvas.toDataURL("image/jpeg");

						if(imgType == "imgZoomIn" && this.caseInfo.imgZoomOut.length == 0) this.screenshot("imgZoomOut", this.panorama.getHfov()+30);
						// NOTE: test download
						// const link = document.createElement('a');
						// link.href = canvas.toDataURL("image/jpeg");
						// link.download = 'test.png';
						// document.body.appendChild(link);
						// link.click();
						// document.body.removeChild(link);
					});
				})
				img.src = imgUrl;
			})
		},
		getDistance(pitch) {
			return Math.abs(cameraHeight / Math.tan(pitch * Math.PI / 180));
		},
		getPosition(dist, yaw) {
			const r = 0.00000900900901;
			const panoramaInfo = Object.values(this.panoramaInfoProps.data).flat().filter(l => l.fileName == this.panorama.getScene())[0];
			// console.log("x: ", dist * Math.sin((yaw + panoramaInfo.azimuth) * Math.PI / 180));
			// console.log("y: ", dist * Math.cos((yaw + panoramaInfo.azimuth)  * Math.PI / 180));
			const position = { 
				lat: panoramaInfo.position.lat + dist * r * Math.cos((yaw + panoramaInfo.azimuth)  * Math.PI / 180), 
				lng: panoramaInfo.position.lng + dist * r * Math.sin((yaw + panoramaInfo.azimuth)  * Math.PI / 180) 
			};

			this.$emit("addMarker", { position, type: 2 });

			return position
		},
		getYaw(start, end) {
			const dLng = (end.lng - start.lng) * Math.PI / 180;
			const sLat = start.lat * Math.PI / 180;
			const eLat = end.lat * Math.PI / 180;

			const diff_x = Math.cos(sLat) * Math.sin(eLat) - Math.sin(sLat) * Math.cos(eLat) * Math.cos(dLng); //x
			const diff_y = Math.sin(dLng) * Math.cos(eLat);  // y

			// 返回角度,不是弧度
			const angle = Math.atan2(diff_y, diff_x) * 180 / Math.PI;

			return angle
		},
		getPitch(start, end, height = 0) {
			const diff_x = calcDistance(start, end);
			const diff_y = -cameraHeight + height / 2;

			// 返回角度,不是弧度
			// 以Ｘ軸為起點，逆時針為正的角度
			const angle = 360 * Math.atan2(diff_y, diff_x) / (2 * Math.PI);

			return angle;
		},
		getCoords(position) {
			const panoramaInfo = Object.values(this.panoramaInfoProps.data).flat().filter(l => l.fileName == this.panorama.getScene())[0];
			// console.log(panoramaInfo);
			const yaw = this.getYaw(panoramaInfo.position, position) - panoramaInfo.azimuth;
			const pitch = this.getPitch(panoramaInfo.position, position, 0);
			return { pitch, yaw }
		},
		addDotHotSpot({ pitch, yaw }, type) {
			const cssClass = type == 1 ? `hotSpotIcon redDot id_${this.hotSpotId}` : type == 2 ? "hotSpotIcon greenDot" : "hotSpotIcon blueDot";

			const hotSpot = {
				id: this.hotSpotId,
				type: "info",
				pitch,
				yaw,
				text: `${this.hotSpotId}: (Pitch: ${pitch}, Yaw: ${yaw})`,
				cssClass,
				// coordinates: this.transformMatrix(pitch, yaw),
				clickHandlerArgs: {
					id: this.hotSpotId++
				},
				clickHandlerFunc: (evt, clickHandlerArgs) => {
					// console.log("evt: ", evt);
					console.log(`(Pitch: ${pitch}}, Yaw: ${yaw})`);

					if(clickHandlerArgs && evt.shiftKey) {
						console.log("id: ", clickHandlerArgs.id);
						this.panorama.removeHotSpot(clickHandlerArgs.id, this.panorama.getScene());
						this.hotSpotIdList.dot = this.hotSpotIdList.dot.filter(hotSpot => hotSpot.id != clickHandlerArgs.id);

						this.$emit("clearMarker", clickHandlerArgs.id);
					}
				}
			};

			this.panorama.addHotSpot(hotSpot, this.panorama.getScene());
			this.hotSpotIdList.dot.push(hotSpot);

			return hotSpot;
		},
		addCaseHotSpot({ pitch, yaw }, hoverText = "") {
			const hotSpot = {
				id: this.hotSpotId,
				type: "info",
				pitch,
				yaw,
				text: hoverText,
				cssClass: "hotSpotIcon alert"
			};

			this.panorama.addHotSpot(hotSpot, this.panorama.getScene());
			this.hotSpotIdList.case.push(hotSpot);
		},
		resetCaseHotSpot() {
			this.clearHotSpot();
			if(this.panoramaInfoProps.data.length == 0) return;
			const panoramaInfo = Object.values(this.panoramaInfoProps.data).flat().filter(l => l.fileName == this.panorama.getScene())[0];
			// if(!panoramaInfo) return;

			for(const caseSpec of this.caseGeoJson.features) {
				const geoCoordinates = caseSpec.properties.centerPt;
				if(calcDistance(panoramaInfo.position, geoCoordinates) <= 15) {
					const hoverText = `${this.options.caseTypeMap[caseSpec.properties.DistressType]} (${this.options.caseLevelMap[caseSpec.properties.DistressLevel]})`;
					this.addCaseHotSpot(this.getCoords(geoCoordinates), hoverText);
				}
			}
		},
		clearHotSpot(sceneId= this.panorama.getScene()) {
			for(const type in this.hotSpotIdList) {
				for(const hotSpot of this.hotSpotIdList[type]) {
					this.panorama.removeHotSpot(hotSpot.id, sceneId);
				}
			}
			this.hotSpotIdList = {
				dot: [],
				case: []
			};
			this.$emit("clearMarker");
		},

		// NOTE: 預估缺失位置(詹博)
		transformMatrix(pitch, yaw) {
			// NOTE: test Transform - Omega(roll): X軸旋轉; Phi(yaw): Y軸旋轉; Kappa(pitch): Z軸旋轉
			const panoramaInfo = Object.values(this.panoramaInfoProps.data).flat().filter(l => l.fileName == this.panorama.getScene())[0];
			const [ Omega, Phi, Kappa ] = [ 0, panoramaInfo.azimuth * Math.PI / 180, 0 ];
			// const [ Omega, Phi, Kappa ] = [ 0, 0, 0 ];

			// Step1: 旋轉矩陣
			const matrix = [
				[ Math.cos(Phi) * Math.cos(Kappa), Math.cos(Omega) * Math.sin(Kappa) + Math.sin(Omega) * Math.sin(Phi) * Math.cos(Kappa), Math.sin(Omega) * Math.sin(Kappa) - Math.cos(Omega) * Math.sin(Phi) * Math.cos(Kappa) ],
				[ -Math.cos(Phi) * Math.sin(Kappa), Math.cos(Omega) * Math.cos(Kappa) - Math.sin(Omega) * Math.sin(Phi) * Math.sin(Kappa), Math.sin(Omega) * Math.cos(Kappa) + Math.cos(Omega) * Math.sin(Phi) * Math.sin(Kappa) ],
				[ Math.sin(Phi), -Math.sin(Omega) * Math.cos(Phi), Math.cos(Omega) * Math.cos(Phi) ]
			];
			// console.log("matrix: ", matrix);

			// Step2: 像素(x, y) 轉成球面座標角度(yaw -> theta; pitch -> phi)
			const [ Theta_sphere, Phi_sphere ] = [ yaw * Math.PI / 180, pitch * Math.PI / 180 ];
			// const Theta_sphere = (x - this.imageSize.width/2) * (360 / this.imageSize.width) * Math.PI / 180;
			// const Phi_sphere = -(y - this.imageSize.height/2) * (360 / this.imageSize.width) * Math.PI / 180;
			// console.log("Theta: ", Theta_sphere * 180 / Math.PI);
			// console.log("Phi: ", Phi_sphere * 180 / Math.PI);
			
			// Step3: 環景影像座標轉換成(X: lng, Y, Z: lat)
			const coordinates = { 
				x: Math.cos(Phi_sphere) * Math.sin(Theta_sphere),
				y: Math.sin(Phi_sphere),
				z: Math.cos(Phi_sphere) * Math.cos(Theta_sphere)
			}
			// console.log("coordinates: ", coordinates);

			// Step4: 修正球型旋轉，並計算 (X,Y,Z) 旋轉後不帶尺度S的向量(P, Q, R)
			const vectorUnit = {
				p: matrix[0][0] * coordinates.x + matrix[1][0] * coordinates.y + matrix[2][0] * coordinates.z,
				q: matrix[0][1] * coordinates.x + matrix[1][1] * coordinates.y + matrix[2][1] * coordinates.z,
				r: matrix[0][2] * coordinates.x + matrix[1][2] * coordinates.y + matrix[2][2] * coordinates.z
			}
			// console.log("vectorUnit: ", vectorUnit);

			// Step5: 假設量測點的相對高度已知，如2.5公尺
			const r = 0.00000900900901  //(度/公尺);
			const S = cameraHeight * r / vectorUnit.q;
			// console.log(S);

			// Step6: 求量測點的三維座標
			const geoCoordinates = {
				lng: panoramaInfo.position.lng - vectorUnit.p * S,
				// z: -cameraHeight - vectorUnit.q * S,
				lat: panoramaInfo.position.lat - vectorUnit.r * S
			}
			// console.log("geoCoordinates: ", geoCoordinates);
			return geoCoordinates;
		},
	}
}
</script>

<style lang="sass">
.imgHover
	max-width: 600px
	height: 300px

.panorama-view
	#panorama
		height: calc(100vh - 50px)
		.pnlm-controls
			background-color: rgba(white, 0.5)
			position: absolute
			transform: translateZ(9999px) scale(1.2)
			filter: invert(1)
		.pnlm-controls-container
			height: 100%
			right: 50px
			left: auto
			.pnlm-zoom-controls
				bottom: 20px
			.pnlm-fullscreen-toggle-button
				top: 5px
		.pnlm-compass
			cursor: pointer
			right: 10px
			bottom: 104px
		.hotSpotIcon
			cursor: pointer
			width: 26px
			height: 26px
			background-position: center 
			background-size: contain 
			background-repeat: no-repeat 
			&.pnlm-hotspot-base:hover
				z-index: 10
			&.redDot
				background-image: url('../../../public/assets/icon/icon_redDot.png')
				background-size: 20% 
			&.greenDot
				background-image: url('../../../public/assets/icon/icon_greenDot.png')
				background-size: 40% 
			&.blueDot
				background-image: url('../../../public/assets/icon/icon_blueDot.png')
				background-size: 20% 
			&.alert
				background-image: url('../../../public/assets/icon/icon_alert.png')
				background-size: 100% 
				filter: drop-shadow(0px 0px 3px red)
		.pnlm-hotspot.pnlm-scene
			z-index: 10
			opacity: 0.8
		.info-box
			position: absolute
			width: 280px
			background-color: rgba(white, 0.6)
			z-index: 11
			&.right
				top: 100px
				right: 15px
			.el-card__body
				position: relative
				padding: 5px
				max-height: 650px
				overflow-x: hidden
				overflow-y: auto
				.el-form-item
					margin-bottom: 10px
					.el-form-item__label
						line-height: 40px
					.el-select, .road-dir, .el-textarea, .el-date-editor
						width: 160px
						.el-input__inner, .el-textarea__inner
							padding: 5px 0
						.el-input__inner
							text-align: center
					.btn-img-action
						display: flex
						flex-direction: column
						justify-content: space-evenly
						align-items: center
						height: 100px
						& > .el-button
							margin-left: 0
				.btn-action-group
					display: flex
					width: 100%
					padding: 0
					.el-button
						flex: 1
						padding: 10px 0
				.road-dir > .el-input-group__prepend .el-select
						width: 100px
	.btn_panorama
		position: absolute
		bottom: 40px
		left: 40px
		height: 80px
		background-color: white
		background-color: #E1F5FE
		overflow: hidden
		padding: 5px
		z-index: 15
		.v-btn__content
			display: flex
			flex-direction: column
		.name
			white-space: pre-wrap
			text-align: center
			font-size: 14px
</style>