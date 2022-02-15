$(function () {
  'use strict';

  const SCREEN_WIDTH = 700, SCREEN_HEIGHT = 400;
  const FRAME_RATE = 8;

  const MAP_ROW_HEIGHT = 256, MAP_COL_WIDTH = 160,
    MAP_TOP_OFFSET = 0, MAP_LEFT_OFFSET = 0,
    MAP_PANE_HEIGHT = 400, MAP_PANE_WIDTH = 500;

  const UTILS = {};

  let currentPid = null, currentNid = null, flags = {};

  // ################################
  // Map

  // Return the top-left position for the map location.
  function getMapCoords(pid) {
    return {
      top: MAP_TOP_OFFSET + MAP_ROW_HEIGHT * MAP_DATA[pid].row,
      left: MAP_LEFT_OFFSET + MAP_COL_WIDTH * MAP_DATA[pid].col,
    };
  }

  function moveMap(pid) {
    if (currentPid === pid) {
      UTILS.showArrows();
      return;
    }
    currentPid = pid;
    let coords = getMapCoords(pid);
    $('#map').css({
      top: -(coords.top) + 'px',
      left: -(coords.left) + 'px',
    });
    $('.arrow').hide();
    visitMinimap(pid);
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
  // Minimap

  const MINIMAP_ROW_HEIGHT = 20, MINIMAP_COL_WIDTH = 15,
    MINIMAP_TOP_OFFSET = 12, MINIMAP_LEFT_OFFSET = 15,
    YELLOW = '#fea';

  function getMiniMapCoords(pid) {
    return {
      x: MINIMAP_LEFT_OFFSET + MAP_DATA[pid].col * MINIMAP_COL_WIDTH,
      y: MINIMAP_TOP_OFFSET + MAP_DATA[pid].row * MINIMAP_ROW_HEIGHT,
    };
  }

  // Generate a tag in SVG namespace
  function S(tag, attr) {
    return $(document.createElementNS(
      "http://www.w3.org/2000/svg", tag.replace(/[<>]/g, '')))
      .attr(attr || {});
  }

  function setupMinimap() {
    S('circle', {
      id: 'mm-player',
      r: 7,
      fill: 'none',
      stroke: '#f55',
      'stroke-width': 4,
    }).appendTo('#minimap-avatars');
    Object.keys(MAP_DATA).forEach(pid => {
      let coords = getMiniMapCoords(pid);
      S('circle', {
        cx: coords.x, cy: coords.y,
        r: 5,
        fill: ((MAP_DATA[pid].customColors || {})['x'] || YELLOW),
      }).appendTo('#minimap-nodes').addClass('mm-' + pid).hide();
      Object.keys(MAP_DATA[pid].arrows).forEach(d => {
        if (d === 'nw' || d === 'sw' || d === 'w') return;
        let tgt = MAP_DATA[pid].arrows[d], tgtCoords = getMiniMapCoords(tgt);
        S('line', {
          x1: coords.x, y1: coords.y,
          x2: tgtCoords.x, y2: tgtCoords.y,
          'stroke-width': 2,
          stroke: ((MAP_DATA[pid].customColors || {})[d] || YELLOW),
        }).appendTo('#minimap-edges')
          .addClass('mm-' + pid).addClass('mm-' + tgt).hide();
      });
    });
  }

  function visitMinimap(pid) {
    $('.mm-' + pid).show();
    let coords = getMiniMapCoords(pid);
    $('#mm-player').attr({cx: coords.x, cy: coords.y});
  }

  // ################################
  // NPC Encounter

  function setupNPCs() {
    Object.values(NPC_DATA).forEach(npc => {
      let corrds = getMapCoords(npc.loc);
      let npcDiv = $('<div class=map-npc>').attr({
        'data-nid': npc.nid,
      }).addClass('map-' + npc.nid).appendTo('#map');
      // npcDiv.text(npc.name);
      npcDiv.append($('<div class=msp>'));
      if (npc.nidAlias) npcDiv.addClass('map-' + npc.nidAlias);
      if (npc.cosmetic) npcDiv.addClass('cosmetic');
      UTILS.refreshNpcOnMap(npc.nid);
    });
  }

  UTILS.refreshNpcOnMap = function (nid) {
    let npcOnMap = $('.map-npc[data-nid=' + nid + ']');
    Object.keys(NPC_DATA[nid].mapStates || {}).forEach(k => {
      npcOnMap.toggleClass(NPC_DATA[nid].mapStates[k], !!flags[k]);
    });
  };

  $('#map').on('click', '.map-npc', function (e) {
    if ($(this).hasClass('cosmetic')) return;
    showEncounter(this.dataset.nid);
  });

  function displayEncounterContent(content) {
    if (!content) {
      $('#npc-dialog').text('ERROR!');
      console.log(currentPid, currentNid, flags);
      return;
    }
    $('#npc-pic').removeClass().addClass('npc-' + currentNid + '-' + content.mood);
    if (NPC_DATA[currentNid].nidAlias)
      $('#npc-pic').addClass('npc-' + NPC_DATA[currentNid].nidAlias + '-' + content.mood);
    $('#btn-action-wrapper').toggleClass('enabled', content.enableAction);
    $('#btn-item-wrapper').toggleClass('enabled', content.enableItem);
    $('#inventory').toggleClass('selectable', content.enableItem);
    $('#npc-dialog').empty();
    content.dialog.forEach(x => $('<p>').html(x).appendTo('#npc-dialog'));
  }

  function setBtnItemText(iid) {
    if (currentNid === null) return;
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
    if (! $('#btn-action-wrapper').hasClass('enabled')) return;
    displayEncounterContent(NPC_DATA[currentNid].content('action', flags, UTILS));
  });

  $('#btn-item-wrapper').click(function () {
    if (! $('#btn-item-wrapper').hasClass('enabled')) return;
    let iid = getSelectedItem();
    if (!iid) return;
    displayEncounterContent(NPC_DATA[currentNid].content(iid, flags, UTILS));
  });

  function hideEncounter() {
    currentNid = null;
    UTILS.deselectItems();
    $('#encounter').addClass('hidden');
    $('#Inventory').removeClass('selectable');
    saveGame();
    if (flags.gameWon) showWinScene();
  }
  $('#btn-leave-wrapper').click(hideEncounter);

  // ################################
  // Inventory

  UTILS.addItem = function (iid, index) {
    if (index === undefined) {
      $('.item').each((i, e) => {
        if (!e.dataset.iid) {
          index = i;
          return false;
        }
      });
    }
    $('.item')[index].dataset.iid = iid;
    UTILS.deselectItems();
    $('.item').eq(index).addClass('flashing');
  };

  $('.item').on('click animationend', function () {
    $(this).removeClass('flashing');
  });

  UTILS.removeItem = function (iid) {
    $('.item[data-iid="' + iid + '"]')[0].dataset.iid = '';
    UTILS.deselectItems();
  };

  UTILS.deselectItems = function () {
    $('.item').removeClass('selected');
    $('#btn-item-wrapper').removeClass('itemSelected');
    setBtnItemText('');
  }

  $('.item').click(function () {
    // Only allow item select in NPC page
    if (currentNid === null || ! $('#btn-item-wrapper').hasClass('enabled')) return;
    let iid = this.dataset.iid;
    if (!iid || (NPC_DATA[currentNid].forbiddenIids || []).indexOf(iid) !== -1) {
      UTILS.deselectItems();
    } else {
      $('.item').removeClass('selected');
      $(this).addClass('selected');
      $('#btn-item-wrapper').addClass('itemSelected');
      setBtnItemText(iid);
    }
  });

  function getSelectedItem() {
    let selected = $('.item.selected');
    return selected.length ? selected[0].dataset.iid : null;
  }

  function getAllItems() {
    return $('.item').get().map(x => x.dataset.iid);
  }

  // ################################
  // Win scene

  function showWinScene() {
    let showWinSceneInner = function () {
      $('#scene-cover').off('transitionend', showWinSceneInner);
      $('#btn-leave-wrapper').hide();
      showEncounter('cake');
      $('#scene-cover').addClass('hidden');
    };
    $('#scene-cover').on('transitionend', showWinSceneInner).removeClass('hidden');
  }

  // ################################
  // Main UI

  function setupMain() {
    setupNPCs();
    setupMinimap();
    $('.scene').hide();
    $('#scene-cover').show().removeClass('hidden');
    $('#scene-main').show();
    setTimeout(() => {
      moveMap('a1');
      $('#scene-cover').addClass('hidden');
    }, 1);
  }

  function saveGame() {
    let data = {flags: flags, items: getAllItems(), pid: currentPid};
    console.log(data);
  }

  function loadGame(data) {
    flags = data.flags;
    Object.keys(NPC_DATA).forEach(UTILS.refreshNpcOnMap);
    data.items.forEach(UTILS.addItem);
    moveMap(data.pid);
  }

  $('#debug').click(() => loadGame({
    flags: {
      "gotMoneyFromFairy": true,
      "tutorialDone2": true,
      "tutorialDone1": true,
    },
    items: ['rod', '', '', '', 'oil', ''],
    pid: 'a5',
  }));
  $('#skipA').click(() => loadGame({
    flags: {
      "gotMoneyFromFairy": true,
      "tutorialDone2": true,
      "tutorialDone1": true,
      "pondFished": true,
      "catFed": true,
    },
    items: ['rod', 'key', '', '', 'oil', ''],
    pid: 'a4',
  }));
  $('#skipB').click(() => loadGame({
    flags: {
      "gotMoneyFromFairy": true,
      "tutorialDone2": true,
      "tutorialDone1": true,
      "pondFished": true,
      "catFed": true,
      "doorOpen": true,
      "feePaid": true,
      "nurseHelped": true,
      "midbossCleaned": true,
    },
    items: ['money', '', '', '', 'oil', ''],
    pid: "b3",
  }));
  $('#skipI').click(() => loadGame({
    flags: {
      "gotMoneyFromFairy": true,
      "tutorialDone2": true,
      "tutorialDone1": true,
      "pondFished": true,
      "catFed": true,
      "doorOpen": true,
      "feePaid": true,
      "nurseHelped": true,
      "midbossCleaned": true,
      "midbossDefeated": true,
      "moneyStolen": true,
      "stoneOiled": true,
      "swordPulled": true,
      "lakeFished": true,
      "iceEscaped": true
    },
    items: ['rod', 'sword', '', '', 'oil', 'ice'],
    pid: "d2",
  }));
  $('#skipC').click(() => loadGame({
    flags: {
      "gotMoneyFromFairy": true,
      "tutorialDone2": true,
      "tutorialDone1": true,
      "pondFished": true,
      "catFed": true,
      "doorOpen": true,
      "feePaid": true,
      "nurseHelped": true,
      "midbossCleaned": true,
      "midbossDefeated": true,
      "moneyStolen": true,
      "stoneOiled": true,
      "swordPulled": true,
      "lakeFished": true,
      "iceEscaped": true,
      "swordGiven": true,
      "fireIced": true,
      "gemPicked": true,
      "gemGiven": true
    },
    items: ['rod', 'powersword', '', '', 'oil', 'ice'],
    pid: "d4",
  }));

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
    'img/map.png',
    'img/arrow.png',
    'img/sheet.png',
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
  $('.scene').hide();
  $('#scene-preload').show();

});
