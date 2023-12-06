exports.from = (date) => {
  if(date instanceof Date)
    date = date.getTime();
  date = new Date(date + 5.5 * 60 * 60 * 1000);
  return date.getUTCFullYear()
    + ((date.getUTCMonth() < 9 ? '-0' : '-') + (date.getUTCMonth() + 1))
    + ((date.getUTCDate() < 10 ? '-0' : '-') + date.getUTCDate());
}



exports.shift = (date, days) => {

  if(!days)
    return date;

  if(date)
    date = new Date(date.substring(0, 10) + ' GMT+530').getTime();
  else
    date = Date.now();

  return exports.from(date + days * 24 * 60 * 60 * 1000);

}

exports.getDuration = (startDate, endDate) => {
  let dtStart = (startDate ? new Date(startDate.substring(0, 10) + ' GMT+530') : new Date()).getTime() + 5.5 * 60 * 60 * 1000;
  let dtEnd   = (endDate   ? new Date(  endDate.substring(0, 10) + ' GMT+530') : new Date()).getTime() + 5.5 * 60 * 60 * 1000;
  return Math.floor(dtEnd / 1000 / 60 / 60 / 24) - Math.floor(dtStart / 1000 / 60 / 60 / 24);
}



let tomorrow, today, yesterday, lastWeek;

function days() {
  let now = Date.now();
  let day = 24 * 60 * 60 * 1000;
  tomorrow  = exports.from(now + day);
  today     = exports.from(now);
  yesterday = exports.from(now - day);
  lastWeek  = exports.from(now - day * 7);
  setTimeout(days, day - (now + 5.5 * 60 * 60 * 1000) % day);
}; days();

exports.tomorrow  = () => tomorrow;
exports.today     = () => today;
exports.yesterday = () => yesterday;
exports.lastWeek  = () => lastWeek;



exports.getFy = (dateStr = today) => {
  return 'fy' + (parseInt(dateStr.substring(2,4)) + (dateStr.substring(5,10) >= '04-01' ? 1 : 0));
}

exports.getFyMonth = (dateStr = today) => {
  return [ 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC' ][ dateStr.substring(5,7) - 1 ];
}

exports.getFyStart = (dateStr = today) => {
  return parseInt(dateStr.substring(0,4)) + (dateStr.substring(5,10) >= '04-01' ? 0 : -1) + '-04-01';
}

exports.getFyEnd = (dateStr = today) => {
  return parseInt(dateStr.substring(0,4)) + (dateStr.substring(5,10) >= '04-01' ? 1 : 0) + '-03-31';
}

exports.getQtr = (dateStr = today) => {
  let md = dateStr.substring(5,10);
  if(md >= '10-01')
    return 'q3'
  else if(md >= '07-01')
    return 'q2'
  else if(md >= '04-01')
    return 'q1'
  else
    return 'q4'
}

exports.getTaxQtr = (dateStr = today) => {
  let md = dateStr.substring(5,10);
  if(md >= '12-16')
    return 'q4'
  else if(md >= '09-16')
    return 'q3'
  else if(md >= '06-16')
    return 'q2'
  else if(md >= '04-01')
    return 'q1'
  else if(md >= '03-16')
    return 'q5'
  else
    return 'q4'
}

exports.getFyDuration = (dateStr = today) => {
  return exports.getDuration(
    2000 + parseInt(dateStr.substring(2,4)) + (dateStr.substring(5,10) >= '04-01' ? 0 : -1) + '-04-01',
    2000 + parseInt(dateStr.substring(2,4)) + (dateStr.substring(5,10) >= '04-01' ? 1 :  0) + '-03-31'
  ) + 1;
}

exports.getPreviousSunday = (dateStr) => {
  const date = new Date(dateStr);
  date.setMinutes(date.getMinutes() + 330);
  const dayOfWeek = date.getUTCDay();
  const diff = dayOfWeek === 0 ? 7 : dayOfWeek;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setMinutes(date.getMinutes() - 330);
  return exports.from(date);
}
