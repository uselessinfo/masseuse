define(['underscore', 'chai', 'squire', 'mocha', 'sinon', 'sinonChai'],
    function (_, chai, Squire, mocha, sinon, sinonChai) {

    'use strict';
    var VIEW1_NAME = 'testView1',
        CHILD_VIEW_NAME = 'childView',
        injector = new Squire(),
        should = chai.should();


    require(['underscore', 'sinonCall', 'sinonSpy']);
    // Using Sinon-Chai assertions for spies etc. https://github.com/domenic/sinon-chai
    chai.use(sinonChai);
    mocha.setup('bdd');


    describe('An instance of the BaseView', function () {


        //-----------Setup-----------
        var BaseView,
            viewInstance;

        beforeEach(function (done) {
            injector.require(['masseuse'], function (masseuse) {
                    BaseView = masseuse.BaseView;
                    viewInstance = new BaseView({
                        name : VIEW1_NAME
                    });
                    done();
                },
                function () {
                    console.log('BaseView error.');
                    done();
                });
        });

        //-----------Tests-----------
        it('should exist', function () {
            should.exist(BaseView);
        });

        describe('remove method', function () {
            // method should wrap View.remove
            it('should call stop on all children', function () {
                var childView = new (BaseView.extend({
                        name: CHILD_VIEW_NAME
                    }))(),
                    childRemove = sinon.spy(childView, 'remove');

                viewInstance.addChild(childView);

                childRemove.should.not.have.been.called;

                viewInstance.remove();

                childRemove.should.have.been.calledOnce;
            });
        });

        describe('children', function() {
            describe('addChild method', function () {
                it ('should be a method', function () {
                    viewInstance.addChild.should.be.a('function');
                });

                it ('should add a child view', function () {
                    var childView = new BaseView({
                        name: CHILD_VIEW_NAME
                    });

                    viewInstance.children.length.should.equal(0);

                    viewInstance.addChild(childView);

                    viewInstance.children.length.should.equal(1);
                });

                it ('should not add the same child view twice', function () {
                    var childView = new BaseView({
                        name: CHILD_VIEW_NAME
                    });

                    viewInstance.children.length.should.equal(0);

                    viewInstance.addChild(childView);

                    viewInstance.children.length.should.equal(1);

                    viewInstance.addChild(childView);

                    viewInstance.children.length.should.equal(1);
                });
            });

            describe('removeChild method', function () {
                it ('should remove a child view, if it exists', function () {
                    var childView = new BaseView({
                        name: CHILD_VIEW_NAME
                    });

                    viewInstance.addChild(childView);

                    viewInstance.children.length.should.equal(1);

                    viewInstance.removeChild(childView);

                    viewInstance.children.length.should.equal(0);
                });

                it ('should not remove any child views if a matching view is not found', function () {
                    var childView = new BaseView({
                            name: CHILD_VIEW_NAME
                        }),
                        anotherChildView = new BaseView({
                            name: 'Another Child'
                        });

                    viewInstance.addChild(childView);

                    viewInstance.children.length.should.equal(1);

                    viewInstance.removeChild(anotherChildView);

                    viewInstance.children.length.should.equal(1);
                });
            });
        });
    });

    describe('An instance of extending the BaseView', function () {

        //-----------Setup-----------
        var BaseView,
            AsyncExtendedBaseView,
            SyncExtendedBaseView,
            asyncInstance,
            syncInstance,
            $beforeRenderDeferred,
            $afterRenderDeferred;


        beforeEach(function (done) {
            injector.require(['masseuse'], function (masseuse) {

                    BaseView = masseuse.BaseView;
                    AsyncExtendedBaseView = BaseView.extend({
                        beforeRender : function (deferred) {
                            $beforeRenderDeferred = deferred;
                        },
                        afterRender : function (deferred) {
                            $afterRenderDeferred = deferred;
                        }
                    });
                    SyncExtendedBaseView = BaseView.extend({
                        beforeRender : function () {
                        },
                        afterRender : function () {
                        }
                    });

                    asyncInstance = new AsyncExtendedBaseView({
                        name : VIEW1_NAME
                    });
                    syncInstance = new SyncExtendedBaseView({
                        name : VIEW1_NAME
                    });

                    done();
                },
                function () {
                    console.log('BaseView error.');
                });
        });
    });

});
