/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../../assets/templates/liveBtn.html',
], function ($, _, Backbone, H, controlsTpl) {


  var LiveView = Backbone.View.extend({
    el: '#liveContainer',
    template: H.compile(controlsTpl),

    events: {
      'click #live-btn': 'toggleActive'
    },

    initialize: function () {
      console.log("Live view Created");
      this.model.on('change:active', this.render, this);
      this.render();
    },

    toggleActive: function (e) {
      e.preventDefault();
      this.model.toggleActive();
    },

    render: function () {
      var html, ctx = {};

      ctx.active = this.model.get('active');

      html = this.template(ctx);

      this.$el.html(html);

      return this;
    }
  });

  return LiveView;
});