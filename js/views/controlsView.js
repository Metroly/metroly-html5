/*jslint nomen: true, unparam: true, indent: 2, browser: true */
/*global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!../../assets/templates/controls.html',
  'views/favoriteView',
  'appState'
], function ($, _, Backbone, H, controlsTpl, FavoriteView, appState) {

  var storage = appState.getBuses();

  var Helpers = {
    visuallySelectRoute: function (jqTarget) {

      $('.dir-sprite').removeClass('route-selected');
      jqTarget.addClass('route-selected');

    }
  };

  var ControlsView = Backbone.View.extend({
    el: '#header-wrapper',
    template: H.compile(controlsTpl),

    events: {
      'click .dir-sprite': 'selectDirection',
      'click .tracking-status': 'toggleLive',
      'click #menu-btn': 'menuClicked',
      'click #busStops-btn': 'busStopsMenuClicked',
    },

    initialize: function (options) {
      var self = this;
      this.dispatcher = options.dispatcher;

      this.model.on('change:bus', this.render, this);
      this.model.on('change:route', this.render, this);
      this.dispatcher.on("app:isHomeState", function (isHomeState) {
        if (isHomeState) self.renderHomeState();
      });
    },

    menuClicked: function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(".busStops-side-nav").hide();
      $(".side-nav").show();
      var pg = document.querySelector('.page');
      pg.style.webkitTransition = "margin-left .4s";

      if (pg.style.marginLeft.trim().length > 0) {
        // e.target.style.backgroundPosition = "0 0px";
        pg.style.marginLeft = "";
      } else {
        // e.target.style.backgroundPosition = "0 -36px";
        pg.style.marginLeft = "200px";
      } 

    },

    busStopsMenuClicked: function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(".side-nav").hide();
      $(".busStops-side-nav").show();
      var pg = document.querySelector('.page');
      pg.style.webkitTransition = "margin-left .4s";

      if (pg.style.marginLeft.trim().length > 0) {
        // e.target.style.backgroundPosition = "0 0px";
        pg.style.marginLeft = "";
      } else {
        // e.target.style.backgroundPosition = "0 -36px";
        pg.style.marginLeft = "-200px";
      } 
    },

    favorite: function (e) {
      var selectedBus = this.model.get('bus');
      console.log('SelectedBus: ', selectedBus);
      var busData = storage.data[selectedBus.toLowerCase()];
      busData.favorite = !busData.favorite;
      storage.save();
      console.log('State of storage: ', storage.data);
    },

    selectDirection: function (e) {
      e.preventDefault();
      var target = $(e.target),
        direction = target.data('direction');
      Helpers.visuallySelectRoute(target);

      console.log('Selected direction', direction);
      this.model.set('direction', direction);

      return this.render();
    },

    // TODO: Dunno if we need to break templates (HomeScreen from BusRoutes),
    // but maybe will be useful?
    renderHomeState: function () {
      // CONTROL HEADER PARAMETERS
      var ctx = {};
      ctx.homeState = true;

      // RENDER CONTROL HEADER
      this.renderHeader(ctx);
      return this;
    },

    render: function () {

      // CONTROL HEADER PARAMETERS
      var ctx = {};
      ctx.route = this.model.get('route');
      ctx.direction = this.model.get('direction');
      var currBus = this.model.get('bus');

      if (!ctx.route || !currBus) {
        return false;
      }

      if (ctx.route.directions) {
        //Resettimg the direction name
        ctx.routeName = ctx.route.directions[ctx.direction].destination.split('via')[0];
        _.each(ctx.route.directions, function (direction) {
          if (direction.destination) {
            var editedDestination = direction.destination.split('via')[0];
            direction.destination = editedDestination;
          }
        });
      }

      // RENDER CONTROL HEADER
      this.renderHeader(ctx);

      // SET BUS DIRECTION 0 BY DEFAULT
      if(ctx.direction){
        Helpers.visuallySelectRoute($('[data-direction="1"]'));
      }else{
        Helpers.visuallySelectRoute($('[data-direction="0"]'));
      }

      // RENDER FAVORITE BUTTON
      var bus = storage.find(currBus.toLowerCase());
      var isFav = bus.favorite || false;
      var FavBtnModel = Backbone.Model.extend({defaults: {isActive: isFav}});
      this.favoriteBtn = new FavoriteView({
        el: "#favContainer",
        model: new FavBtnModel()
      });
      this.favoriteBtn.model.on('change:isActive', this.favorite, this);
      this.favoriteBtn.render();

      return this;
    },

    renderHeader: function (ctx) {
      var html = this.template(ctx);
      this.$el.html(html);
    }


  });

  return ControlsView;
});