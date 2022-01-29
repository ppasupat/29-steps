const [MAP_DATA, NPC_DATA] = function () {
  'use strict';

  const map_data = {}, npc_data = {};

  // ################################
  // Macros

  const item_names = {
    oil: 'OIL',
    ice: 'ICE',
    money: 'เงิน',
    rod: 'เบ็ด',
    fish: 'ปลา',
    key: 'กุญแจ',
    queue: 'บัตรคิว',
    oilflask: 'ขวดน้ำมัน',
    iceflask: 'ขวดน้ำแข็ง',
    sword: 'ดาบโง่ๆ',
    gem: 'อัญมณี',
    powersword: 'ดาบปราบมาร',
  };
  const GIVE = (x => 'ให้ <b>' + (item_names[x] || '???') + '</b>');
  const USE = (x => 'ใช้ <b>' + (item_names[x] || '???') + '</b>');

  function escapeHtml(x) {
    return x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function R(picture, enableAction, enableItem, dialog) {
    return {
      picture: picture,
      enableAction: enableAction,
      enableItem: enableItem,
      dialog: dialog,
    };
  }

  // ################################
  // Data

  // a1: fairy [--> money]
  map_data.a1 = {
    pid: 'a1', row: 5, col: 0,
    arrows: {'ne': 'a4', 'e': 'a2'},
    hideArrows: {'tutorialDone1': 'e', 'tutorialDone2': 'ne'},
  };

  npc_data.fairy = {
    nid: 'fairy', loc: 'a1',
    name: 'นางฟ้า',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    content: function(op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.gotMoneyFromFairy) 
            return R(null, true, false, [
              'สวัสดีจ้ะ เธอคือผู้กล้าที่จะมาช่วยพวกเราจาก<b>จอมมาร</b>สินะ',
              'มีอะไรให้ฉันช่วยไหม?']);
          else
            return R(null, false, true, [
              'ก่อนเธอจะไป ลองฝึกใช้ไอเทมดูหน่อยนะ<br><i>(เลือก<b>เงิน</b>ที่ได้มา แล้วกด "ให้เงิน")</i>']);
        case 'action':
          flags.gotMoneyFromFairy = true;
          utils.addItem('money');
          return R(null, false, true, [
            'งกจริง!<br>เอาไป <b>30 บาท</b>',
            'ก่อนเธอจะไป ลองฝึกใช้ไอเทมดูหน่อยนะ<br><i>(เลือก<b>เงิน</b>ที่ได้มา แล้วกด "ให้เงิน")</i>']);
        case 'money':
          flags.tutorialDone1 = flags.tutorialDone2 = true;
          utils.deselectItems();
          utils.showArrows();
          utils.getNpcOnMap('fairy').hide();
          return R(null, false, false, [
            '555+ ล้อเล่นๆ ไม่ต้องคืนเงินฉันหรอก',
            'ฉันเปิดทางให้แล้ว<br><b>ขอให้โชคดี!</b>']);
      }
    },
    forbiddenIids: ['oil'],
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

  npc_data.door = {
    nid: 'door', loc: 'a4',
    name: 'ประตู',
    actionText: 'งั้นเดินอ้อม',
    itemText: USE,
    content: function(op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.doorOpen) {
            return R(null, true, true, [
              'มีประตูบานใหญ่ปิดทางอยู่']);
          } else {
            return R('open', false, false, [
              'ประตูเปิดอยู่ คุณสามารถเดินผ่านได้']);
          }
        case 'action':
          return R(null, true, true, [
            'อย่าโกงสิลูก',
            'ที่ประตูมี<b>รูกุญแจ</b>อยู่']);
        case 'fish':
        case 'rod':
        case 'money':
        case 'oil':
          let line1 = (
            op === 'money' ? 'คุณพยายามติดสินบนประตู' :
            op === 'oil' ? 'คุณพยายามพังประตู' :
            'คุณใส่' + item_names[op] + 'ในรูกุญแจ');
          return R(null, true, true, [
            line1, 'แต่ประตูก็ยังเปิดไม่ออก']);
        case 'key':
          flags.doorOpen = true;
          utils.getNpcOnMap('door').addClass('open');
          utils.showArrows();
          return R('open', true, true, [
            'คุณใช้กุญแจเปิดประตู',
            'คุณสามารถเดินผ่านได้แล้ว']);
      }
    },
  };

  // a5: lake [+ fishing rod --> fish]
  map_data.a5 = {
    pid: 'a5', row: 3, col: 0,
    arrows: {'se': 'a4'},
  };

  // a6:
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

  // ################################################

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

  // b3: midboss [+ queue slip --> access to c1]
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
    arrows: {'ne': 'b5'},
  };

  // b7:
  map_data.b7 = {
    pid: 'b7', row: 1, col: 2,
    arrows: {'sw': 'b8', 'ne': 'b4'},
  };

  // b8: nurse [+ money --> queue slip][(nurse gone) --> money]
  map_data.b8 = {
    pid: 'b8', row: 2, col: 1,
    arrows: {'ne': 'b7'},
  };

  // ################################################

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

  // c8: boss [+ power sword --> access to f]
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

  // d4: blacksmith [+ sword + gem --> power sword]
  map_data.d4 = {
    pid: 'd4', row: 5, col: 10,
    arrows: {'w': 'd3'},
  };

  // f: cake
  map_data.f = {
    pid: 'f', row: 5, col: 6,
    arrows: {'ne': 'c8'},
  };

  return [map_data, npc_data];

}();
