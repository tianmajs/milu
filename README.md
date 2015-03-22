# milu

![build status](https://travis-ci.org/tianmajs/milu.svg?branch=master)

“麋鹿”

## Install

  npm install milu

## Usage

  var milu = require('milu');

  var verb = {
    is: function (type) {
      return function *(next) {
        if (this.type === type) {
          yield next;
        }
      };
    },
    say: function (word) {
      return function *(next) {
        console.log(word);
      };
    },
  };

  var root = milu(verb);

  root.is('cat').then
      .say('miao')
      .end
    .is('dog').then
      .say('wang')
      .end;

  root.run({ type: 'cat' }, function (err) {
    // ...
  });

## LICENSE

[MIT](https://github.com/tianmajs/tianmajs.github.io/blob/master/LICENSE)
