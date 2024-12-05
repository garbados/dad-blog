const fp = require('./flatpages')
const fs = require('fs')
const hbs = require('handlebars')
const path = require('path')

const config = require('../config.json')

const FORMAT = 'utf8'

const pathJoin = path.join.bind(path, __dirname, '..')
const templatePathJoin = pathJoin.bind(path, 'resources', 'hbs')

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

hbs.registerHelper('inc', (i) => { return i + 1 })
hbs.registerHelper('capitalize', (s) => { return s[0].toUpperCase() + s.slice(1) })

module.exports = async () => {
  const entries = await fp(pathJoin('entries'))
  const entriesList = Object.entries(entries).map(([ fileName, entry ]) => {
    let {
      html,
      meta: {
        title,
        description,
        order,
        tags
      }
    } = entry
    const name = fileName.substring(0, fileName.search(/\..+$/))
    return { description, name, title, html, tags, order }
  }).sort((a, b) => {
    return a.order < b.order ? 1 : -1
  })
  const entryGroups = entriesList.reduce((groups, entry) => {
    for (const tag of entry.tags) {
      if (!groups[tag]) groups[tag] = []
      groups[tag].push(entry)
    }
    return groups
  }, {})
  const sources = {
    entry: fs.readFileSync(templatePathJoin('entry.hbs'), FORMAT),
    index: fs.readFileSync(templatePathJoin('index.hbs'), FORMAT),
    layout: fs.readFileSync(templatePathJoin('layout.hbs'), FORMAT)
  }
  hbs.registerPartial('layout', sources.layout)
  const templates = {
    index: hbs.compile(sources.index),
    entry: hbs.compile(sources.entry)
  }
  const html = {
    index: templates.index({ config, entryGroups }),
    entries: entriesList.map((entry) => {
      return {
        name: entry.name,
        html: templates.entry({ config, entry })
      }
    })
  }
  fs.writeFileSync(pathJoin('public', 'index.html'), html.index, FORMAT)
  for (let entry of html.entries) {
    fs.writeFileSync(pathJoin('public', `${entry.name}.html`), entry.html, FORMAT)
  }
}
