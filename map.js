const [MAP_DATA, NPC_DATA] = function () {
  'use strict';

  const map_data = {}, npc_data = {};

  // a1: starting point
  map_data.a1 = {
    pid: 'a1', row: 5, col: 0,
    arrows: {'ne': 'a4', 'e': 'a2'},
  };

  // a2
  map_data.a2 = {
    pid: 'a2', row: 5, col: 2,
    arrows: {'w': 'a1', 'e': 'a3'},
  };

  // a3:
  map_data.a3 = {
    pid: 'a3', row: 5, col: 4,
    arrows: {'w': 'a2', 'ne': 's'},
  };

  // a4: locked door [+ key --> access to b1]
  map_data.a4 = {
    pid: 'a4', row: 4, col: 1,
    arrows: {'nw': 'a5', 'ne': 'b1', 'e': 'a6', 'sw': 'a1'},
    hideArrows: {'doorOpen': 'ne'},
  };

  // a5: lake [+ fishing rod --> fish]
  map_data.a5 = {
    pid: 'a5', row: 3, col: 0,
    arrows: {'se': 'a4'},
  };

  // a6: money tree [--> money]
  map_data.a6 = {
    pid: 'a6', row: 4, col: 3,
    arrows: {'w': 'a4', 'ne': 'a7'},
  };

  // a7: cat [+ fish --> key]
  map_data.a7 = {
    pid: 'a7', row: 3, col: 4,
    arrows: {'sw': 'a6'},
  };

  // s: shop [+ money --> fishing rod][+ fishing rod --> money]
  map_data.s = {
    pid: 's', row: 3, col: 6,
    arrows: {'nw': 'b3', 'sw': 'a3', 'e': 'c7'},
    hideArrows: {'shopBOpen': 'nw', 'shopCOpen': 'e'},
  };

  // b1
  map_data.b1 = {
    pid: 'b1', row: 3, col: 2,
    arrows: {'sw': 'a4', 'ne': 'b2'},
  };

  // b2
  map_data.b2 = {
    pid: 'b2', row: 2, col: 3,
    arrows: {'sw': 'b1', 'ne': 'b3'},
  };

  // b3: midboss [+ medical package --> access to c1]
  map_data.b3 = {
    pid: 'b3', row: 1, col: 4,
    arrows: {'nw': 'b4', 'sw': 'b2', 'e': 'c1', 'se': 's'},
    hideArrows: {'midbossDefeated': 'e'},
  };

  // b4
  map_data.b4 = {
    pid: 'b4', row: 0, col: 3,
    arrows: {'w': 'b5', 'sw': 'b7', 'se': 'b3'},
  };

  // b5
  map_data.b5 = {
    pid: 'b5', row: 0, col: 1,
    arrows: {'sw': 'b6', 'e': 'b4'},
  };

  // b6: sword in stone [+ oil flask --> sword]
  map_data.b6 = {
    pid: 'b6', row: 1, col: 0,
    arrows: {'ne': 'b5', 'se': 'b8'},
  };

  // b7:
  map_data.b7 = {
    pid: 'b7', row: 1, col: 2,
    arrows: {'sw': 'b8', 'ne': 'b4'},
  };

  // b8: clinic [+ money --> medical package][(enter from b6) --> money]
  map_data.b8 = {
    pid: 'b8', row: 2, col: 1,
    arrows: {'nw': 'b6', 'ne': 'b7'},
  };

  // c1:
  map_data.c1 = {
    pid: 'c1', row: 1, col: 6,
    arrows: {'w': 'b3', 'ne': 'c6', 'se': 'c2'},
  };

  // c2: stove on fire [+ ice flask --> gem]
  map_data.c2 = {
    pid: 'c2', row: 2, col: 7,
    arrows: {'nw': 'c1', 'e': 'c3'},
  };

  // c3:
  map_data.c3 = {
    pid: 'c3', row: 2, col: 9,
    arrows: {'w': 'c2', 'ne': 'c4', 'sw': 'c7', 'se': 'd1'},
  };

  // c4: magician [+ oil --> oil flask][+ ice --> ice flask]
  map_data.c4 = {
    pid: 'c4', row: 1, col: 10,
    arrows: {'nw': 'c5', 'sw': 'c3'},
  };

  // c5: lake [+ fishing rod --> fish]
  map_data.c5 = {
    pid: 'c5', row: 0, col: 9,
    arrows: {'w': 'c6', 'se': 'c4'},
  };

  // c6:
  map_data.c6 = {
    pid: 'c6', row: 0, col: 7,
    arrows: {'sw': 'c1', 'e': 'c5'},
  };

  // c7: 
  map_data.c7 = {
    pid: 'c7', row: 3, col: 8,
    arrows: {'w': 's', 'ne': 'c3', 'sw': 'c8'},
  };

  // c8: boss [+ super sword --> access to f]
  map_data.c8 = {
    pid: 'c8', row: 4, col: 7,
    arrows: {'ne': 'c7', 'sw': 'f'},
    hideArrows: {'bossDefeated': 'sw'},
  };

  // d1
  map_data.d1 = {
    pid: 'd1', row: 3, col: 10,
    arrows: {'nw': 'c3', 'sw': 'd2'},
  };

  // d2: jail [+ key --> ice]
  map_data.d2 = {
    pid: 'd2', row: 4, col: 9,
    arrows: {'ne': 'd1', 'sw': 'd3'},
  };

  // d3:
  map_data.d3 = {
    pid: 'd3', row: 5, col: 8,
    arrows: {'ne': 'd2', 'e': 'd4'},
  };

  // d4:
  map_data.d4 = {
    pid: 'd4', row: 5, col: 10,
    arrows: {'w': 'd3'},
  };

  // f: final screen (congrats)
  map_data.f = {
    pid: 'f', row: 5, col: 6,
    arrows: {'ne': 'c8'},
  };

  return [map_data, npc_data];

}();
