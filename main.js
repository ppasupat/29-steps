$(function () {
  'use strict';

  const SCREEN_WIDTH = 700, SCREEN_HEIGHT = 400;
  const FRAME_RATE = 8;

  // ################################
  // Utilities

  // ################################
  // Scenes

  function showScene(name, callback) {
    $('.scene').hide();
    $('#scene-' + name).show();
    if (callback !== void 0) callback();
  }

  function showEvent() {
    $('#event').show();
  }

  function hideEvent() {
    $('#event').hide();
  }

  // ################################
  // Map

  const MAP_ROW_HEIGHT = 320, MAP_COL_WIDTH = 200,
    MAP_TOP_MARGIN = 10, MAP_LEFT_MARGIN = 0;

  let currentPid = null, flags = {};

  function moveMap(pid) {
    currentPid = pid;
    $('#map').css({
      top: -(MAP_TOP_MARGIN + MAP_ROW_HEIGHT * MAP_DATA[currentPid].row) + 'px',
      left: -(MAP_LEFT_MARGIN + MAP_COL_WIDTH * MAP_DATA[currentPid].col) + 'px',
    });
    $('.arrow').hide();
  }

  function showArrows() {
    Object.keys(MAP_DATA[currentPid].arrows).forEach(
      d => $('#arrow-' + d).show());
    Object.keys(MAP_DATA[currentPid].hideArrows || {}).forEach(k => {
      if (!flags[k]) {
        $('#arrow-' + MAP_DATA[currentPid].hideArrows[k]).hide();
      }
    });
  }

  $('#map').on('transitionend', showArrows);

  $('.arrow').click(
    e => moveMap(MAP_DATA[currentPid].arrows[e.target.dataset.dir]));

  // ################################
  // Main UI

  function setupMain() {
    showScene('main');
    moveMap('f');
    window.setTimeout(() => moveMap('a1'), 1);
  }

  // ################################
  // Preloading and screen resizing

  function resizeScreen() {
    let ratio = Math.min(
      1.0,
      window.innerWidth / SCREEN_WIDTH,
      (window.innerHeight - 25) / SCREEN_HEIGHT,
    );
    $('#game-wrapper').css({
      'width': (SCREEN_WIDTH * ratio) + 'px',
      'height': (SCREEN_HEIGHT * ratio) + 'px',
    });
    $('#game').css('transform', 'scale(' + ratio + ')');
  }

  resizeScreen();
  $(window).resize(resizeScreen);

  const imageList = [
    'img/heart.png',
    'img/map-draft.png',
  ];
  let numResourcesLeft = imageList.length;

  function decrementPreload () {
    numResourcesLeft--;
    if (numResourcesLeft === 0) {
      console.log('yay');
      $('#pane-loading').empty()
        .append($('<button type=button>').text('START').click(setupMain));
    } else {
      $('#pane-loading').text('Loading resources (' + numResourcesLeft + ' left)');
    }
  }

  let images = [];
  imageList.forEach(x => {
    let ximg = new Image();
    ximg.onload = decrementPreload;
    ximg.src = x;
    images.push(ximg);
  });
  $('#pane-loading').text('Loading resources (' + numResourcesLeft + ' left)');
  showScene('preload');

});
