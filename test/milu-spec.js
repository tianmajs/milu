"use strict";

var expect = require('chai').expect;
var milu = require('../index');

describe('milu unit test',function (){

	describe('context',function (){

		it('show execute use function with correct context ',function (done){
			var root = milu();
			var context = {};
			root.use(function *(next){
				expect(this).to.equal(context);
			});
			root.run(context,done);
		});


		it('show execute custom function with correct context ',function (done){
			var root = milu();
			var context = {
				say: function (type){
					return function *(next){
						expect(this).to.equal(context);
						yield next;
					}
				}
			};
			root.say().use(function *(next){
				expect(this).to.equal(context);
			});
			root.run(context,done);
		});


		it('show execute callback function with correct context ',function (done){
			var root = milu();
			var context = {};
			root.use(function *(next){});
			root.run(context,function (err){
				expect(this).to.equal(context);
				done();
			});
		});

	});

	describe('exception',function (){

		it('show execute callback function without error ',function (done){
			var root = milu();
			root.use(function *(next){
				yield next;
			});

			root.run({},function (err){
				expect(err).to.equal(null);
				done();
			});
		});

		it('show transmit an error object to callback',function (done){
			var root = milu();
			var error = new Error('err') ;
			root.use(function *(next){
				throw error;
			});

			root.run({},function (err){
				expect(err).to.equal(error);
				done();
			});
		});

		it('show catch an error object in previous use function ',function (done){
			var root = milu();
			var error = new Error('err') ;
			root.use(function *(next){
				try{
					yield next;
				}catch(e){
					expect(e).to.equal(error);
				}
			}).use(function *(next){
				yield next;
			}).use(function *(next){
				throw error;
			});
			root.run({},function (err){
				expect(err).to.equal(null);
				done();
			});
		});

	});

	describe('use',function (){

		it('should stop chain when don\'t using yield ',function (done){
			var root = milu();
			var count = 'a';
			root.use(function *(next){
				count += 'b';
				yield next;
			}).use(function *(next){
				count += 'c';
			}).use(function *(next){
				count += 'd';
			});

			root.run({},function (err){
				expect(count).to.equal('abc');
				done();
			});
		});

		it('should execute correct branch (single-level tree)',function (done){
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
						this.result = word;
					};
				}
			};
			var root = milu(verb);
			root.is('cat').then
				.say('miao')
				.end
			.is('dog').then
				.say('wang')
				.end;

			root.run({type:'dog'},function (err){
				expect(this.result).to.equal('wang');
				done();
			});
		});


		it('should execute correct branch (multi-level tree)',function (done){
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
						this.result = word;
						yield next;
					};
				},
				can:function (skill){
					return function *(next){
						if(this.skill === skill) {
							yield next;
						}
					};
				},
				action:function (playing){
					return function *(next){
						this.playing = playing;
					}
				}
			};
			var root = milu(verb);
			root.is('cat').then
				.say('miao')
				.end
			.is('dog').then
				.say('wang')
				.can('swim').then
					.action('go to swimming')
					.end
				.can('bike')
					.action('ride bike')
					.end
				.end;

			root.run({type:'dog',skill:'bike'},function (err){
				expect(this.result).to.equal('wang');
				expect(this.playing).to.equal('ride bike');
				done();
			});
		});

	});


});
