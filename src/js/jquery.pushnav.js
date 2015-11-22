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
    this.options       = $.extend({}, PushNav.DEFAULTS, options)
    this.$shutter      = $('[data-toggle="' + options.data_toggle + '"][href="#' + element.id + '"],' +
                           '[data-toggle="' + options.data_toggle + '"][data-target="#' + element.id + '"]')

    this.$trigger      = this.$shutter.attr('type') === "button" || this.$shutter.hasClass('navbar-toggle') ? this.$shutter : this.$shutter.parent()

    if (this.options.toggle) this.toggle()

    }
  PushNav.VERSION  = '1.0.0'

  PushNav.DEFAULTS = {
    toggle :                true,
    data_toggle :           'pushnav',
    active :                'open',
    closeOnClickOutside :   true,
    closeOnClickLink :      true,
    pushElement :           true,
    pushElements :          'body',
    pushClass :             'push-element',
    mobileBreakpoint:       1199
  }

  PushNav.prototype.show = function () {
    if(this.$element.hasClass(this.options.active)) return
    show(this.$element, this.$trigger, this.$shutter, this.options)
  }

  PushNav.prototype.hide = function () {
    if(!this.$element.hasClass(this.options.active)) return
    hide(this.$element, this.$trigger, this.$shutter, this.options)
  }

  PushNav.prototype.toggle = function () {
    this[this.$element.hasClass(this.options.active) ? 'hide' : 'show']()
    this.hideOthers()
  }

  PushNav.prototype.hideOthers = function () {
    var $notThisShutter = $(toggle).not(this.$shutter)
    var $notThisElement = getTargetFromTrigger($notThisShutter)
    var $notThisTrigger = $notThisShutter.attr('type') === "button" || $notThisShutter.hasClass('navbar-toggle') ? $notThisShutter : $notThisShutter.parent()
    hide($notThisElement, $notThisTrigger, $notThisShutter, this.options)
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
      .addClass(options.active)
      .attr('aria-expanded', true)
    trigger
      .addClass(options.active)
      //.attr('aria-expanded', true)
    shutter
      .attr('aria-expanded', false)
  }

  function hide (element, trigger, shutter, options) {
    var startEvent = $.Event('hide.pushnav')
    element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return
    element
      .removeClass(options.active)
      .attr('aria-expanded', false)
    trigger
      .removeClass(options.active)
      //.attr('aria-expanded', false)
    shutter
      .attr('aria-expanded', false)
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
      var $trigger = $this.attr('type') === "button" || $this.hasClass('navbar-toggle') ? $this : $this.parent()
      var $target   = getTargetFromTrigger($this)
      var relatedTarget = { relatedTarget: this }

      if (!$trigger.hasClass( options.active ) && !$target.hasClass( options.active ) ) return

      $target.trigger(e = $.Event('hide.pushnav', relatedTarget))

      if (e.isDefaultPrevented()) return

      $trigger.removeClass( options.active )
      $this.attr('aria-expanded', false)
      $target.removeClass( options.active ).attr('aria-expanded', false)

    })
  }

  $(document).on('click.pushnav.data-api', toggle, function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('pushnav')
    var option  = data ? 'toggle' : $this.data()
    Plugin.call($target, option)
  })

  // Close on click outside
  $(document).on('click.pushnav.data-api', function (e) {
    var options = $.extend({}, PushNav.DEFAULTS, options)

    if (!options.closeOnClickOutside) return
    var closetTarget = $(e.target).closest('[aria-expanded="true"]')
    if (!$(e.target).is(toggle) && closetTarget && !closetTarget.length) {
      clearPushNav(e, options)
    }
  })

}(jQuery);
