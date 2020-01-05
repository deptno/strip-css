# strip-css

![](https://github.com/deptno/strip-css/workflows/deploy/badge.svg)
![](https://github.com/deptno/strip-css/workflows/build/badge.svg)

`strip-css` is built for making strip down version of css from existing css.
It is useful when you try to AMP. AMP restricts css size up to 50Kb, `strip-css` could help this.

## usage
```shell script
$ curl https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css | \
npx strip-css \
 -o 'dark-' \
 -o '$fl-' \
 -o '-l$' \
 -o '-ns$' \
> dist.css

rule 1688: 2113 - 425
bytes 60543, 60KB: 73497 - 12954
```

## debug

```shell script
DEBUG=strip-css npx strip-css
```

## license
MIT
