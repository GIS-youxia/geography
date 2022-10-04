<template>
  <div class="wrapper">
    <div id="cesiumContainer"></div>
    <div class="splitLayer-btns">
      <!--一开始关闭卷帘是激活的，也就是说不可点击关闭卷帘-->
      <div
        class="btn"
        :class="{ active: isOpenSpliterLayer }"
        @click="openSpliterLayer"
      >
        开启卷帘
      </div>
      <div
        class="btn"
        :class="{ active: !isOpenSpliterLayer }"
        @click="closeSpliterLayer"
      >
        关闭卷帘
      </div>
    </div>
    <div class="map-types-select">
      <!--实现对mapTypeOptions数组的遍历，然后将选择存入mapType中-->
      <el-select v-model="mapType" placeholder="请选择" @change="selectMapType">
        <el-option
          v-for="item in mapTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>

    <div class="flyTo">
      <!--通过输入经纬度坐标，重新定义地图中心点-->
      <el-input
        v-model="flyToValue"
        placeholder="请输入坐标, 以空格分隔"
        class="flyInput"
      ></el-input>
      <el-button type="primary" class="flyBtn" @click="handleFlyTo"
        >跳转</el-button
      >
      <el-button type="primary" class="flyBtn" @click="handleBack"
        >返回视图</el-button
      >
    </div>

    <div class="choose-panel">
      <div class="base-draw-tool">
        <div class="list-title">点线面绘制</div>
        <div class="tool-container">
          <!-- <button @click="drawBaseDrawActivate('Point')">
            点
          </button>
          <button @click="drawBaseDrawActivate('Polyline')">线</button>
          <button @click="clearBaseDrawActivate">清除</button> -->

          <button @click="drawActivate('polygon')">面</button>
          <button @click="drawActivate('circle')">正圆</button>
          <button @click="drawActivate('ellipse')">椭圆</button>
          <button @click="drawActivate('sector')">扇形</button>
          <button @click="drawActivate('rectangle')">矩形</button>
          <button @click="clearMilitaryPlotLayer">清除</button>
        </div>
      </div>

      <div class="measure-tool">
        <div class="list-title">测量</div>
        <div class="tool-container">
          <button @click="addMeasure('distance')">测距</button>
          <button @click="addMeasure('area')">测面</button>
          <button @click="addMeasure('height')">测高</button>
          <button @click="addMeasure('clear')">清除</button>
        </div>
      </div>
    </div>
    <div class="coordinates-info" v-show="coordinatesInfo.length > 0">
      <div>当前图形顶点坐标为：</div>
      <div class="coordinates-list">
        <span v-for="(item, index) in coordinatesInfo" :key="index">
          {{ item }}
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import point from "../assets/sp.png";
import start from "../assets/start.png";
import end from "../assets/end.png";

export default {
  name: "earth",
  data() {
    return {
      isOpenSpliterLayer: false,
      mapTypeOptions: [
        {
          value: "imageLayer",
          label: "影像图",
        },
        {
          value: "vectorLayer",
          label: "矢量图",
        },
        // {
        //   value: "terrainLayer",
        //   label: "地形图",
        // },
      ],
      mapType: "imageLayer",
      flyToValue: "",
      coordinatesInfo: [],
      mapUrlmapping: {
        mapbox:
          "https://a.tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidWNmbmhlbiIsImEiOiJja2x1Njg1cjMwMWVpMm9xbHM1ZW00MG9sIn0.W-ZPMO8all-8rO3ahmwWMQ",
        tdt:
          "https://t5.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=e70af1f37809e379fe96666e14f3145e",
        gd:
          "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
        ct:
          "https://iserver.supermap.io/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}",
      },
    };
  },
  mounted() {
    this.initMap();
    this.initPlot();
    this.limitMapBounds();
    // this.addSplitLayer(); // 卷帘对比
    this.initMeasureTools(); // 测量工具
  },
  methods: {
    initMap() {
      // Cesium.Ion.defaultAccessToken =
      //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5OWQ2MGY5MS1lODNlLTRhZWEtOGI5YS1jZDNkNTVhNDVjMjUiLCJpZCI6NjQyMzEsImlhdCI6MTYyODk5MzY1N30.YJEmptedBa4CDWrHMbTZ7TVSbbPiE21mN5mADJKSs_o";
      const viewer = new Cesium.Viewer("cesiumContainer", {
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fulllscreenButtond: false,
        vrButton: false,
        infoBox: false,
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
          url: "http://localhost:8080/mapImage/{z}/{x}/{y}.png",
        }),
        // terrainProvider: new Cesium.CesiumTerrainProvider({
        //   url: Cesium.IonResource.fromAssetId(1),
        //   requestVertexNormals: false,
        //   requestWaterMask: false,
        // }),
      });
      this.viewer = viewer;
      // 开启地形检测
      viewer.scene.globe.depthTestAgainstTerrain = Number.POSITIVE_INFINITY;

      this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
          89.592194,
          31.247808,
          1000000
        ),
        orientation: {
          heading: 0,
          pitch: Cesium.Math.toRadians(-90),
          roll: 0.0,
        },
      });
    },
    openSpliterLayer() {
      this.addSplitLayer();
      this.isOpenSpliterLayer = true;
    },
    closeSpliterLayer() {
      this.removeSplitLayer();
      this.isOpenSpliterLayer = false;
    },
    // 限制视角只在西藏地区范围内
    limitMapBounds() {
      // 限制地图浏览范围
      // 限制镜头高度
      const viewer = this.viewer;
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 1000000000;
      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1000;
      // 实时监测镜头范围(该方法会一直调用)
      viewer.scene.preRender.addEventListener(() => {
        // 计算镜头范围方法，该方法会计算当前镜头地理坐标（弧度）范围并返回west,east,north,south 4个范围参数
        let rectangle = viewer.camera.computeViewRectangle();
        // 设置可浏览经纬度范围
        let Range = {
          east: 105,
          south: 40,
          west: 68,
          north: 21,
        };

        // 地理坐标（弧度）转经纬度坐标
        // 弧度转为经纬度，west为左（西）侧边界的经度，以下类推
        let west = (rectangle.west / Math.PI) * 180;
        let north = (rectangle.north / Math.PI) * 180;
        let east = (rectangle.east / Math.PI) * 180;
        let south = (rectangle.south / Math.PI) * 180;
        // 如果视角超出设置范围则跳转视角
        if (
          west < Range.west ||
          north < Range.north ||
          east > Range.east ||
          south > Range.south
        ) {
          viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
              89.592194,
              31.247808,
              1000000
            ),
            orientation: {
              heading: 0,
              pitch: Cesium.Math.toRadians(-90),
              roll: 0.0,
            },
          });
        }
      });
    },
    // 切换地图类型
    selectMapType(type) {
      if (type === "imageLayer") {
        this.viewer.imageryLayers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            // url: this.mapUrlmapping.mapbox,
            url: "http://localhost:8080/mapImage/{z}/{x}/{y}.png",
          })
        );
      }

      if (type === "vectorLayer") {
        this.viewer.imageryLayers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            // url: this.mapUrlmapping.gd,
            url: "http://localhost:8080/roadmap/{z}/{x}/{y}.jpg",
          })
        );
      }
      if (type === "terrainLayer") {
        this.viewer.imageryLayers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: this.mapUrlmapping.tdt,
          })
        );
      }
      if (this.isOpenSpliterLayer) {
        this.addSplitLayer();
      }
    },
    // 添加卷帘效果
    addSplitLayer() {
      this.removeSplitLayer();
      let splitLayer = new Cesium.UrlTemplateImageryProvider({
        url: "http://localhost:8080/roadmap/{z}/{x}/{y}.jpg",
      });
      this.splitControl = new dj3d.SceneControl.ImageLayerSplit(
        this.viewer,
        splitLayer,
        Cesium.ImagerySplitDirection.LEFT
      );
    },
    // 关闭卷帘效果
    removeSplitLayer() {
      if (this.splitControl) {
        this.splitControl.destroy();
        this.splitControl = undefined;
      }
    },
    handleFlyTo() {
      if (!this.flyToValue) {
        this.$message({
          message: "请输入坐标",
          type: "warning",
        });
        return;
      }

      const [lng, lat] = this.flyToValue.split(" ");
      if (lng && lat) {
        this.viewer.camera.setView({ // 设置相机定位的经纬度及高度
          destination: Cesium.Cartesian3.fromDegrees(lng, lat, 60000),
          orientation: {
            heading: 0, // 水平旋转-正北方向
            pitch: Cesium.Math.toRadians(-90), // 上下旋转-俯视朝向
            roll: 0.0, // 视口翻滚角度
          },
        });
      }
    },
    // 返回初始视图
    handleBack() {
      this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(91.128144, 30.49665, 60000),
        orientation: {
          heading: 0,
          pitch: Cesium.Math.toRadians(-90),
          roll: 0.0,
        },
      });
    },
    initMeasureTools() {
      // 测距
      this.mdTool = new dj3d.Map3dTools.Measure.Distance(this.viewer, {
        startImgUrl: start, // 起点图标
        endImgUrl: end, // 终点图标
      });
      // 测高
      this.mhTool = new dj3d.Map3dTools.Measure.Height(this.viewer);
      // 测面
      this.maTool = new dj3d.Map3dTools.Measure.Area(this.viewer);
    },
    addMeasure(type) {
      switch (type) {
        case "height":
          this.measureHeight();
          break;
        case "distance":
          this.measureDistance();
          break;
        case "area":
          this.measureAera();
          break;
        case "clear":
          this.clearMeasure();
          break;
      }
    },
    // 测距
    measureDistance() {
      this.clearMeasure();
      this.mdTool.activate();
    },

    // 测面
    measureAera() {
      this.clearMeasure();
      this.maTool.activate();
    },

    // 测高
    measureHeight() {
      this.clearMeasure();
      this.mhTool.activate();
    },
    // 清除绘制的图形
    clearMeasure() {
      this.mhTool.deactivate();
      this.mhTool.clear();
      this.mdTool.deactivate();
      this.mdTool.clear();
      this.maTool.deactivate();
      this.maTool.clear();
    },
    // 多种形状绘制
    initPlot() {
      this.militaryPlotLayer = new dj3d.LabelPlotting.MilitaryPlot.PlotLayer(
        this.viewer
      );
      this.militaryPlotLayer.setPlotSelectable(true);

      this.plotDraw = new dj3d.LabelPlotting.MilitaryPlot.PlotDraw(this.viewer);
      this.plotDraw.PlotDrawEndEvent.addEventListener((drawPlot, plotType) => {
        if (drawPlot) {
          // console.log(drawPlot);
          const coordinates = drawPlot.coordinates[0];
          this.coordinatesInfo = coordinates;
        }

        drawPlot.remove();
        this.militaryPlotLayer.addPlot(drawPlot.toGeoJson());
      });

      this.plotEdit = new dj3d.LabelPlotting.MilitaryPlot.PlotEdit(
        this.viewer,
        this.militaryPlotLayer
      );
      this.plotEdit.activate();

      this.plotEdit.PlotEditEndEvent.addEventListener((editPlot) => {
        // console.log("editPlot", editPlot);
        if (editPlot) { // 如果对图形进行了更改，那么需要重新更新一下Info的坐标
          const coordinates = editPlot.coordinates[0];
          this.coordinatesInfo = coordinates;
        }
      });
    },
    //激活绘制
    drawActivate(plotType) {
      this.plotDraw.activate(plotType);
    },
    // 清除绘制的图形
    clearMilitaryPlotLayer() {
      this.militaryPlotLayer.clear();
      this.coordinatesInfo = [];
    },
  },
};
</script>
<style scoped>
.wrapper {
  width: 100vw;
  height: 100vh;
}

#cesiumContainer {
  width: 100%;
  height: 100%;
  color: #fff;
}

.splitLayer-btns {
  position: absolute;
  left: 230px;
  top: 16px;
  display: flex;
  z-index: 1000;
  padding: 7px 5px;
  color: #fff;
  border-radius: 4px;
  border: 1px solid skyblue;
  background: rgba(7, 25, 63, 0.8);
}
.splitLayer-btns .btn {
  margin-left: 10px;
  cursor: pointer;
}

.splitLayer-btns .btn:first-child {
  border-right: 1px solid skyblue;
  padding-right: 10px;
}
.splitLayer-btns .btn:hover {
  color: skyblue;
}

.splitLayer-btns .active {
  color: skyblue;
}

.map-types-select {
  position: absolute;
  left: 16px;
  top: 15px;
  z-index: 1000;
}

.flyTo {
  display: flex;
  position: absolute;
  left: 16px;
  top: 80px;
}

.flyTo .flyInput {
  width: 190px;
}

.flyTo .flyBtn {
  width: 80px;
  background: rgba(7, 25, 63, 0.8) !important;
  margin-left: 25px;
}
.flyTo .flyBtn:last-child {
  margin-left: 5px;
}

.choose-panel {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 16px;
  top: 145px;
  width: 300px;
  max-height: 500px;
  overflow-y: scroll;
  border-radius: 4px;
  background: rgba(7, 25, 63, 0.8);
}

.choose-panel > div {
  padding: 10px 15px;
  color: #fff;
}
button {
  background: skyblue !important;
}

.choose-panel > div:not(:last-child) {
  border-bottom: 1px solid skyblue;
}

.tool-container {
  display: flex;
  flex-wrap: wrap;
}

.list-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
}

button {
  background: transparent;
  border: 1px solid skyblue;
  color: #fff;
  padding: 4px 10px;
  border-radius: 2px;
  margin: 3px;
  cursor: pointer;
  min-width: 50px;
}
button:hover {
  background: rgba(7, 25, 63, 0.8);
}

.coordinates-info {
  position: absolute;
  bottom: 20px;
  left: 10px;
  background: #fff;
  color: #000;
  padding: 8px;
  border-radius: 4px;
  max-width: 30%;
  max-height: 30%;
  overflow: scroll;
  word-break: break-all;
}
.coordinates-list {
  display: flex;
  flex-direction: column;
}
</style>
