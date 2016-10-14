"use strict";

var co = require('mini-co');

module.exports = function(verb) {
    verb = verb || {};
    var newVerb = {}

    for (var name in verb) {
        // 使用新的对象代替入参, 因为在函数内部修改入参的内容会对外部代码造成副作用
        newVerb[name] = function(factory) {
            return function() {
                return this.use(factory.apply(null, arguments));
            };
        }(verb[name]);
    }

    function wrap(fn, parent) {
        var node = Object.create(newVerb),
          sibling,
          child;

        fn = fn || function(next, done) {
            next(done);
        };

        if (fn.constructor.name === 'GeneratorFunction') {
            fn = co(fn);
        }

        node.use = function(fn) {
            return (sibling = wrap(fn, parent));
        };

        node.run = function(context, callback) {
            var deep = false,

            next = function(callback) {
                var node = child || sibling;

                deep = true;

                if (node) {
                    node.run(context, callback);
                } else {
                    callback.call(context, null);
                }
            },

            done = function(err) {
                if (!err && !deep && child && sibling) {
                    sibling.run(context, callback);
                } else if (callback) {
                    callback.call(context, err);
                }
            };

            fn.call(context, next, done);
        };

        Object.defineProperties(node, {
            then: {
                get: function() {
                    return (child = wrap(null, node));
                }
            },
            end: {
                get: function() {
                    return parent || node;
                }
            }
        });

        return node;
    }

    return wrap();
};
