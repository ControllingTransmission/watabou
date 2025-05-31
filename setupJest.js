// Mock require.context for webpack's dynamic require feature
require.context = (base = '.', scanSubDirectories = false, regularExpression = /\.js$/) => {
  const files = {};
  
  const req = (file) => files[file] || {};
  req.keys = () => Object.keys(files);
  req.resolve = req;
  
  return req;
};