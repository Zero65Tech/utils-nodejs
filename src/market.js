const Log = require('./log.js').init('util.market');

const holidays    = require('./config/market-holidays.js');
const specialDays = require('./config/market-special-days.js');
const mfIsns      = require('./config/mf-isns.json');
const renames     = require('./config/symbol-renames.json');
const events      = require('./config/symbol-events.json');



exports.isOpen = () => {
  let now = Date.now();
  let hrs = (now / 1000 / 60 / 60 + 5.5) % 24;
  return hrs >= 9.5 && hrs < 15.5;
}

exports.isOpened = () => {
  let now = Date.now();
  let hrs = (now / 1000 / 60 / 60 + 5.5) % 24;
  return hrs >= 9.5;
}

exports.isClosed = () => {
  let now = Date.now();
  let hrs = (now / 1000 / 60 / 60 + 5.5) % 24;
  return hrs >= 15.5;
}

exports.isHoliday = (dateStr) => {
  let dateObj = new Date(dateStr); // GMT
  if(dateObj.getUTCDay() < 1 || dateObj.getUTCDay() > 5)
    return specialDays.indexOf(dateStr) == -1;
  else
    return holidays[dateObj.getUTCFullYear() - 2011].indexOf(dateStr) != -1;
}



exports.mfIsn = (name) => {
  if(name.indexOf('/') != -1)
    name = name.substring(0, name.indexOf('/')).trim();
  return mfIsns[name];
}



if(process.env.npm_package_name == 'market')
  exports.processEvents = (symbol, date, price) => {

    let ret = undefined;

    if(renames[symbol]) {
      ret = {};
      symbol = renames[symbol];
      ret[symbol] = price;
    }

    if(events[symbol]) {

      events[symbol].forEach(event => {

        if(event[0] == 'bonus' || date >= event[1])
          return;

        ret = ret || {};

        if(event[0] == 'split') {
          price = price / event[2];
          ret[symbol] = price;
        } else if(event[0] == 'merge') {
          ret[symbol] = price; // Keeping per-merge symbol as sold stocks are not converted to new scripts
          let merge = event[2];
          price = price * merge[1] / merge[2];
          ret[merge[0]] = price;
        } else if(event[0] == 'demerge') {
          event[2].forEach(demerge => ret[demerge[0]] = price * demerge[1] * demerge[2]);
        } else {
          Log.error(`Event type "${ event[0] }" not handled.`);
        }

      });

    }

    return ret;

  }
