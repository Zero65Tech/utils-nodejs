var space = 0;

module.exports = function(name) {

  let self = this;

  function log(data, spaceBefore = 0, spaceAfter = 0) {

    for( ; space < spaceBefore; space++)
      console.log();

    console.log((name ? name + ': ' : '') + (data ? data : ''));

    for(space = 0; space < spaceAfter; space++)
      console.log();
    
  }

  self.space = (count = 1) => {
    for( ; space < count; space++)
      console.log();
  }

  self.progress = (data) => {}

  self.info = (data, spaceBefore, spaceAfter) => {
    log(data, spaceBefore, spaceAfter);
  }

  self.notice = (data, spaceBefore, spaceAfter) => {
    log(data, spaceBefore, spaceAfter);
  }

  self.warn = (data, spaceBefore, spaceAfter) => {
    log(data, spaceBefore, spaceAfter);
  }

  self.error = (data, spaceBefore, spaceAfter) => {
    log(data, spaceBefore, spaceAfter);
  }

}
