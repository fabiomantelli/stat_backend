const fetch = require('node-fetch')
const db = require('../config/database')

const Stat = require('../models/Stat')

// Method to create a new 'stat' in database
exports.createStat = async (req, res) => {
  // function to get STAT openPDC
  async function getStat (ppa, startTime, endTime) {
    const data = []

    for (let i = 0; i < ppa.length; i++) {
      const response = await fetch(`http://150.162.19.214:6052/historian/timeseriesdata/read/historic/${ppa[i].totalFrames},${ppa[i].minimumLatency},${ppa[i].maximumLatency},${ppa[i].averageLatency},${ppa[i].dataError},${ppa[i].configurationChange},${ppa[i].pmuTimeQuality}/${startTime}/${endTime}/json`)
      data[i] = await response.json()
    }

    console.log(`data: ${data}`)
    return data
  }

  const average = (input, ppa) => {
    const stat = []
    const max = 5184000

    // Iterates all the statistics for each PMU
    input.forEach((element, index) => {
      // TotalFrames (filters by totalFrames and calculates the daily average)
      const totalFrames = element.TimeSeriesDataPoints
        .filter((frame) => frame.HistorianID === ppa[index].totalFrames && frame.Value > 0)
      const totalFramesSum = totalFrames
        .reduce((prev, frame) => prev + frame.Value, 0)

      const totalFramesPer = totalFramesSum / max

      // Average Latency (filters by Average Latency and calculates the daily average)
      const latencySerie = element.TimeSeriesDataPoints
        .filter((lat) => lat.HistorianID === ppa[index].averageLatency && lat.Value > 0)
      const latencySum = latencySerie
        .reduce((prev, lat) => prev + lat.Value, 0)

      // Return Average Latency with Math.trunc (int)
      const averageLatency = Math.trunc(latencySum / latencySerie.length)

      // Adequate Latency (get latencySerie and calculates the daily average)
      const adequateLatency = latencySerie
        .filter((lat) => lat.Value >= 250) // Filter for latencies greater than 250 milliseconds
        .reduce((prev) => prev + 1, 0)

      const adequateLatencyPer = totalFramesPer * (1 - adequateLatency / 8640)

      // Minimum Latency (filters by Minimum Latency and take the smallest)
      const minimumLatency = element.TimeSeriesDataPoints
        .filter((lat) => lat.HistorianID === ppa[index].minimumLatency && lat.Value > 0)
        .reduce((prev, lat) => (lat.Value < prev ? lat.Value : prev), Number.POSITIVE_INFINITY)

      // Maximum Latency (filters by Maximum Latency and take the biggest)
      const maximumLatency = element.TimeSeriesDataPoints
        .filter((lat) => lat.HistorianID === ppa[index].maximumLatency && lat.Value > 0)
        .reduce((prev, lat) => (lat.Value > prev ? lat.Value : prev), 0)

      // Data Errors (filters by dataError and calculates the daily average)
      const dataError = element.TimeSeriesDataPoints
        .filter((data) => data.HistorianID === ppa[index].dataError)
        .reduce((prev, data) => prev + data.Value, 0)

      const dataErrorPer = totalFramesPer * (1 - dataError / max)

      // Configuration Change (filters by configurationChange and calculates the daily average)
      const configuration = element.TimeSeriesDataPoints
        .filter((conf) => conf.HistorianID === ppa[index].configurationChange)
        .reduce((prev, conf) => prev + conf.Value, 0)

      const configurationPer = totalFramesPer * (1 - configuration / max)

      // PMU Time Quality ((filters by pmuTimeQuality and calculates the daily average))
      const pmuTimeQuality = element.TimeSeriesDataPoints
        .filter((quality) => quality.HistorianID === ppa[index].pmuTimeQuality)
        .reduce((prev, quality) => prev + quality.Value, 0)

      const pmuTimeQualityPer = totalFramesPer * (1 - pmuTimeQuality / max)

      // creates a statistics vector by PMU
      stat.push({
        id_pmu: ppa[index].id,
        date: req.body.date,
        pmu: ppa[index].pmu,
        dados_recebidos: totalFramesPer,
        latencia_conforme: adequateLatencyPer,
        latencia_minima: minimumLatency === Number.POSITIVE_INFINITY ? 0 : minimumLatency,
        latencia_media: averageLatency || 0,
        latencia_maxima: maximumLatency || 0,
        dados_adequados: dataErrorPer,
        configuracao: configurationPer,
        pmu_time_quality: pmuTimeQualityPer
      })
    })

    // returns all statistics per PMU
    return stat
  }

  const ppa = {
    brazilianSystem: [
      {
        id: '2', pmu: 'ufpa', totalFrames: 2120, minimumLatency: 2125, maximumLatency: 2126, averageLatency: 2133, dataError: 153, configurationChange: 2129, pmuTimeQuality: 154
      },
      {
        id: '3', pmu: 'unifei', totalFrames: 2048, minimumLatency: 2053, maximumLatency: 2054, averageLatency: 2061, dataError: 156, configurationChange: 2057, pmuTimeQuality: 157
      },
      {
        id: '4', pmu: 'unb', totalFrames: 492, minimumLatency: 497, maximumLatency: 498, averageLatency: 505, dataError: 159, configurationChange: 501, pmuTimeQuality: 160
      },
      {
        id: '5', pmu: 'coppe', totalFrames: 510, minimumLatency: 515, maximumLatency: 516, averageLatency: 523, dataError: 162, configurationChange: 519, pmuTimeQuality: 163
      },
      {
        id: '6', pmu: 'ufc', totalFrames: 2237, minimumLatency: 2242, maximumLatency: 2243, averageLatency: 2250, dataError: 165, configurationChange: 2246, pmuTimeQuality: 166
      },
      {
        id: '7', pmu: 'usp-sc', totalFrames: 2138, minimumLatency: 2143, maximumLatency: 2144, averageLatency: 2151, dataError: 168, configurationChange: 2147, pmuTimeQuality: 169
      },
      {
        id: '8', pmu: 'utfpr', totalFrames: 1976, minimumLatency: 1981, maximumLatency: 1982, averageLatency: 1989, dataError: 171, configurationChange: 1985, pmuTimeQuality: 172
      },
      {
        id: '9', pmu: 'ufsc', totalFrames: 24734, minimumLatency: 24739, maximumLatency: 24740, averageLatency: 24747, dataError: 174, configurationChange: 24743, pmuTimeQuality: 175
      },
      {
        id: '10', pmu: 'unir', totalFrames: 1994, minimumLatency: 1999, maximumLatency: 2000, averageLatency: 2007, dataError: 177, configurationChange: 2003, pmuTimeQuality: 178
      },
      {
        id: '11', pmu: 'ufmt', totalFrames: 1916, minimumLatency: 1921, maximumLatency: 1922, averageLatency: 1929, dataError: 180, configurationChange: 1925, pmuTimeQuality: 181
      },
      {
        id: '12', pmu: 'unipampa', totalFrames: 2066, minimumLatency: 2071, maximumLatency: 2072, averageLatency: 2079, dataError: 183, configurationChange: 2075, pmuTimeQuality: 184
      },
      {
        id: '13', pmu: 'ufmg', totalFrames: 2102, minimumLatency: 2107, maximumLatency: 2108, averageLatency: 2115, dataError: 186, configurationChange: 2111, pmuTimeQuality: 187
      },
      {
        id: '14', pmu: 'ufms', totalFrames: 672, minimumLatency: 677, maximumLatency: 678, averageLatency: 685, dataError: 189, configurationChange: 681, pmuTimeQuality: 190
      },
      {
        id: '15', pmu: 'ufpe', totalFrames: 1934, minimumLatency: 1939, maximumLatency: 1940, averageLatency: 1947, dataError: 192, configurationChange: 1943, pmuTimeQuality: 193
      },
      {
        id: '16', pmu: 'uft', totalFrames: 2219, minimumLatency: 2224, maximumLatency: 2225, averageLatency: 2232, dataError: 195, configurationChange: 2228, pmuTimeQuality: 196
      },
      {
        id: '17', pmu: 'ufma', totalFrames: 2084, minimumLatency: 2089, maximumLatency: 2090, averageLatency: 2097, dataError: 1069, configurationChange: 2093, pmuTimeQuality: 1071
      },
      {
        id: '18', pmu: 'ufjf', totalFrames: 1958, minimumLatency: 1963, maximumLatency: 1964, averageLatency: 1971, dataError: 1113, configurationChange: 1967, pmuTimeQuality: 1114
      },
      {
        id: '19', pmu: 'ufba', totalFrames: 1161, minimumLatency: 1166, maximumLatency: 1167, averageLatency: 1174, dataError: 1158, configurationChange: 1170, pmuTimeQuality: 1159
      },
      {
        id: '20', pmu: 'ufrgs', totalFrames: 1214, minimumLatency: 1219, maximumLatency: 1220, averageLatency: 1227, dataError: 1211, configurationChange: 1223, pmuTimeQuality: 1212
      },
      {
        id: '21', pmu: 'ufac', totalFrames: 2012, minimumLatency: 2017, maximumLatency: 2018, averageLatency: 2025, dataError: 1256, configurationChange: 2021, pmuTimeQuality: 1257
      },
      {
        id: '22', pmu: 'ufam', totalFrames: 1343, minimumLatency: 1348, maximumLatency: 1349, averageLatency: 1356, dataError: 1340, configurationChange: 1352, pmuTimeQuality: 1341
      },
      {
        id: '23', pmu: 'unifap', totalFrames: 2030, minimumLatency: 2035, maximumLatency: 2036, averageLatency: 2043, dataError: 1316, configurationChange: 2039, pmuTimeQuality: 1317
      },
      {
        id: '24', pmu: 'ufrr', totalFrames: 20103, minimumLatency: 20108, maximumLatency: 20109, averageLatency: 20116, dataError: 20265, configurationChange: 20112, pmuTimeQuality: 20266
      },
      {
        id: '26', pmu: 'ufes', totalFrames: 3521, minimumLatency: 3526, maximumLatency: 3527, averageLatency: 3534, dataError: 3516, configurationChange: 3530, pmuTimeQuality: 3517
      },
      {
        id: '27', pmu: 'unicamp', totalFrames: 20849, minimumLatency: 20854, maximumLatency: 20855, averageLatency: 20862, dataError: 20844, configurationChange: 20858, pmuTimeQuality: 20845
      },
      {
        id: '29', pmu: 'ufpi', totalFrames: 24303, minimumLatency: 24308, maximumLatency: 24309, averageLatency: 24316, dataError: 24296, configurationChange: 24312, pmuTimeQuality: 24297
      }
    ],
    sepPmu: [
      {
        id: '26', pmu: 'teste1', totalFrames: 3521, minimumLatency: 3526, maximumLatency: 3527, averageLatency: 3534, dataError: 3516, configurationChange: 3530, pmuTimeQuality: 3517
      },
      {
        id: '27', pmu: 'teste2', totalFrames: 20849, minimumLatency: 20854, maximumLatency: 20855, averageLatency: 20862, dataError: 20844, configurationChange: 20858, pmuTimeQuality: 20845
      },
      {
        id: '29', pmu: 'teste3', totalFrames: 24303, minimumLatency: 24308, maximumLatency: 24309, averageLatency: 24316, dataError: 24296, configurationChange: 24312, pmuTimeQuality: 24297
      }
    ]
  }

  const time1 = ' 00:00:00.000'
  // const time2 = ' 23:59:59.999'
  const time2 = ' 00:00:01.999'
  const startTime = req.body.date + time1
  const endTime = req.body.date + time2
  const system = req.body.system
  console.log(`PPA: ${JSON.stringify(ppa)}`)
  console.log(`System: ${system}`)
  console.log(`Length of ppa.system: ${ppa.brazilianSystem}`)
  console.log(`startTime: ${startTime}`)
  console.log(`endTime: ${endTime}`)

  const dados = await getStat(ppa.brazilianSystem, startTime, endTime)
  const getData = average(dados, ppa.brazilianSystem)

  const promises = []
  try {
    for (let i = 0; i < ppa.brazilianSystem.length; i++) {
      const {
        id_pmu, date, pmu, dados_recebidos, latencia_conforme, latencia_minima, latencia_media, latencia_maxima, dados_adequados, configuracao, pmu_time_quality
      } = getData[i]
      const stat = await Stat.create({
        id_pmu,
        date: startTime,
        pmu,
        dados_recebidos,
        latencia_conforme,
        latencia_minima,
        latencia_media,
        latencia_maxima,
        dados_adequados,
        configuracao,
        pmu_time_quality,
        system
      })

      promises.push(stat)
    }
  } catch (e) {
    console.log(e)
  }

  res.status(201).send({
    message: 'Statistic added successfully!',
    body: {
      promises
      // stat: {
      //   id_pmu,
      //   date,
      //   pmu,
      //   dados_recebidos,
      //   latencia_conforme,
      //   latencia_minima,
      //   latencia_media,
      //   latencia_maxima,
      //   dados_adequados,
      //   configuracao,
      //   pmu_time_quality,
      // },
    }
  })
}

// Method to list all 'stat' in database
exports.listAllStat = async (req, res) => {
  const { date } = req.query
  console.log(`date backend: ${date}`)

  const stat = await Stat.findAll({
    where: {
      date
    },
    attributes: {
      exclude: ['id', 'date', 'createdAt', 'updatedAt']
    }
  })

  if (!stat.length) {
    return res.status(400).json({
      error: 'Data not found'
    })
  }

  return res.status(200).json(stat)
}

// Method to delete a 'stat' in database
exports.deleteStat = async (req, res) => {
  const { date } = req.params

  try {
    await db.query('DELETE FROM statistic WHERE date = $1', [
      date
    ])
  } catch (e) {
    res.status(400).send({ message: 'Date invalid on database', date })
  }

  res.status(200).send({ message: 'Statistic deleted successfully!', date })
}
