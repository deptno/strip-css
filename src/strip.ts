import * as tree from 'css-tree'
import debug from 'debug'

const log = debug('strip-css')

export const strip = (css: string, omit) => {
  const ast = tree.parse(css)
  const omitSet = new Set<string>()
  let ruleCount = 0

  tree.walk(
    ast,
    (node, item, list) => {
      if (node.type === 'Rule') {
        ruleCount++
        tree.walk(node, ((node1, item1, list1) => {
          if (node1.type === 'ClassSelector') {
            if (omit.rule.some(r => r.test(node1.name))) {
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

        if (omit.atrule.some(r => r.test(atruleCss))) {
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
  const stripped = tree.generate(ast)

  console.error(`rule ${ruleCount - omitSet.size}: ${ruleCount} - ${omitSet.size}`)
  console.error(`bytes ${stripped.length}, ${Math.ceil(stripped.length / 2 ** 10)}KB: ${css.length} - ${css.length - stripped.length}`)

  return stripped
}
