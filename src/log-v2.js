const chalk = require('chalk');



module.exports = function(name) {

  let self = this;

  let space = 0;

  function log(data, spaceBefore = 0, spaceAfter = 0) {

    if(process.stdout.clearLine) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
    }

    for( ; space < spaceBefore; space++)
      process.stdout.write('\n');

    process.stdout.write(chalk.gray(name ? name + ': ' : '') + (data ? data : ''));

    for(space = 0; space < spaceAfter; space++)
      process.stdout.write('\n');  
    
  }

  self.space: (count = 1) => {
    for( ; space < count; space++)
      process.stdout.write('\n');
  }

  self.progress: (data) => {
    if(process.env.ENV == 'test')
      log(data, 0, 0);
  }

  self.info: (data, spaceBefore, spaceAfter) => {
    log(chalk.gray(data) + '\n', spaceBefore, spaceAfter);
  }

  self.notice: (data, spaceBefore, spaceAfter) => {
    log(data + '\n', spaceBefore, spaceAfter);
  }

  self.warn: (data, spaceBefore, spaceAfter) => {
    log(chalk.yellow(data) + '\n', spaceBefore, spaceAfter);
  }

  self.error: (data, spaceBefore, spaceAfter) => {
    log(chalk.red(data) + '\n', spaceBefore, spaceAfter);
  }

}
