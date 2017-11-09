export default {
  input: "index.js",
  output: {
    file: "build/d3-redux.js",
    format: "umd",
    name: "d3",
    globals: {
      "d3-selection": "d3"
    }
  }
};
