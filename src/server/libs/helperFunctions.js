module.exports = {
  getData: function ({ data }) {
    return data
  },
  stationsFilter: function ({ id, stationName, city, gegrLat, gegrLon }) {
    return {
      id,
      stationName,
      city: city ? city.name : '',
      gegrLat,
      gegrLon
    }
  },
  sensorsFilter: function ({ id, param }) {
    return {
      id,
      param: param ? param.paramName : '',
      paramTwo: param ? param.paramFormula : ''
    }
  }
}
