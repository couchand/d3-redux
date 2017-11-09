import istanbul from 'rollup-plugin-istanbul';
import NYC from 'nyc';

const istanbul2 = new (new NYC())._instrumenterLib.istanbul();

export default {
  input: "index.js",
  external: [
    "d3-selection"
  ],
  output: {
    file: "build/d3-redux.test.js",
    format: "umd",
    name: "d3",
    globals: {
      "d3-selection": "d3"
    },
    sourcemap: true
  },
  plugins: [
    istanbul({
      exclude: ['test/**/*.js'],
      instrumenter: {
        Instrumenter: istanbul2.createInstrumenter
      }
    })
  ]
};
