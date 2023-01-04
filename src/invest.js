const Js = require('./js.js');



exports.PLATFORM = {
  "AMC"    : "AMC",
  "ZERODHA": "ZERODHA",
  "KITE"   : "KITE",
  "COIN"   : "COIN",
};

exports.SEGMENT = {
  "MF"         : "MF",          // Equity Mutual Funds - AMC, Coin
  "EQ"         : "EQ",          // Equity Scripts      - Kite
  "EQ_EXT"     : "EQ_EXT",      // Equity External     - Kite
  "EQ_RE"      : "EQ_RE",       // Equity IPO          - Kite
  "EQ_IPO"     : "EQ_IPO",      // Equity Rights Issue - Kite
  "EQ_DIVIDEND": "EQ_DIVIDEND", // Equity Dividend     - Kite
  "FO"         : "FO",          // Futures & Options   - Kite
  "NONE"       : "NONE",        // No fixed segment    - Zerodha
};

exports.TRANSACTION_TYPE = {
  "FUND"                       : "FUND",
  "TRADE"                      : "TRADE",
  "MARGIN"                     : "MARGIN",
  "CHARGE_AMC"                 : "CHARGE_AMC",                  // Zerodha - NONE
  "CHARGE_ACCOUNT_MODIFICATION": "CHARGE_ACCOUNT_MODIFICATION", // Zerodha - NONE
  "CHARGE_PAYMENT_GATEWAY"     : "CHARGE_PAYMENT_GATEWAY",      // Zerodha - NONE
  "CHARGE_DEPOSITORY"          : "CHARGE_DEPOSITORY",           // Kite    - EQ
  "CHARGE_PLEDGE"              : "CHARGE_PLEDGE",               // Kite    - FO
  "CHARGE_DELAYED_PAYMENT"     : "CHARGE_DELAYED_PAYMENT",      // Kite    - FO
  "CHARGE_CALL_AND_TRADE"      : "CHARGE_CALL_AND_TRADE",       // Kite    - EQ, FO
  "CHARGE_SHORT_MARGIN_PENALTY": "CHARGE_SHORT_MARGIN_PENALTY", // Kite    - EQ, FO
  "OTHER"                      : "OTHER",                       // Zerodha - NONE
  "TDS"                        : "TDS"                          // Kite    - EQ_DIVIDEND
};

exports.TRADE_TYPE = {
  "MTM"     : "mtm",
  "BUY"     : "buy",
  "SELL"    : "sell",
  "DIVIDEND": "dividend",
};



exports.TRANSACTION = {
  "AMC": {
    "MF": [ "FUND", "TRADE" ]
  },
  "ZERODHA": {
    "NONE": [ "FUND", "CHARGE_AMC", "CHARGE_ACCOUNT_MODIFICATION", "CHARGE_PAYMENT_GATEWAY", "OTHER" ]
  },
  "KITE": {
    "EQ":           [          "TRADE", "CHARGE_DEPOSITORY", "CHARGE_CALL_AND_TRADE", "CHARGE_SHORT_MARGIN_PENALTY" ],
    "EQ_EXT":       [ "FUND",  "TRADE" ],
    "EQ_RE":        [ "FUND",  "TRADE" ],
    "EQ_IPO":       [ "FUND",  "TRADE" ],
    "EQ_DIVIDEND":  [ "FUND",  "TRADE", "TDS" ],
    "FO":           [          "TRADE", "MARGIN", "CHARGE_PLEDGE", "CHARGE_DELAYED_PAYMENT", "CHARGE_CALL_AND_TRADE", "CHARGE_SHORT_MARGIN_PENALTY" ]
  },
  "COIN": {
    "MF": [ "TRADE" ]
  }
};

exports.TRADE = {
  "AMC": {
    "MF": [ "buy", "sell" ]
  },
  "KITE": {
    "EQ":          [ "buy", "sell" ],
    "EQ_EXT":      [ "buy", "sell" ],
    "EQ_RE":       [ "buy", "sell" ],
    "EQ_IPO":      [ "buy", "sell" ],
    "EQ_DIVIDEND": [ "dividend"    ],
    "FO":          [ "buy", "sell", "mtm" ],
  },
  "COIN": {
    "MF": [ "buy", "sell" ]
  }
};



exports._segment = (segment) => {
  return segment.startsWith('EQ_') ? 'EQ' : segment;
}

exports._transaction = (transaction) => {
  return {
    id        : transaction[0],
    date      : transaction[1],
    txnDate   : transaction[2],
    platform  : transaction[3],
    segment   : transaction[4],
    type      : transaction[5],
    amount    : transaction[6],
    note      : transaction[7]
  }
}

exports._trade = (trade) => {
  return {
    id       : trade[0],
    date     : trade[1],
    dateTime : trade[2],
    platform : trade[3],
    segment  : trade[4],
    type     : trade[5],
    symbol   : trade[6],
    quantity : trade[7],
    price    : trade[8]
  }
}

if(process.env.npm_package_name == 'zerodha')
  exports._symbol = (symbol) => {
    let script = symbol;
    if(script.endsWith('-E') || script.endsWith('-F') || script.endsWith('-R') || script.endsWith('-T') || script.endsWith('-X') || script.endsWith('-Z'))
      script = script.substring(0, script.length - 2);
    else if(script.endsWith('-BE') || script.endsWith('-BL') || script.endsWith('-BZ'))
      script = script.substring(0, script.length - 3);
    else if(script.endsWith(' - DIRECT PLAN'))
      script = script.substring(0, script.length - 14);
    return script;
  }
else if(process.env.npm_package_name == 'amc')
  exports._symbol = (symbol) => {
    let script = symbol;
    if(script.endsWith(' - DIRECT PLAN'))
      script = script.substring(0, script.length - 14);
    return script;
  }



if(process.env.npm_package_name == 'zerodha') {

  const renames = require('./config/symbol-renames.json');
  const events  = require('./config/symbol-events.json');

  exports.applyEvents = (trades) => {

    trades.forEach(trade => {
      let script = exports._symbol(trade[6]);
      trade[6] = renames[script] || script;
    });


    let PLATFORM   = exports.PLATFORM;
    let SEGMENT    = exports.SEGMENT;
    let TRADE_TYPE = exports.TRADE_TYPE;

    let id = 0;
    Object.keys(events).forEach((symbol) => {
      events[symbol].forEach((event) => {

        id++;

        if(event[0] == 'bonus') {
          let qty = 0;
          trades.forEach(trade => {
            if(trade[5] != TRADE_TYPE.DIVIDEND && trade[6] == symbol && trade[1] < event[1])
              qty = trade[5] == TRADE_TYPE.BUY ? qty + trade[7] : qty - trade[7];
          });
          if(qty)
            trades.push([ 'event/' + (id + 1), event[1], event[1] + 'T00:00:00', PLATFORM.KITE, SEGMENT.EQ, TRADE_TYPE.BUY, symbol, qty * event[2], 0 ]);
        } else if(event[0] == 'split') {
          trades.forEach(trade => {
            if(trade[6] == symbol && trade[1] < event[1]) {
              if(trade[5] != TRADE_TYPE.DIVIDEND)
                trade[7] = trade[7] * event[2];
              trade[8] = trade[8] / event[2];
            }
          });
        } else if(event[0] == 'merge') {
          let sellQty = 0;
          trades.forEach(trade => {
            if(trade[5] == TRADE_TYPE.SELL && trade[6] == symbol && trade[1] < event[1])
              sellQty += trade[7];
          });
          for(let i = 0; i < trades.length; i++) {
            let trade = trades[i];
            if(trade[5] != TRADE_TYPE.BUY || trade[6] != symbol || trade[1] >= event[1])
              continue;
            if(sellQty) {
              if(sellQty >= trade[7]) {
                sellQty -= trade[7];
              } else {
                let clone = trade.slice();
                trade[0] += '/0';
                trade[7] = sellQty;
                clone[0] += '/1';
                clone[7] -= sellQty;
                sellQty = 0;
                trades.splice(i + 1, 0, clone);
              }
              continue;
            }
            trade[6] = event[2][0];
            trade[7] = trade[7] / event[2][1] * event[2][2];
            trade[8] = Js.roundQty(trade[8] * event[2][1] / event[2][2]);
          }
        } else if(event[0] == 'demerge') {
          let sellQty = 0;
          trades.forEach(trade => {
            if(trade[5] == TRADE_TYPE.SELL && trade[6] == symbol && trade[1] < event[1])
              sellQty += trade[7];
          });
          for(let i = 0; i < trades.length; i++) {
            let trade = trades[i];
            if(trade[5] != TRADE_TYPE.BUY || trade[6] != symbol || trade[1] >= event[1])
              continue;
            if(sellQty) {
              if(sellQty >= trade[7]) {
                sellQty -= trade[7];
              } else {
                let clone = trade.slice();
                trade[0] += '/0';
                trade[7] = sellQty;
                clone[0] += '/1';
                clone[7] -= sellQty;
                sellQty = 0;
                trades.splice(i + 1, 0, clone);
              }
              continue;
            }
            for(let j = 0; j < event[2].length; j++) {
              let demerge = event[2][j];
              let clone = trade.slice();
              if(symbol == demerge[0]) {
                clone[7] = trade[7] / demerge[1];
                clone[8] = Js.roundPrice(trade[7] * trade[8] * demerge[2] / clone[7]);
                trades[i] = clone;
              } else {
                clone[0] += '/' + j;
                clone[6] = demerge[0];
                clone[7] = Js.roundQty(trade[7] / demerge[1]);
                clone[8] = Js.roundPrice(trade[7] * trade[8] * demerge[2] / clone[7]);
                trades.push(clone);
              }
            }
          }
        } else {
          console.error('util.invest: unknown event -', event);
        }

      });
    });


    trades.sort((a, b) => {
      if(a[2] != b[2])
        return a[2] < b[2] ? -1 : 1;
      return a[0] < b[0] ? -1 : 1;
    });

  }

}
