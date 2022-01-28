$(function () {
  'use strict';

  const SCREEN_WIDTH = 700, SCREEN_HEIGHT = 400;
  const FRAME_RATE = 8;

  const MAP_ROW_HEIGHT = 320, MAP_COL_WIDTH = 200,
    MAP_TOP_MARGIN = 30, MAP_LEFT_MARGIN = 30,
    MAP_PANE_HEIGHT = 400, MAP_PANE_WIDTH = 500;

  const UTILS = {};

  let currentPid = null, currentNid = null, flags = {};

  // ################################
  // Scenes

  function showScene(name, callback) {
    $('.scene').hide();
    $('#scene-' + name).show();
    if (callback !== void 0) callback();
  }

  // ################################
  // Map

  // Return the top-left position for the map location.
  function getMapCoords(pid) {
    return {
      top: MAP_TOP_MARGIN + MAP_ROW_HEIGHT * MAP_DATA[pid].row,
      left: MAP_LEFT_MARGIN + MAP_COL_WIDTH * MAP_DATA[pid].col,
    };
  }

  function moveMap(pid) {
    currentPid = pid;
    let coords = getMapCoords(pid);
    $('#map').css({
      top: -(coords.top) + 'px',
      left: -(coords.left) + 'px',
    });
    $('.arrow').hide();
  }

  UTILS.showArrows = function () {
    Object.keys(MAP_DATA[currentPid].arrows).forEach(
      d => $('#arrow-' + d).show());
    Object.keys(MAP_DATA[currentPid].hideArrows || {}).forEach(k => {
      if (!flags[k]) {
        $('#arrow-' + MAP_DATA[currentPid].hideArrows[k]).hide();
      }
    });
  }

  $('#map').on('transitionend', UTILS.showArrows);

  $('.arrow').click(
    e => moveMap(MAP_DATA[currentPid].arrows[e.target.dataset.dir]));

  // ################################
  // NPC Encounter

  function setupNPCs() {
    Object.values(NPC_DATA).forEach(npc => {
      let corrds = getMapCoords(npc.loc);
      $('<div class=map-npc>').attr({
        'data-nid': npc.nid,
      }).css({
        top: (corrds.top + MAP_PANE_HEIGHT / 2) + 'px',
        left: (corrds.left + MAP_PANE_WIDTH / 2) + 'px',
      }).text(npc.name).appendTo('#map');
    });
  }

  UTILS.hideNpc = function (nid) {
    $('.map-npc[data-nid=' + nid + ']').hide();
  };

  $('#map').on('click', '.map-npc', function (e) {
    showEncounter(this.dataset.nid);
  });

  function displayEncounterContent(content) {
    if (!content) {
      $('#npc-dialog').text('ERROR: flags=' + JSON.stringify(flags));
      return;
    }
    $('#npc-pic').removeClass();
    if (content.picture) $('#npc-pic').addClass(content.picture);
    $('#btn-action').toggleClass('enabled', content.enableAction);
    $('#btn-item').toggleClass('enabled', content.enableItem);
    $('#npc-dialog').empty();
    content.dialog.forEach(x => $('<p>').html(x).appendTo('#npc-dialog'));
  }

  function setBtnItemText(iid) {
    $('#btn-item').html(NPC_DATA[currentNid].itemText(iid));
  }

  function showEncounter(nid) {
    if (NPC_DATA[nid].loc !== currentPid) return;
    currentNid = nid;
    $('#npc-name').html(NPC_DATA[nid].name);
    $('#btn-action').html(NPC_DATA[nid].actionText);
    setBtnItemText();
    displayEncounterContent(NPC_DATA[nid].content('enter', flags, UTILS));
    $('#encounter').removeClass('hidden');
  }

  $('#btn-action-wrapper').click(function () {
    if (! $('#btn-action').hasClass('enabled')) return;
    displayEncounterContent(NPC_DATA[currentNid].content('action', flags, UTILS));
  });
  $('#btn-item-wrapper').click(function () {
    if (! $('#btn-item').hasClass('enabled')) return;
    let iid = getCurrentIid();
    if (!iid) return;
    displayEncounterContent(NPC_DATA[currentNid].content(iid, flags, UTILS));
  });

  function hideEncounter() {
    currentNid = null;
    $('#encounter').addClass('hidden');
  }
  $('#btn-leave-wrapper').click(hideEncounter);

  // ################################
  // Inventory

  UTILS.getItem = function (iid) {

  };

  UTILS.dropItem = function (iid) {

  };

  function getCurrentIid() {
    return 'money';
  }

  // ################################
  // Main UI

  function setupMain() {
    setupNPCs();
    showScene('main');
    setTimeout(() => moveMap('a1'), 1);
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
