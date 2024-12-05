const fs = require('fs')
const hbs = require('handlebars')
const path = require('path')

const entriesJoin = path.join.bind(path, __dirname, '..', 'entries')

module.exports = async ({ name, title }) => {
  const templateFilePath = entriesJoin('entry.md.example')
  const templateFile = fs.readFileSync(templateFilePath, 'utf-8')
  const template = hbs.compile(templateFile)
  const entry = template({ title })
  const entryPath = entriesJoin(`${name}.md`)
  fs.writeFileSync(entryPath, entry, 'utf-8')
}
