function escapeWinPath(path) {
  return path.replace(/\\/g, '\\\\')
}

function toUriPath(path) {
  return path.replace(/\\/g, '/')
}

module.exports = {
  toUriPath,
  escapeWinPath
}