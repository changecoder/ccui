const path = require('path')
const fs = require('fs')

const R = require('ramda')

const { escapeWinPath, toUriPath } = require('../utils/escape-win-path')
const context = require('../context')

const sourceLoaderPath = path.join(__dirname, '..', 'loaders', 'source-loader')

const ensureToBeArray = (maybeArray) => {
  return Array.isArray(maybeArray) ?
    maybeArray : [maybeArray]
}

const shouldBeIgnore = (filename) => {
  const { exclude } = context.ccConfig
  return exclude && exclude.test(filename)
}

const isDirectory = (filename) => fs.statSync(filename).isDirectory()

const isValidFile = transformers => filename =>
  transformers.some(({ test }) => eval(test).test(filename))

const findValidFiles = (source, transformers) => {
  return R.pipe(
    R.reject(shouldBeIgnore), // filter 的补操作。返回结果为 R.filter 操作结果的补集。
    R.filter(R.either(isDirectory, isValidFile(transformers))), // Either返回由 || 运算符连接的两个函数的包装函数。如果两个函数中任一函数的执行结果为 truth-y，则返回其执行结果。
    R.chain((filename) => { // chain 将函数映射到列表中每个元素，并将结果连接起来。 chain 在一些库中也称为 flatMap
      if (isDirectory(filename)) {
        const subFiles = fs.readdirSync(filename)
          .map(subFile => path.join(filename, subFile));
        return findValidFiles(subFiles, transformers);
      }
      return [filename]
    })
  )(source)
}

const rxSep = new RegExp(`[${escapeWinPath(path.sep)}.]`)

function getPropPath(filename, sources) {
  return sources.reduce(
    (f, source) => f.replace(source, ''),
    filename.replace(new RegExp(`${path.extname(filename)}$`), ''),
  ).replace(/^\.?(?:\\|\/)+/, '').split(rxSep)
}

function filesToTreeStructure(files, sources) {
  const cleanedSources = sources.map(source => source.replace(/^\.?(?:\\|\/)/, ''))
  const filesTree = files.reduce((subFilesTree, filename) => {
    const propLens = R.lensPath(getPropPath(filename, cleanedSources)) // lensPath返回聚焦到指定路径的 lens, 配合set view,over使用
    return R.set(propLens, filename, subFilesTree)
  }, {})
  return filesTree
}

const generate = (source, transformers = []) => {
  if (source === null || source === undefined) {
    return {}
  }
  if (R.is(Object, source) && !Array.isArray(source)) {
    return R.map(value => generate(value, transformers), source)
  }
  const sources = ensureToBeArray(source)
  const validFiles = findValidFiles(sources, transformers)
  const filesTree = filesToTreeStructure(validFiles, sources)
  return filesTree
}

const shouldLazyLoad = (nodePath, nodeValue, lazyLoad) => {
  if (typeof lazyLoad === 'function') {
    return lazyLoad(nodePath, nodeValue)
  }

  return typeof nodeValue === 'object' ? false : lazyLoad
}

const stringifyObject = ({
  nodePath, nodeValue, depth, ...rest
}) => {
  const indent = '  '.repeat(depth)
  const kvStrings = R.pipe(
    R.toPairs,
    R.map((kv) => {
      const valueString = stringify({
        ...rest,
        nodePath: `${nodePath}/${kv[0]}`,
        nodeValue: kv[1],
        depth: depth + 1,
      });
      return `${indent}  '${kv[0]}': ${valueString},`
    })
  )(nodeValue)
  return kvStrings.join('\n')
}

const lazyLoadWrapper = ({
  filePath,
  filename,
  isLazyLoadWrapper,
}) => {
  const { isSSR } = context
  const loaderString = isLazyLoadWrapper ? '' : `${sourceLoaderPath}!`
  return `${'function () {\n' +
    '  return new Promise(function (resolve) {\n'}${
    isSSR ? '' : '    require.ensure([], function (require) {\n'
  }      resolve(require('${escapeWinPath(loaderString)}${escapeWinPath(filePath)}'));\n${
    isSSR ? '' : `    }, '${toUriPath(filename)}');\n`
  }  });\n` +
    '}'
}

const stringify = (params) => {
  const {
    nodePath = '/',
    nodeValue,
    lazyLoad,
    depth = 0,
  } = params

  const indent = '  '.repeat(depth)
  const shouldBeLazy = shouldLazyLoad(nodePath, nodeValue, lazyLoad)

  return R.cond([ // 返回一个封装了 if / else，if / else, ... 逻辑的函数 fn
    [n => typeof n === 'object', (obj) => {
      if (shouldBeLazy) {
        const filePath = `${path.join(
          __dirname, '..', '..', 'tmp',
          nodePath.replace(/^\/+/, '').replace(/\//g, '-'),
        )}.${context.ccConfig.entryName}.js`;
        const fileInnerContent = stringifyObject({
          ...params,
          nodeValue: obj,
          lazyLoad: false,
          depth: 1,
        });
        const fileContent = `module.exports = {\n${fileInnerContent}\n}`
        fs.writeFileSync(filePath, fileContent)
        return lazyLoadWrapper({
          filePath,
          filename: nodePath.replace(/^\/+/, ''),
          isLazyLoadWrapper: true
        })
      }
      const objectKVString = stringifyObject({
        ...params,
        nodePath,
        depth,
        nodeValue: obj
      })
      return `{\n${objectKVString}\n${indent}}`
    }],
    [R.T, (filename) => { // 恒定返回 true 的函数
      const filePath = path.isAbsolute(filename) ?
        filename : path.join(process.cwd(), filename)
      if (shouldBeLazy) {
        return lazyLoadWrapper({ filePath, filename })
      }
      return `require('${escapeWinPath(sourceLoaderPath)}!${escapeWinPath(filePath)}')`
    }],
  ])(nodeValue)
}

const processOn = (
  filename,
  fileContent,
  plugins,
  transformers = [],
  isBuild
) => {
  let transformerIndex = -1
  transformers.some(({ test }, index) => {
    transformerIndex = index
    return eval(test).test(filename)
  })
  const transformer = transformers[transformerIndex]

  const markdown = require(transformer.use)(filename, fileContent)

  const parsedMarkdown = plugins.reduce(
    (markdownData, plugin) =>
      require(plugin[0])(markdownData, plugin[1], isBuild === true),
    markdown
  )
  return parsedMarkdown
}

const traverse = (filesTree, fn) => {
  Object.keys(filesTree).forEach((key) => {
    const value = filesTree[key]
    if (typeof value === 'string') {
      fn(value)
      return
    }

    traverse(value, fn)
  })
}

module.exports = {
  generate,
  stringify: (
    filesTree,
    options = {}
  ) => stringify({ nodeValue: filesTree, ...options }),
  process: processOn,
  traverse
}