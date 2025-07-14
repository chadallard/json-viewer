function merge(...objects) {
  if (objects.length === 0) {
    return {};
  }

  return Object.assign({}, ...objects);
}

export default merge;
