const axios = require('axios')
const Stat = require('../models/Stat.js')
const databaseCredentials = require('../config/database.js')
const ppa = require('../models/PrimaryPhasorArchive.js')

exports.createStat = async (req, res) => {
  const date = req.body.date
  const startTime = date + ' 00:00:00.000'
  const endTime = date + ' 23:59:59.999'
  const system = req.body.system
  console.log(`startTime: ${startTime}`)
  console.log(`endTime: ${endTime}`)

  const statistic = await statisticFromOpenPdc(ppa[system], system, startTime, endTime)
  const statisticAverage = average(statistic, ppa[system], date)

  const promises = []
  try {
    for (const statisticByPmu of statisticAverage) {
      const {
        id_pmu, date, pmu, dados_recebidos, latencia_conforme, latencia_minima, latencia_media, latencia_maxima, dados_adequados, configuracao, pmu_time_quality
      } = statisticByPmu

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
  } catch (e) { console.log(e) }

  res.status(201).send({
    message: 'Statistic added successfully!',
    body: { promises }
  })
}

exports.listAllStat = async (req, res) => {
  const { date } = req.query
  const stat = await Stat.findAll({
    where: { date },
    attributes: { exclude: ['id', 'date', 'createdAt', 'updatedAt', 'system'] }
  })
  if (!stat.length) return res.status(400).json({ error: 'Data not found' })
  return res.status(200).json(stat)
}

exports.deleteStat = async (req, res) => {
  const { date } = req.params
  try {
    await databaseCredentials.query('DELETE FROM statistic WHERE date = $1', [date])
  } catch (e) {
    res.status(400).send({ message: 'Date invalid on database', date })
  }
  res.status(200).send({ message: 'Statistic deleted successfully!', date })
}

async function statisticFromOpenPdc (ppa, system, startTime, endTime) {
  const SERVER_214 = '150.162.19.214'
  const SERVER_218 = '150.162.19.218'
  const data = []

  let server
  switch (system) {
    case 'brazilianSystem':
      server = SERVER_214
      break
    case 'sepPmu':
      server = SERVER_218
  }

  for (let i = 0; i < ppa.length; i++) {
    try {
      const response = await axios.get(`http://${server}:6052/historian/timeseriesdata/read/historic/${ppa[i].totalFrames},${ppa[i].minimumLatency},${ppa[i].maximumLatency},${ppa[i].averageLatency},${ppa[i].dataError},${ppa[i].configurationChange},${ppa[i].pmuTimeQuality}/${startTime}/${endTime}/json`)
      data[i] = response.data.TimeSeriesDataPoints
    } catch (err) { console.log(err) }
  }
  return data
}

const average = function (statistic, ppa, date) {
  const MAXIMUM_LATENCY_LIMIT = 250
  const MAX_NUMBER_OF_PHASORS_IN_ON_DAY = 5184000
  const MAX_NUMBER_OF_STATISTICS_IN_ON_DAY = 8640
  const statisticByPmu = []

  statistic.forEach((element, index) => {
    const totalFrames = element
      .filter((frame) => frame.HistorianID === ppa[index].totalFrames && frame.Value > 0)
    const totalFramesSum = totalFrames
      .reduce((prev, frame) => prev + frame.Value, 0)
    const totalFramesPercentual = totalFramesSum / MAX_NUMBER_OF_PHASORS_IN_ON_DAY

    const latencySerie = element
      .filter((latency) => latency.HistorianID === ppa[index].averageLatency && latency.Value > 0)
    const latencySum = latencySerie
      .reduce((prev, latency) => prev + latency.Value, 0)
    const averageLatency = Math.trunc(latencySum / latencySerie.length)

    const adequateLatency = latencySerie
      .filter((latency) => latency.Value >= MAXIMUM_LATENCY_LIMIT)
      .reduce((prev) => prev + 1, 0)
    const adequateLatencyPercentual = totalFramesPercentual * (1 - adequateLatency / MAX_NUMBER_OF_STATISTICS_IN_ON_DAY)

    const minimumLatency = element
      .filter((latency) => latency.HistorianID === ppa[index].minimumLatency && latency.Value > 0)
      .reduce((prev, latency) => (latency.Value < prev ? latency.Value : prev), Number.POSITIVE_INFINITY)

    const maximumLatency = element
      .filter((latency) => latency.HistorianID === ppa[index].maximumLatency && latency.Value > 0)
      .reduce((prev, latency) => (latency.Value > prev ? latency.Value : prev), 0)

    const dataError = element
      .filter((data) => data.HistorianID === ppa[index].dataError)
      .reduce((prev, data) => prev + data.Value, 0)
    const dataErrorPercentual = totalFramesPercentual * (1 - dataError / MAX_NUMBER_OF_PHASORS_IN_ON_DAY)

    const configuration = element
      .filter((configuration) => configuration.HistorianID === ppa[index].configurationChange)
      .reduce((prev, configuration) => prev + configuration.Value, 0)
    const configurationPercentual = totalFramesPercentual * (1 - configuration / MAX_NUMBER_OF_PHASORS_IN_ON_DAY)

    const pmuTimeQuality = element
      .filter((quality) => quality.HistorianID === ppa[index].pmuTimeQuality)
      .reduce((prev, quality) => prev + quality.Value, 0)
    const pmuTimeQualityPercentual = totalFramesPercentual * (1 - pmuTimeQuality / MAX_NUMBER_OF_PHASORS_IN_ON_DAY)

    statisticByPmu.push({
      id_pmu: ppa[index].id,
      date,
      pmu: ppa[index].pmu,
      dados_recebidos: totalFramesPercentual,
      latencia_conforme: adequateLatencyPercentual,
      latencia_minima: minimumLatency === Number.POSITIVE_INFINITY ? 0 : minimumLatency,
      latencia_media: averageLatency || 0,
      latencia_maxima: maximumLatency || 0,
      dados_adequados: dataErrorPercentual,
      configuracao: configurationPercentual,
      pmu_time_quality: pmuTimeQualityPercentual
    })
  })
  return statisticByPmu
}
