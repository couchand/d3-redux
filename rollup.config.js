export default {
  input: "index.js",
  external: [
    "d3-selection"
  ],
  output: {
    file: "build/d3-redux.js",
    format: "umd",
    name: "d3",
    globals: {
      "d3-selection": "d3"
    }
  }
};
