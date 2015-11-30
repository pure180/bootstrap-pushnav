/* ========================================================================
 * Bootstrap Pushnavigation: jquery.pushnav.js v1.0.0
 * Author: Daniel Pfisterer (info@daniel-pfisterer.de)
 * ========================================================================
 * Copyright 2015-2015 Daniel Pfisterer
 *
 * Licensed under MIT (https://opensource.org/licenses/MIT)
 * ======================================================================== */

+function ($) {
  'use strict'

  var toggle = '[data-toggle="pushnav"]'

  var PushNav = function(element, options) {
    this.$element      = $(element)
    this.data          = this.$element.data()
    this.options       = $.extend({}, PushNav.DEFAULTS, this.data, options)
    this.$shutter      = $('[data-toggle="' + options.data_toggle + '"][href="#' + element.id + '"],' +
                           '[data-toggle="' + options.data_toggle + '"][data-target="#' + element.id + '"]')
    this.transitioning = null

    this.$trigger      = this.$shutter.attr('type') === "button" || this.$shutter.hasClass('navbar-toggle') ? this.$shutter : this.$shutter.parent()
    if (this.options.toggle) this.toggle()
  }

  PushNav.VERSION  = '1.0.0'

  PushNav.TRANSITION_DURATION = 300

  PushNav.DEFAULTS = {
    toggle :                true,
    data_toggle :           'pushnav',
    active :                'open',
    transitions:            'transitions',
    closeOnClickOutside :   true,
    closeOnClickLink :      true,
    pushElement :           true,
    pushElements :          'body',
    pushClass :             'push'
  }

  PushNav.prototype.show = function () {
    if(this.transitioning || this.$element.hasClass(this.options.active)) return
    show(this.$element, this.$trigger, this.$shutter, this.options)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass(this.options.transitions + ' opening')
        .addClass(this.options.active)
      this.$trigger
        .removeClass(this.options.transitions + ' opening')
        .addClass(this.options.active)
      this.transitioning = 0
      this.$element
        .trigger('shown.pushnav')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(PushNav.TRANSITION_DURATION)

  }

  PushNav.prototype.hide = function () {
    if(this.transitioning || !this.$element.hasClass(this.options.active)) return
    hide(this.$element, this.$trigger, this.$shutter, this.options)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass(this.options.transitions + ' closing')
        .trigger('hidden.pushnav')
      this.$trigger
        .removeClass(this.options.transitions + ' closing')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(PushNav.TRANSITION_DURATION)

  }

  PushNav.prototype.toggle = function () {
    this.hideOthers()
    this[this.$element.hasClass(this.options.active) ? 'hide' : 'show']()
  }

  PushNav.prototype.hideOthers = function () {
    var $notThisShutter = $(toggle).not(this.$shutter), options = this.options
    var option = this.options
    $notThisShutter.each(function(){
      var $notThisElement = getTargetFromTrigger($(this))
      var $notThisTrigger = $(this).attr('type') === "button" || $(this).hasClass('navbar-toggle') ? $(this) : $(this).parent()

      if(!$notThisElement.hasClass(option.active)) return
      hide($notThisElement, $notThisTrigger, $(this), options, true)

      var complete = function () {
        this.transitioning = 0
        $notThisElement
          .removeClass(option.transitions + ' closing')
          .trigger('hidden.pushnav')
        $notThisTrigger
          .removeClass(option.transitions + ' closing')
      }

      if (!$.support.transition) return complete.call(this)

      $notThisElement
        .one('bsTransitionEnd', $.proxy(complete, this))
        .emulateTransitionEnd(PushNav.TRANSITION_DURATION)
    })
  }

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('pushnav')
      var options = $.extend({}, PushNav.DEFAULTS, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('pushnav', (data = new PushNav(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.pushnav

  $.fn.pushnav             = Plugin
  $.fn.pushnav.Constructor = PushNav

  $.fn.pushnav.noConflict = function () {
    $.fn.pushnav = old
    return this
  }

  function show (element, trigger, shutter, options) {
    var startEvent = $.Event('show.pushnav')
    element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    element
      .addClass(options.transitions + ' opening')
      .attr('aria-expanded', true)
    trigger
      .addClass(options.transitions + ' opening')
    shutter
      .attr('aria-expanded', true)

    if (!options.pushElement) return
    $(options.pushElements).addClass(options.active)

    if (!options.position) return
    $(options.pushElements).addClass(options.position)

  }

  function hide (element, trigger, shutter, options, hideOthers) {
    var startEvent = $.Event('hide.pushnav')
    element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return
    element
      .removeClass(options.active)
      .addClass(options.transitions + ' closing')
      .attr('aria-expanded', false)
    trigger
      .removeClass(options.active)
      .addClass(options.transitions + ' closing')
    shutter
      .attr('aria-expanded', false)

    if (!hideOthers) {
      if (!options.pushElement) return
      $(options.pushElements).removeClass(options.active)

      if (!options.position) return
      $(options.pushElements).removeClass(options.position)
    } else {
      if (options.position === 'left'){
        $(options.pushElements).removeClass('right')
      } else if (options.position === 'right') {
          $(options.pushElements).removeClass('left')
      }
    }

  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }

  function clearPushNav(e, options) {
    $(toggle).each( function() {
      var $this    = $(this)
      var data     = $this.data()
      var $trigger = $this.attr('type') === "button" || $this.hasClass('navbar-toggle') ? $this : $this.parent()
      var $target  = getTargetFromTrigger($this)
      var relatedTarget = { relatedTarget: this }

      if (!$trigger.hasClass( options.active ) && !$target.hasClass( options.active ) ) return

      $target.trigger(e = $.Event('hide.pushnav', relatedTarget))

      if (e.isDefaultPrevented()) return

      $trigger
        .removeClass( options.active )
        .addClass(options.transitions + ' closing')
      $this.attr('aria-expanded', false)
      $target
        .removeClass( options.active )
        .addClass(options.transitions + ' closing')
        .attr('aria-expanded', false)

      this.transitioning = 1

      var complete = function () {
        this.transitioning = 0
        $target
          .removeClass(options.transitions + ' closing')
          .trigger('hidden.pushnav')
        $trigger
          .removeClass(options.transitions + ' closing')
      }
      if (!$.support.transition) return complete.call(this)

      $target
        .one('bsTransitionEnd', $.proxy(complete, this))
        .emulateTransitionEnd(PushNav.TRANSITION_DURATION)


      if(!options.pushElement) return
      $(options.pushElements).removeClass(options.active)

      if (!data.position) return
      $(options.pushElements).removeClass(data.position)

    })
  }

  var SetClasses = function(element) {
    return $(element).each(function(){
      var options = $.extend({}, PushNav.DEFAULTS, options),
          data = $(this).data(),
          target = getTargetFromTrigger($(this))

      var pushClasses = options.pushElement && options.pushElements ? options.pushClass : ''
      $('body').addClass(pushClasses)

      if (!data.position) return
      $(target).addClass(data.position + ' navbar-push')
    })
  }

  $(document).on('ready.pushnav.data-api', function(){
    new SetClasses(toggle)
  })

  $(document).on('click.pushnav.data-api', toggle, function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('pushnav')
    var option  = data ? 'toggle' : $this.data()
    Plugin.call($target, option)
  })

  // Do action outside the common prototype
  $(document).on('click.pushnav.data-api', function (e) {
    var options = $.extend({}, PushNav.DEFAULTS, options)

    // Close Navigation on click outside of trigger or target.
    if (!options.closeOnClickOutside) return
    var closetTarget = $(e.target).closest('[aria-expanded="true"]')
    if (!$(e.target).is(toggle) && closetTarget && !closetTarget.length) {
      clearPushNav(e, options)
    }

    // Close Navigation on click inside a navigation link.
    if (!options.closeOnClickLink) return
    var navInside = $('[role="navigation"]').find('a')
    if($(e.target).is(navInside) && closetTarget.hasClass(options.active)){
      clearPushNav(e, options)
    }
  })



}(jQuery);
