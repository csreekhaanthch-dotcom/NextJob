function readPackage(pkg) {
  // Add any special package modifications here if needed
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};