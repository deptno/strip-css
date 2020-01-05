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
  .option(
    '-r, --rule <rules...>',
    'rule',
    (arg, all = []) => [...all, new RegExp(arg)],
  )
  .option(
    '-a, --atrule <atrules...>',
    '@rule',
    (arg, all = []) => [...all, new RegExp(arg)],
  )

const omitRules = program.parse(process.argv).rule || []
const omitAtrules = program.parse(process.argv).atrule || []
const css = readFileSync(0).toString()
const ast = tree.parse(css)
const omitSet = new Set<string>()
let ruleCount = 0

log(omitRules)

tree.walk(
  ast,
  (node, item, list) => {
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
    } else if (node.type === 'Atrule') {
      const atruleCss = tree.generate(node)

      if (omitAtrules.some(r => r.test(atruleCss))) {
        log(
          atruleCss
            .slice(0, atruleCss.indexOf('{'))
            .trim()
        )
        list.remove(item)
      }
    }
  },
)
const nextCss = tree.generate(ast)

console.error(`rule ${ruleCount - omitSet.size}: ${ruleCount} - ${omitSet.size}`)
console.error(`bytes ${nextCss.length}, ${Math.ceil(nextCss.length / 2 ** 10)}KB: ${css.length} - ${css.length - nextCss.length}`)

const pt = new PassThrough()
pt.end(nextCss)
pt.pipe(process.stdout)
