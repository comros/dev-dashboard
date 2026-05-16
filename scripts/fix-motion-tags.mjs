import fs from 'node:fs'

const closeBad = '</' + 'motion' + '>'
const closeGood = '</' + 'div' + '>'
const openBad = '<' + 'motion' + ' '
const openGood = '<' + 'div' + ' '

const files = process.argv.slice(2)
for (const p of files) {
  let c = fs.readFileSync(p, 'utf8')
  c = c.replaceAll(closeBad, closeGood)
  c = c.replaceAll(openBad, openGood)
  c = c.replace(/\nfunction motion\(\{[\s\S]*?\n\}\n?$/m, '')
  fs.writeFileSync(p, c)
  console.log('fixed', p)
}
