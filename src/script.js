const Js      = require('./js.js');
const Dt      = require('./date.js');
const DtStr   = require('./date-str.js');
const File    = require('./file.js');
const Http    = require('./http.js');
const Log     = require('./log.js').init('util.script');
const Service = require('./service.js');
const Market  = require('./market.js');
const Invest  = require('./invest.js');



exports.PNL_TYPE = {
  "GAIN"   : "gain",
  "PROFIT" : "profit"
};

exports.ASSET_CLASS = {
  "OPTIONS"      : "options",
  "FUTURES"      : "futures",
  "EQUITY"       : "equity",
  "EQUITY_MF"    : "equity.mf",
  "OFFSHORE"     : "offshore",
  "OFFSHORE_MF"  : "offshore.mf",
  "COMMODITY"    : "commodity",
  "COMMODITY_MF" : "commodity.mf",
  "DEBT"         : "debt",
  "DEBT_MF"      : "debt.mf",

  "GOLD"        : "gold",
  "GOLD_MF"     : "gold.mf",
};

exports.TAX_CLASS = {
  "BUSINESS"   : "business",
  "DIVIDEND"   : "dividend",
  "SPECULATIVE": "speculative",
  "STCG_EQ"    : "stcg.eq",
  "STCG_DB"    : "stcg.db",
  "LTCG_EQ"    : "ltcg.eq",
  "LTCG_DB"    : "ltcg.db",
  "EXEMPTED"   : "exempted",
};



const SEGMENT     = Invest.SEGMENT;
const ASSET_CLASS = exports.ASSET_CLASS;
const TAX_CLASS   = exports.TAX_CLASS;



exports.split = (symbol) => {
  let l = symbol.length;
  let i = l;
  if(symbol.indexOf('1') != -1)
    i = Math.min(i, symbol.indexOf('1'));
  if(symbol.indexOf('2') != -1)
    i = Math.min(i, symbol.indexOf('2'));
  if(i == l)
    return [ symbol, '', 0, '' ];
  if(symbol.endsWith('FUT'))
    return [ symbol.substring(0, i), symbol.substring(i, i + 5), 0, 'FUT' ];
  return [ symbol.substring(0, i), symbol.substring(i, i + 5), parseInt(symbol.substring(i + 5, l - 2)), symbol.substring(l - 2) ];
}

exports.splitSymbol = (symbol) => {

  let l = symbol.length;
  let i = l;
  if(symbol.indexOf('1') != -1)
    i = Math.min(i, symbol.indexOf('1'));
  if(symbol.indexOf('2') != -1)
    i = Math.min(i, symbol.indexOf('2'));

  if(i == l)
    return {
      script: symbol
    };
  else if(symbol.endsWith('FUT'))
    return {
      script: symbol.substring(0, i),
      expiry: symbol.substring(i, i + 5),
      type:   'FUT'
    };
  else
    return {
     script: symbol.substring(0, i),
     expiry: symbol.substring(i, i + 5),
     strike: parseInt(symbol.substring(i + 5, l - 2)),
     type:   symbol.substring(l - 2)
    };

}

exports.getSegment = (assetClass) => {
  if(!assetClass)
    return undefined;
  if(assetClass == ASSET_CLASS.OPTIONS || assetClass == ASSET_CLASS.FUTURES)
    return SEGMENT.FO;
  if(assetClass == ASSET_CLASS.EQUITY || assetClass == ASSET_CLASS.OFFSHORE || assetClass == ASSET_CLASS.COMMODITY || assetClass == ASSET_CLASS.DEBT || assetClass == ASSET_CLASS.GOLD)
    return SEGMENT.EQ;
  if(assetClass == ASSET_CLASS.EQUITY_MF || assetClass == ASSET_CLASS.OFFSHORE_MF || assetClass == ASSET_CLASS.COMMODITY_MF || assetClass == ASSET_CLASS.DEBT_MF || assetClass == ASSET_CLASS.GOLD_MF)
    return SEGMENT.MF;
}

exports.getAssetClass = (segment, symbol) => {
  if(segment == SEGMENT.FO)
    return symbol.endsWith('FUT') ? ASSET_CLASS.FUTURES : ASSET_CLASS.OPTIONS;
  if(symbol.indexOf('/') != -1)
    symbol = symbol.substring(0, symbol.indexOf('/') - 1);  
  if(symbol == 'MON100')
    return ASSET_CLASS.OFFSHORE;
  if(symbol == 'NIPPON INDIA US EQUITY OPPORTUNITIES FUND')
    return ASSET_CLASS.OFFSHORE_MF;
  if(symbol == 'GOLDBEES' || symbol == 'SILVERBEES')
    return ASSET_CLASS.COMMODITY;
  if(symbol == 'LIQUIDBEES' || symbol == 'NETFLTGILT'
      || symbol == 'BRITANNIA-N2'|| symbol == 'BRITANNIA-N3')
    return ASSET_CLASS.DEBT;
  if(symbol == 'HDFC LIQUID FUND'
      || symbol == 'ICICI PRUDENTIAL LIQUID FUND'
      || symbol == 'SBI MAGNUM ULTRA SHORT DURATION FUND'
      || symbol == 'NIPPON INDIA ULTRA SHORT DURATION FUND' || symbol == 'NIPPON INDIA ULTRA SHORT DURATION FUND - SEGREGATED'
      || symbol == 'HDFC LOW DURATION FUND'
      || symbol == 'SBI MAGNUM GILT FUND'
      || symbol == 'NIPPON INDIA GILT SECURITIES FUND'
      || symbol == 'ICICI PRUDENTIAL GILT FUND'
      || symbol == 'NIPPON INDIA NIVESH LAKSHYA FUND')
    return ASSET_CLASS.DEBT_MF;
  return segment == SEGMENT.MF ? ASSET_CLASS.EQUITY_MF : ASSET_CLASS.EQUITY;
}

exports.getTaxClass = (segment, symbol, buyDate, sellDate) => {

  if(segment == SEGMENT.FO)
    return TAX_CLASS.BUSINESS;

  if(symbol == 'LIQUIDBEES')
    return TAX_CLASS.EXEMPTED;

  if(!buyDate || buyDate < sellDate)
    [ buyDate, sellDate ] = [ sellDate, buyDate ];

  buyDate  = buyDate.substring(0,10);
  sellDate = sellDate ? sellDate.substring(0,10) : Dt.shiftDate();

  if(buyDate == sellDate)
    return TAX_CLASS.SPECULATIVE;

  let assetClass = this.getAssetClass(segment, symbol);

  if(segment == SEGMENT.EQ) {
    // As per Zerodha calculation
    // e.g. LV0248 ARVIND    x 50q 2019-05-15 2020-05-14
    // e.g. LV0248 EICHERMOT x 10q 2019-07-09 2020-07-08
    if(assetClass == ASSET_CLASS.EQUITY || assetClass == ASSET_CLASS.OFFSHORE) {
      return Dt.getDuration(buyDate, sellDate) < 365 ? TAX_CLASS.STCG_EQ : TAX_CLASS.LTCG_EQ;
    } else { // if(assetClass == 'debt' || assetClass == 'commodity') {
      return Dt.getDuration(buyDate, sellDate) < 3 * 365 ? TAX_CLASS.STCG_DB : TAX_CLASS.LTCG_DB;
    }
  } else if(segment == SEGMENT.MF) {
    if(assetClass == ASSET_CLASS.EQUITY_MF || assetClass == ASSET_CLASS.OFFSHORE_MF) {
      let ltcgDate = (parseInt(buyDate.substring(0,4)) + 1) + buyDate.substring(4);
      return sellDate < ltcgDate ? TAX_CLASS.STCG_EQ : TAX_CLASS.LTCG_EQ;
    } else { // if(assetClass == 'debt.mf' || assetClass == 'commodity.mf') {
      let ltcgDate = (parseInt(buyDate.substring(0,4)) + 3) + buyDate.substring(4);
      return sellDate < ltcgDate ? TAX_CLASS.STCG_DB : TAX_CLASS.LTCG_DB;
    }
  }
  
}



if(process.env.npm_package_name == 'invest') {

  const KiteTicker = require('./kiteconnect/ticker-ltp.js');
  const mfIsins = require('./config/mf-isns.json');

  var datePriceMap = undefined;
  File.readAsJson('.cache.price').then(data => {
    datePriceMap = data || {};
    if(data) {
      let dates = Object.keys(data).length;
      let count = Object.values(data).reduce((sum, item) => sum + Object.keys(item).length, 0);
      count = Math.round(count/1000);
      Log[ count < 150 ? 'warn' : 'info' ](`Found ${ count }K prices for ${ dates } dates in local cache !`);
    }
  });

  exports.getPrice = async (symbol, segmentOrAssetClass, date) => {

    while(!datePriceMap)
      await new Promise(resolve => setTimeout(resolve, 10));

    if(!symbol)
      return 0;

    if(symbol.indexOf('/') != -1)
      symbol = symbol.substring(0, symbol.indexOf('/') - 1);

    let segment = exports.getSegment(segmentOrAssetClass) || segmentOrAssetClass;

    if(!date || date == DtStr.today()) {
      if(!segment || segment != SEGMENT.MF) {
        let price = await KiteTicker.getPrice(symbol);
        if(price) return price;
      }
      date = Market.isClosed() ? DtStr.today() : DtStr.yesterday();
    }

    if(!segment || segment == SEGMENT.MF)
      symbol = mfIsins[symbol] || symbol;

    if(!datePriceMap[date] || !datePriceMap[date][symbol] || datePriceMap[date][symbol][1] < Date.now()) {

      let price = await Service.doGet('market', '/price', undefined, { symbol:symbol, segment:segment, date:date });

      let ttl = 60 * 60 * 1000;
      if(date >= DtStr.yesterday())
        ttl = ttl;
      else if(date > DtStr.lastWeek())
        ttl = 24 * ttl;
      else
        ttl = Math.round((1 + 90 * Math.random()) * 24 * ttl);

      datePriceMap[date] = datePriceMap[date] || {};
      datePriceMap[date][symbol] = [ parseFloat(price), Date.now() + ttl ];

    }

    return datePriceMap[date][symbol][0];

  }

  exports.close = async (saveCache) => {
    await KiteTicker.close(saveCache);
    if(datePriceMap)
      await File.writeJson(Js.sortObject(datePriceMap, true), '.cache.price');
  }

}
