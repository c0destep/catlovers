import neostandard from 'neostandard'

export default neostandard({
  env: ['browser', 'node'],
  files: ['js/**/*.js'],
  ignores: ['js/vendor/**'],
  semi: true
})
