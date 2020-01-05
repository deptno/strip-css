#!/usr/bin/env node

import {readFileSync} from 'fs'
import {join} from 'path'
import {PassThrough} from 'stream'
import * as tree from 'css-tree'
import program from 'commander'
import debug from 'debug'

const log = debug('strip-css')
const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json')).toString(),
)

program
  .version(pkg.version)
  .requiredOption('-o, --omit <rule...>', 'rule is css selector you want to strip', (arg, all = []) =>
    [...all, new RegExp(arg)]
  )

const omitRules = program.parse(process.argv).omit

log(omitRules)
const css = readFileSync(0).toString()
const ast = tree.parse(css)
const omitSet = new Set<string>()
let ruleCount = 0

tree.walk(ast, (node, item, list) => {
  if (node.type === 'Rule') {
    ruleCount++
    tree.walk(node, ((node1, item1, list1) => {
      if (node1.type === 'ClassSelector') {
        if (omitRules.some(r => r.test(node1.name))) {
          if (omitSet.has(node1.name)) {
            return
          }
          omitSet.add(node1.name)

          try {
            list.remove(item)
          } catch (e) {
            // node is already removed
          }
        }
      }
    }))
  }
})
const nextCss = tree.generate(ast)

console.error(`rule ${ruleCount - omitSet.size}: ${ruleCount} - ${omitSet.size}`)
console.error(`bytes ${nextCss.length}, ${Math.ceil(nextCss.length / 2 ** 10)}KB: ${css.length} - ${css.length - nextCss.length}`)

const pt = new PassThrough()
pt.end(nextCss)
pt.pipe(process.stdout)
