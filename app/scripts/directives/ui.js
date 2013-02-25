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