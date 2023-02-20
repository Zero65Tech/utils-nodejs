const fs = require('fs');



function ensureDir(filePath) {
  let i = filePath.lastIndexOf('/');
  if(i != -1) {
    let dir = filePath.substring(0, i);
    if(!fs.existsSync(dir))
      fs.mkdirSync(dir, { recursive: true });
  }
}



exports.readDir = async (dir, deep = false) => {

  let paths = await fs.promises.readdir(dir);
  paths = paths.filter(p => p != '.DS_Store');

  if(deep) {
    for(let i = 0; i < paths.length; i++) {
      let stat = await fs.promises.lstat(dir + '/' + paths[i]);
      if(stat.isDirectory()) {
        let morePaths = await fs.promises.readdir(dir + '/' + paths[i]);
        morePaths = morePaths.filter(p => p != '.DS_Store');
        morePaths = morePaths.map(p => paths[i] + '/' + p);
        paths.splice(i,1,...morePaths);
        i--;
      }
    }
  }

  return paths;

}



exports.exists = (filePath) => {
  return fs.existsSync(filePath);
}



exports.read = async (filePath) => {
  return fs.existsSync(filePath) ? (await fs.promises.readFile(filePath)).toString() : undefined;
}

exports.readFile = async (filePath) => { // = exports.read;
  if(fs.existsSync(filePath))
    return JSON.parse(await fs.promises.readFile(filePath));
  else
    return undefined;
}

exports.readAsJs = (filePath) => {
  return fs.existsSync(filePath) ? require(process.cwd() + '/' + filePath) : undefined;
}

exports.readAsJson = async (filePath) => {
  return fs.existsSync(filePath) ? JSON.parse(await fs.promises.readFile(filePath)) : undefined;
}

exports.readFileAsJson = exports.readAsJson;



exports.write = async (data, filePath) => {
  ensureDir(filePath);
  await fs.promises.writeFile(filePath, data);
}

exports.writeToFile = exports.write;

exports.writeObject = async (data, filePath) => {
  ensureDir(filePath);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}

exports.writeObjectToFile = exports.writeObject;

exports.writeArray = async (data, filePath) => {
  ensureDir(filePath);
  let dataStr = '[\n';
  data.forEach((d, i) => { dataStr += '  ' + JSON.stringify(d) + (i == data.length - 1 ? '\n' : ',\n') });
  dataStr += ']';
  await fs.promises.writeFile(filePath, dataStr);
}

exports.writeArrayToFile = exports.writeArray;

exports.writeJson = async (data, filePath) => {
  
  let dataStr = '';

  if(data == null) {

    dataStr += 'null';

  } else if(typeof data == 'boolean') {

    dataStr += `${ data }`;

  } else if(typeof data == 'string') {

    dataStr += `"${ data }"`;

  } else if(typeof data == 'number') {

    dataStr += `${data}`;

  } else if(data instanceof Array) {

    let multi = false;
    for(let val of data) {
      if(typeof val == 'object') {
        multi = true;
        break;
      }
    }

    if(multi) {

      dataStr += '[\n';
      for(let i = 0; i < data.length; i++) {
        dataStr += `  ${ (await exports.writeJson(data[i])).replace(/\n/g, '\n  ') }`;
        if(i != data.length - 1)
          dataStr += ',\n'
      }
      dataStr += '\n]';

    } else {

      dataStr += '[ ';
      for(let i = 0; i < data.length; i++) {
        dataStr += await exports.writeJson(data[i]);
        if(i != data.length - 1)
          dataStr += ', '
      }
      dataStr += ' ]';

    }

  } else { // if(typeof data === 'object') {

    let lastKey = Object.keys(data).pop();

    dataStr += '{\n';

    for(let key in data) {
      dataStr += `  "${key}": ${ (await exports.writeJson(data[key])).replace(/\n/g, '\n  ') }`;
      if(key != lastKey)
        dataStr += ',\n';
    }

    dataStr += '\n}';

  }

  if(!filePath)
    return dataStr;

  ensureDir(filePath);

  await fs.promises.writeFile(filePath, dataStr);

}



exports.rename = async (filePath, newFilePath) => {
  await fs.promises.rename(filePath, newFilePath);
}



exports.delete = async (path) => {
  if(fs.existsSync(path))
    await fs.promises.rm(path, { recursive:true });
}

exports.deleteDir = exports.delete;
