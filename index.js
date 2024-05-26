const { mkdir, mkfile, isFile, getChildren, getMeta, getName, reduce, map } = require('@hexlet/immutable-fs-trees');

const tree = mkdir('nodejs-package', [
  mkfile('Makefile'),
  mkfile('README.md'),
  mkdir('dist'),
  mkdir('__tests__', [
    mkfile('half.test.js', { type: 'text/javascript' }),
  ]),
  mkfile('babel.config.js', { type: 'text/javascript' }),
  mkdir('node_modules', [
    mkdir('@babel', [
      mkdir('cli', [
        mkfile('LICENSE'),
      ]),
    ]),
  ], { owner: 'root', hidden: false }),
], { hidden: true });


const changeOwner = (tree, newOwner) => map((node) => {
  const meta = getMeta(node);
  const updatedMeta = { ...meta, owner: newOwner };
  return { ...node, meta: updatedMeta };
}, tree);


const printNamesWithOwners = (tree) => {
  const result = [];
  const iter = (node, ancestry) => {
    const name = getName(node);
    const owner = getMeta(node).owner || 'unknown';
    result.push(`${ancestry}${name} (owner: ${owner})`);
    if (!isFile(node)) {
      getChildren(node).forEach((child) => iter(child, `${ancestry}${name}/`));
    }
  };
  iter(tree, '');
  console.log(result.join('\n'));
};


const countAllNodesAndLeaves = (tree) => reduce((acc) => acc + 1, tree, 0);
const countFiles = (tree) => reduce((acc, node) => (isFile(node) ? acc + 1 : acc), tree, 0);
const countDirectories = (tree) => reduce((acc, node) => (!isFile(node) ? acc + 1 : acc), tree, 0);


const printFileCounts = (tree) => {
  const iter = (node) => {
    if (isFile(node)) return 0;
    const children = getChildren(node);
    const filesCount = children.filter(isFile).length;
    const directoriesCount = children.filter((child) => !isFile(child)).reduce((acc, dir) => acc + iter(dir), 0);
    console.log(`${getName(node)}: ${filesCount}`);
    return filesCount + directoriesCount;
  };
  iter(tree);
};


const addEmptyDirectories = (tree) => {
  const newTree = map((node) => {
    if (getName(node) === 'nodejs-package') {
      const children = getChildren(node);
      return { ...node, children: [...children, mkdir('empty1'), mkdir('empty2')] };
    }
    return node;
  }, tree);
  return newTree;
};

const printEmptyDirectories = (tree) => {
  const result = [];
  const iter = (node) => {
    if (!isFile(node)) {
      const children = getChildren(node);
      if (children.length === 0) {
        result.push(getName(node));
      } else {
        children.forEach(iter);
      }
    }
  };
  iter(tree);
  console.log(result.join('\n'));
};

const newTree = changeOwner(tree, 'new-owner');
printNamesWithOwners(newTree);
console.log(`Total nodes: ${countAllNodesAndLeaves(newTree)}`);
console.log(`Total files: ${countFiles(newTree)}`);
console.log(`Total directories: ${countDirectories(newTree)}`);
printFileCounts(newTree);
const updatedTree = addEmptyDirectories(newTree);
printEmptyDirectories(updatedTree);
