var expect = require('chai').expect;
var milu = require('../index');

describe('milu unit test with es6 generator',function (){

		before(function (done){
			done();
		});


		it('node.use() 链式操作',function (done){
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
				expect(err).to.be.a('null');
				expect(count).to.equal('abc');
				done();
			});
		});

		it('node.use() 执行上下文',function (done){
			var root = milu();
			var context = {};
			root.use(function *(next){
				expect(this).to.equal(context);
			});
			root.run(context,function (err){
				expect(this).to.equal(context);
				done();
			});
		});

		it('自定义分支逻辑(一级)',function (done){
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


		it('自定义分支逻辑(二级)',function (done){
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

		it('异常测试',function (done){
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


});

describe('milu unit test with callback',function (){

});
