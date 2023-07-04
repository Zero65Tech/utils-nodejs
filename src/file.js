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



exports.pipe = async (data, filePath) => {
  ensureDir(filePath);
  await new Promise((resolve, reject) => {
    let file = fs.createWriteStream(filePath);
    file.on('error', reject);
    file.on('finish', resolve);
    data.pipe(file);
  });
}



exports.write = async (data, filePath) => {
  ensureDir(filePath);
  await fs.promises.writeFile(filePath, data);
}

exports.writeObject = async (data, filePath) => {
  ensureDir(filePath);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}

exports.writeArray = async (data, filePath) => {

  let dataStr = [];

  for(let item of data) {
    if(typeof item == 'object' && item instanceof Array)
      dataStr.push(await exports.writeArray(item));
    else
      dataStr.push(JSON.stringify(item));
  }

  if(!filePath)
    return '[ ' + dataStr.join(', ') + ' ]';

  ensureDir(filePath);

  await fs.promises.writeFile(filePath, '[\n  ' + dataStr.join(',\n  ') + '\n]');

}

exports.writeJson = async (data, filePath) => {
  
  if(typeof data != 'object') {

    data = JSON.stringify(data);

  } else if(data instanceof Array) {

    let multiLine = false;
    let strArr = [];
    for(let item of data) {
      if(typeof item == 'object' && item !== null) {
        multiLine = true;
        strArr.push((await exports.writeJson(item)).replace(/\n/g, '\n  '));
      } else {
        strArr.push(JSON.stringify(item));
      }
    }

    if(multiLine)
      data = '[\n  ' + strArr.join(',\n  ') + '\n]';
    else
      data = '[ ' + strArr.join(', ') + ' ]';

  } else {

    let strArr = [];
    for(let [ key, value ] of Object.entries(data)) {
      if(typeof value == 'object' && value !== null)
        strArr.push(`"${ key }": ${ (await exports.writeJson(value)).replace(/\n/g, '\n  ') }`);
      else
        strArr.push(`"${ key }": ${ JSON.stringify(value) }`);
    }

    if(strArr.length)
      data = '{\n  ' + strArr.join(',\n  ') + '\n}';
    else
      data = '{ }';

  }

  if(!filePath)
    return data;

  ensureDir(filePath);

  await fs.promises.writeFile(filePath, data);

}



exports.rename = async (filePath, newFilePath) => {
  await fs.promises.rename(filePath, newFilePath);
}



exports.delete = async (path) => {
  if(fs.existsSync(path))
    await fs.promises.rm(path, { recursive:true });
}

exports.deleteDir = exports.delete;
