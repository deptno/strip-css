#!/usr/bin/env node

import {readFileSync} from 'fs'
import {join} from 'path'
import {PassThrough} from 'stream'
import program from 'commander'
import {strip} from './strip'

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

const command = program.parse(process.argv)
const omit = {
  rule: command.rule || [],
  atrule: command.atrule || []
}
const input = readFileSync(0).toString()
const output = strip(input, omit)
const pt = new PassThrough()

pt.end(output)
pt.pipe(process.stdout)
