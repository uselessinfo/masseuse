/*global define:false */
define(['jquery', 'underscore'],
    function ($, _) {
        'use strict';

        // TODO: create constants module
        var BEFORE_RENDER_DONE = 'beforeRenderDone',
            RENDER_DONE = 'renderDone',
            AFTER_RENDER_DONE = 'afterRenderDone';

        return {
            runAllMethods : runAllMethods
        };

        function runAllMethods ($deferred, $parentRenderPromise) {
            var notifyBeforeRenderDone = $deferred.notify.bind(this, BEFORE_RENDER_DONE),
                waitForParentPromiseToBeResolved = _waitForParentPromiseToBeResolved.bind(this,$parentRenderPromise),
                afterRender = _afterRender.bind(this,$deferred),
                renderAndAfterRender = _renderAndAfterRender.bind(this, $deferred, afterRender),
                rejectStart = $deferred.reject.bind(this);

            $
                .when(_runLifeCycleMethod.call(this, this.beforeRender))
                .then(notifyBeforeRenderDone)
                .then(waitForParentPromiseToBeResolved)
                .then(
                    renderAndAfterRender,
                    rejectStart);
        }

        /**
         * Life cycle methods have an event triggered before the run.
         * If a life cycle method has one or more arguments, then the first argument passed in is its deferred.
         * The life cycle method will automatically return this deferred, otherwise it will pass through whatever
         * the method itself returns.
         *
         * @param lifeCycleMethod
         * @returns {*}
         * @private
         */
        function _runLifeCycleMethod (lifeCycleMethod) {
            var $deferred,
                args = Array.prototype.slice.call(arguments),
                returned;

            if (!lifeCycleMethod) {
                return undefined;
            }

            if (lifeCycleMethod.length) {
                $deferred = new $.Deferred();
                args.unshift($deferred);
            }

            returned = lifeCycleMethod.apply(this, args);

            return lifeCycleMethod.length ? $deferred.promise() : returned;
        }

        function _waitForParentPromiseToBeResolved ($parentRenderPromise) {
            if ($parentRenderPromise) {
                return $parentRenderPromise;
            }
            return undefined;
        }

        function _renderAndAfterRender ($deferred, afterRender) {
            var rejectStart = $deferred.reject.bind(this);
            $
                .when(_runLifeCycleMethod.call(this, this.render))
                .then($deferred.notify.bind(this,RENDER_DONE))
                .then(
                    afterRender,
                    rejectStart);
        }

        function _afterRender ($deferred) {
            var $afterRenderDeferred = _runLifeCycleMethod.call(this, this.afterRender),
                resolveStart = $deferred.resolve.bind(this),
                rejectStart = $deferred.reject.bind(this);
            $
                .when(
                    $afterRenderDeferred,
                    _startChildren.call(this, $deferred)
                )
                .then($deferred.notify.bind(this,AFTER_RENDER_DONE))
                .then(
                    resolveStart,
                    rejectStart);
        }

        function _startChildren ($parentDeferred) {
            _(this.children).each(function (child) {
                var $afterRenderDeferred = new $.Deferred();
                $parentDeferred.progress(function (step) {
                    if (step === RENDER_DONE) {
                        $afterRenderDeferred.resolve();
                    }
                });

                child.start($afterRenderDeferred.promise());
                child.hasStarted = true;
            });
        }
    });
