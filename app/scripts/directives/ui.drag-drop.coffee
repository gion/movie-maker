myapp.directive 'uiDraggable', ['ui.config', (uiConfig) ->
  options = {}
  if uiConfig.draggable?
    angular.extend(options, uiConfig.draggable)

  require: '?ngModel'
  link: (scope, element, attrs, ngModel) ->
    opts = angular.extend({}, options, scope.$eval(attrs.uiOptions))

    if ngModel?      
      _start = opts.start
      opts.start = (e, ui) ->
        element.data('ui-draggable-item', ngModel.$modelValue)
        _start?(e, ui)
        scope.$apply()
      
      _update = opts.update
      opts.update = (e, ui) ->
        _update?(e, ui)
        scope.$apply()

    # Create draggable
    element.draggable(opts)

]
    
myapp.directive 'uiDroppable', ['ui.config', (uiConfig) ->
  options = {}
  if uiConfig.droppable?
    angular.extend(options, uiConfig.droppable)

  link: (scope, element, attrs) ->
    opts = angular.extend({}, options, scope.$eval(attrs.uiOptions))

    if opts.drop?
      _drop = opts.drop
      opts.drop = (e, ui) ->
        _drop?(ui.draggable.data('ui-draggable-item'))
        scope.$apply()

    # Create droppable
    element.droppable(opts)

]