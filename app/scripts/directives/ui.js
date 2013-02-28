'use strict';

movieMakerApp.directive('mmTap', function() {
    return function(scope, element, attrs) {
        var tapping;
        tapping = false;
        element.bind('touchstart', function(e) {
            return tapping = true;
        });
        element.bind('touchmove', function(e) {
            return tapping = false;
        });
        return element.bind('touchend', function(e) {
            if (tapping) {
                return scope.$apply(attrs['mmTap'], element);
            }
        });
    };
});

movieMakerApp.directive('mmDragwithinparent', ['$parse', function($parse) {
    return function(scope, element, attrs) {
        var mousedown = false,
            fn = $parse(attrs.mmDragwithinparent);
        element
            .bind('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                return mousedown = true;
            });
        angular.element(document).bind('mouseup', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return mousedown = false;
        });
        element.parent()
            .bind('mousemove', function(e) {
                if (mousedown) {
                    var params = Array.prototype.slice.call(arguments);
                         return  scope.$apply(function () {
                        fn(scope, {$event: e, $params: params});
                    });
                }
            });

        return element;
    };

}]);



movieMakerApp.directive('uiDraggable', [
  'ui.config', function(uiConfig) {
    var options;
    options = {};
    if (uiConfig.draggable != null) {
      angular.extend(options, uiConfig.draggable);
    }
    return {
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
        var opts, _start, _update;
        opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
        if (ngModel != null) {
          _start = opts.start;
          opts.start = function(e, ui) {
            element.data('ui-draggable-item', ngModel.$modelValue);
            if (typeof _start === "function") {
              _start(e, ui);
            }
            return scope.$apply();
          };
          _update = opts.update;
          opts.update = function(e, ui) {
            if (typeof _update === "function") {
              _update(e, ui);
            }
            return scope.$apply();
          };
        }
        return element.draggable(opts);
      }
    };
  }
]);

movieMakerApp.directive('uiDroppable', [
  'ui.config', function(uiConfig) {
    var options;
    options = {};
    if (uiConfig.droppable != null) {
      angular.extend(options, uiConfig.droppable);
    }
    return {
      link: function(scope, element, attrs) {
        var opts, _drop;
        opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
        if (opts.drop != null) {
          _drop = opts.drop;
          opts.drop = function(e, ui) {
            if (typeof _drop === "function") {
              _drop({
                item : ui.draggable.data('ui-draggable-item'),
                event : e, 
                ui : ui,
                scope : this 
              });
            }
            return scope.$apply();
          };
        }
        return element.droppable(opts);
      }
    };
  }
]);