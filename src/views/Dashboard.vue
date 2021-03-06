<template>
  <div id="dashboard">
    <vue-pull-refresh
      :on-refresh="onRefresh"
      :config="pullConfig"
    >
      <div class="row">
        <div v-if="!$vuetify.breakpoint.smAndDown" id="dashboard-sidebar">
          <v-img
            class="logo-image-small"
            :src="require('@/assets/jb-sygnet.png')"
          />
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn large color="white" v-on="on" @click="$router.push('/map')" icon>
                <v-icon>
                  mdi-map-marker
                </v-icon>
              </v-btn>
            </template>
            <span>Mapa</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn large color="white" v-on="on" icon @click="notificationsInfo">
                <v-icon>
                  mdi-bell
                </v-icon>
              </v-btn>
            </template>
            <span>Powiadomienia (w trakcie realizacji)</span>
          </v-tooltip>
        </div>
        <div id="chart">
          <v-tooltip max-width="250px" bottom>
            <template v-slot:activator="{ on }">
              <v-icon color="white" class="info-icon" v-on="on">
                mdi-information
              </v-icon>
            </template>
            <span>Wartość polskiego indeksu jakości powietrza liczona jest w oparciu o indywidualne przedziały dla
              poszczególnych zanieczyszczeń, następnie indeks ogólny przyjmuje wartość najgorszego indeksu
              indywidualnego spośród zanieczyszczeń mierzonych na tej stacji lub dominującej wartości (pył zawieszony
              lub ozon).</span>
          </v-tooltip>
          <vue-svg-gauge
            :start-angle="0"
            :end-angle="360"
            :value="closestStationState.gaugeChartData.lastPercentValue"
            :separator-step="0"
            :min="0"
            :max="100"
            :gauge-color="closestStationState.gaugeChartData.backgroundColor"
            base-color="#E0F2F1"
            :scale-interval="0"
            :innerRadius="85"
            :transitionDuration="gaugeTransitionDuration"
          >
            <div class="inner-text">
              <div class="row chart">
                <div class="column" v-if="innerGaugeChartData">
                  <p class="white-data-paragraph">
                    <animated-number
                      :value="closestStationState.gaugeChartData.lastPercentValue"
                      :formatValue="formatPercentValue"
                      :duration="closestStationState.gaugeChartData.lastPercentValue * 15"
                      :round="1"
                    /><br>
                    <animated-number
                      :value="closestStationState.gaugeChartData.lastValue"
                      :formatValue="formatValue"
                      :duration="closestStationState.gaugeChartData.lastValue * 15"
                      :round="1"
                    /><br>
                    {{closestStationState.gaugeChartData.symbol}}
                  </p>
                  <p class="index-level-paragraph" :style="{'color': closestStationState.gaugeChartData.backgroundColor}">
                    {{closestStationState.gaugeChartData.pollutionLevel}}</p>
                </div>
                <v-progress-circular
                  v-else
                  size="100"
                  indeterminate
                  color="#E6C136"
                  width="8"
                ></v-progress-circular>
              </div>
            </div>
          </vue-svg-gauge>
        </div>
      </div>
      <transition name="popup">
        <div class="row" v-if="dataStatement">
          <div id="data-container">
            <div class="row dashboard-data">
              <div align="center" class="data-element dashboard">
                <v-img
                  :src="require('@/assets/road-yellow.png')"
                  class="icon dashboard"
                />
                <p class="icon-text-paragraph">Odległość</p>
                  <p class="data-paragraph">{{closestStationState.stationDistance}}</p>
              </div>
              <div align="center" class="data-element dashboard station-name">
                <v-img
                  :src="require('@/assets/place-yellow.png')"
                  class="icon dashboard"
                />
                <p class="icon-text-paragraph">Stacja pomiarowa</p>
                <p class="data-paragraph">{{closestStationState.stationName }}<br><span class="city-text">
                  {{closestStationState.city}}</span></p>
              </div>
              <div align="center" class="data-element dashboard">
                <v-img
                  :src="require('@/assets/clock.png')"
                  class="icon dashboard"
                />
                <p class="icon-text-paragraph">Ostatni pomiar ({{closestStationState.gaugeChartData.symbol}})</p>
                <p class="data-paragraph">{{closestStationState.gaugeChartData.time}}</p>
              </div>
            </div>
            <div class="row dashboard-data">
              <div align="center" class="data-element">
                <v-img
                  :src="require('@/assets/fog-yellow.png')"
                  class="icon dashboard"
                />
                <p class="icon-text-paragraph">Jakość powietrza</p>
                <div class="row" v-for="sensor in closestStationState.sensors" :key="sensor.index">
                  <div class="column sensor-symbol">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <p v-on="on" class="sensor-symbol-paragraph">{{ sensor.symbol }}</p>
                      </template>
                      <span>{{ sensor.name }}</span>
                    </v-tooltip>
                  </div>
                  <div class="column">
                    <vue-apex-charts type="bar" :height="horizontalChartHeight" :width="horizontalChartWidth" :options="mapHorizontalBarChartOptions(sensor)" :series="mapHorizontalBarChartSeries(sensor)"></vue-apex-charts>
                  </div>
                  <div class="column">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <v-btn @click="setChartDialogDataState({ id: sensor.id, apiResponse: apiResponseStateDashboard })" class="details-button" normal color="white" v-on="on" icon>
                          <v-icon>
                            mdi-dots-horizontal
                          </v-icon>
                        </v-btn>
                      </template>
                      <span>Pokaż szczegóły</span>
                    </v-tooltip>
                  </div>
                </div>
              </div>
            </div>
            <div class="row dashboard-data" v-if="thirdRowStatement">
              <div align="center" class="data-element dashboard">
                <v-img
                  :src="require('@/assets/termometer.png')"
                  class="icon dashboard"
                />
                <p class="icon-text-paragraph">Temperatura</p>
                <p class="data-paragraph">{{closestStationState.temperature+' &ordm;C'}}</p>
              </div>
              <div align="center" class="data-element dashboard">
                <v-img
                  :src="require('@/assets/pressure.png')"
                  class="icon dashboard"
                />
                <p class="icon-text-paragraph">Ciśnienie</p>
                <p class="data-paragraph">{{closestStationState.pressure+' hPa'}}</p>
              </div>
              <div align="center" class="data-element dashboard">
                <v-img
                  :src="require('@/assets/wind.png')"
                  class="icon dashboard"
                />
                <p class="icon-text-paragraph">Prędkość wiatru</p>
                <p class="data-paragraph">{{closestStationState.wind+' km/h'}}</p>
              </div>
              <div align="center" class="data-element dashboard">
                <v-img
                  :src="require('@/assets/humidity.png')"
                  class="icon dashboard humidity"
                />
                <p class="icon-text-paragraph">Wilgotność</p>
                <p class="data-paragraph">{{closestStationState.humidity+'%'}}</p>
              </div>
            </div>
          </div>
        </div>
      </transition>
      <div v-if="$vuetify.breakpoint.smAndDown" id="bottom-navigation">
        <div class="bottom-nav-element">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn small color="white" v-on="on" @click="$router.push('/map')"
                     icon>
                <v-icon>
                  mdi-map-marker
                </v-icon>
              </v-btn>
            </template>
            <span>Mapa</span>
          </v-tooltip>
        </div>
        <div class="bottom-nav-element">
          <v-img
            class="logo-image-small bottom-nav"
            :src="require('@/assets/jb-sygnet.png')"
          />
        </div>
        <div class="bottom-nav-element">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn small color="white" v-on="on" icon @click="notificationsInfo">
                <v-icon>
                  mdi-bell
                </v-icon>
              </v-btn>
            </template>
            <span>Powiadomienia (w trakcie realizacji)</span>
          </v-tooltip>
        </div>
      </div>
    </vue-pull-refresh>
  </div>
</template>

<script>
import { bus } from '@/main'
import VuePullRefresh from 'vue-pull-refresh'
import AnimatedNumber from 'animated-number-vue'
import { VueSvgGauge } from 'vue-svg-gauge'
import { mapActions, mapState } from 'vuex'
import Functions from '@/libs/sharedFunctions'
import StationsService from '@/services/StationsService'
import VueApexCharts from 'vue-apexcharts'
export default {
  name: 'Dashboard',
  data () {
    return {
      pullConfig: {
        errorLabel: 'Wystąpił błąd',
        startLabel: 'Start',
        readyLabel: 'Gotowe',
        loadingLabel: 'Proszę czekać...'
      },
      dataStatement: false,
      functions: new Functions(),
      stationsService: new StationsService()
    }
  },
  components: {
    'vue-pull-refresh': VuePullRefresh,
    VueSvgGauge,
    AnimatedNumber,
    VueApexCharts
  },
  methods: {
    notificationsInfo () {
      bus.$emit('setInformationDialog', { informationDialogVisibility: true, informationDialogText: 'Powiadomienia (w trakcie realizacji)' })
    },
    onRefresh: function () {
      return new Promise(function (resolve) {
        setTimeout(function () {
          if (navigator.onLine) {
            window.location.reload(true)
          } else {
            bus.$emit('setInformationDialog', { informationDialogVisibility: true, informationDialogText: 'Brak połączenia z internetem.' })
            resolve()
          }
        }, 1000)
      })
    },
    ...mapActions('sensors', ['setChartDialogDataState']),
    mapHorizontalBarChartLimit (sensor) {
      if (sensor.lastPercentValue > 100) {
        return Math.ceil(sensor.lastPercentValue / 50) * 50
      } else {
        return 100
      }
    },
    mapHorizontalBarChartSeries (sensor) {
      return [{
        name: sensor.pollutionLevel,
        data: [sensor.lastPercentValue]
      }]
    },
    mapHorizontalBarChartOptions (sensor) {
      return {
        tooltip: {
          y: {
            formatter: (value) => { return value + '%' }
          }
        },
        colors: [sensor.backgroundColor],
        legend: {
          show: false
        },
        chart: {
          parentHeightOffset: 0,
          foreSize: 15,
          foreColor: '#fff',
          toolbar: {
            show: false
          },
          type: 'bar'
        },
        plotOptions: {
          bar: {
            horizontal: true,
            distributed: true
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: [sensor.symbol],
          labels: {
            style: {
              fontSize: '15px'
            }
          }
        },
        yaxis: {
          max: this.mapHorizontalBarChartLimit(sensor),
          labels: {
            show: false,
            style: {
              fontSize: '16px'
            }
          }
        }
      }
    },
    formatPercentValue (value) {
      return `<p class="percent-value-paragraph">${value + '%'}</p>`
    },
    formatValue (value) {
      return `<p class="value-paragraph">(${value + ' &#181/m'}<sup>3</sup>)</p>`
    }
  },
  computed: {
    ...mapState('stations', ['closestStationState', 'routeState']),
    ...mapState('sensors', ['apiResponseStateDashboard']),
    innerGaugeChartData () {
      return this.closestStationState.gaugeChartData.lastPercentValue !== 0
    },
    dataStatementHolder () {
      return this.closestStationState.stationDistance !== null && this.closestStationState.stationName !== null && this.closestStationState.gaugeChartData.time !== null && this.routeState === '/dashboard'
    },
    thirdRowStatement () {
      return this.closestStationState.temperature !== null || this.closestStationState.pressure !== null || this.closestStationState.wind !== null || this.closestStationState.humidity !== null
    },
    gaugeTransitionDuration () {
      if (this.closestStationState.gaugeChartData.lastPercentValue <= 100) {
        return this.closestStationState.gaugeChartData.lastPercentValue * 15
      } else {
        return 1500
      }
    },
    horizontalChartWidth () {
      if (this.$vuetify.breakpoint.xsOnly) {
        return 230
      } else {
        return 550
      }
    },
    horizontalChartHeight () {
      if (this.$vuetify.breakpoint.xsOnly) {
        return 90
      } else {
        return 100
      }
    }
  },
  watch: {
    'dataStatementHolder' (value) {
      if (value === true) {
        setTimeout(function () {
          this.dataStatement = true
        }
          .bind(this),
        this.closestStationState.gaugeChartData.lastPercentValue * 16)
      }
    }
  }
}
</script>

<style lang="scss">
  #dashboard {
    @media only screen and (max-width: 599px) {
      ::-webkit-scrollbar {
        display: none;
      }
    }
    align-content: center;
    overflow-y: hidden;
    overflow-x: hidden;
    justify-content: center;
    width: 100%;
    height: 100vh;
    background: linear-gradient(
        to top right,
        rgba(0,77,64,.9),
        rgba(0,77,64,.9)
    ),url(../assets/appImage.jpg)
  }
</style>
