const [MAP_DATA, NPC_DATA] = function () {
  'use strict';

  const map_data = {}, npc_data = {};

  // ################################
  // Macros

  const item_names = {
    oil: 'OIL',
    ice: 'ICE',
    money: 'เงิน 30 บาท',
    rod: 'เบ็ดตกปลา',
    fish: 'ปลา',
    key: 'กุญแจ',
    entkit: 'ชุดตรวจหู',
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
    mapStates: {'tutorialDone1': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.gotMoneyFromFairy) 
            return R(null, true, false, [
              'สวัสดีจ้ะ เธอคือผู้กล้าที่จะมาช่วยพวกเราจาก<b>จอมมาร</b>สินะ',
              'มีอะไรให้ฉันช่วยไหม?']);
          else
            return R(null, false, true, [
              'ก่อนเธอจะไป ลองฝึกใช้ไอเทมดูหน่อยนะ<br><i>(เลือก<b>เงิน</b>ที่ได้มา<br>แล้วกด "ให้")</i>']);
        case 'action':
          flags.gotMoneyFromFairy = true;
          utils.addItem('money');
          return R(null, false, true, [
            'งกจริง!<br>เอาไป <b>30 บาท</b>',
            'ก่อนเธอจะไป ลองฝึกใช้ไอเทมดูหน่อยนะ<br><i>(เลือก<b>เงิน</b>ที่ได้มา<br>แล้วกด "ให้")</i>']);
        case 'money':
          utils.deselectItems();
          flags.tutorialDone1 = flags.tutorialDone2 = true;
          utils.refreshNpcOnMap('fairy');
          utils.showArrows();
          return R('happy', false, false, [
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

  // a4: door [+ key --> access to b1]
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
    mapStates: {'doorOpen': 'open'},
    content: function (op, flags, utils) {
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
        case 'key':
          utils.removeItem('key');
          flags.doorOpen = true;
          utils.refreshNpcOnMap('door');
          utils.showArrows();
          return R('open', false, false, [
            'คุณใช้กุญแจเปิดประตู',
            'คุณสามารถเดินผ่านได้แล้ว']);
        default:
          let line1 = (
            op === 'money' ? 'คุณพยายามติดสินบนประตู' :
            op === 'oil' ? 'คุณพยายามพังประตู' :
            'คุณใส่' + item_names[op] + 'ในรูกุญแจ');
          return R(null, true, true, [
            line1, 'แต่ประตูก็ยังเปิดไม่ออก']);
      }
    },
  };

  // a5: pond [+ fishing rod --> fish]
  map_data.a5 = {
    pid: 'a5', row: 3, col: 0,
    arrows: {'se': 'a4'},
  };

  npc_data.pond = {
    nid: 'pond', loc: 'a5',
    name: 'บ่อน้ำ',
    actionText: '',
    itemText: USE,
    mapStates: {'pondFished': 'fished'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.pondFished) {
            return R(null, false, true, [
              'มี<b>ปลา</b>ว่ายอยู่ในบ่อน้ำ']);
          } else {
            return R('fished', false, false, [
              'ไม่มีอะไรอยู่ในบ่อน้ำ']);
          }
        case 'rod':
          utils.addItem('fish');
          flags.pondFished = true;
          utils.refreshNpcOnMap('pond');
          return R('fished', false, false, [
            'คุณตก<b>ปลา</b>ขึ้นมาจากบ่อน้ำ']);
        case 'oil':
          return R(null, false, true, [
            'คุณพยายามจับปลาด้วยมือ แต่ปลาลื่นเกินไป']);
        default:
          return R(null, false, true, [
            'อย่าทิ้งของลงน้ำสิ!']);
      }
    },
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

  npc_data.cat = {
    nid: 'cat', loc: 'a7',
    name: 'แมว',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(null, true, true, [
            'เมี้ยว!']);
        case 'action':
          return R('sad', true, true, [
            'ฉันไม่มีเงินเลยเมี้ยว!',
            'แต่ถ้าเธอให้<b>อาหาร</b>ฉัน ฉันมีของให้เธอนะเมี้ยว!']);
        case 'fish':
          utils.removeItem('fish');
          utils.addItem('key');
          return R('happy', true, true, [
            'เมี้ยวๆๆ อร่อยจัง!',
            'ฉันจะให้ของเธอเป็นการตอบแทนนะเมี้ยว!']);
        case 'key':
          return R('happy', true, true, [
            'เธอเก็บมันไว้เถอะ ไม่ต้องเกรงใจเมี้ยว!']);
        case 'oil':
        case 'ice':
          return R('happy', true, true, [
            'สวัสดี ' + item_names[op],
            'ยินดีที่ได้รู้จักเมี้ยว!']);
        default:
          return R('sad', true, true, [
            'อะไรหนะ? ฉันกินไม่เป็นเมี้ยว!']);
      }
    },
  };

  // s: shop [+ money --> fishing rod][+ fishing rod --> money]
  map_data.s = {
    pid: 's', row: 3, col: 6,
    arrows: {'nw': 'b3', 'sw': 'a3', 'e': 'c7'},
    hideArrows: {'shopBOpen': 'nw', 'shopCOpen': 'e'},
  };

  npc_data.shop = {
    nid: 'shop', loc: 's',
    name: 'พ่อค้า',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(null, true, true, [
            'แวะชมของก่อนได้นะครับ',
            'ตอนนี้<b>เบ็ดตกปลา</b>ราคาพิเศษ 30 บาทเท่านั้น!']);
        case 'action':
          return R('sad', true, true, [
            'ผมให้เงินคุณฟรีๆ ไม่ได้หรอกครับ',
            'แต่ถ้าคุณไม่พอใจสินค้า ผมยินดี<b>คืนเงิน</b>ครับ']);
        case 'money':
          utils.removeItem('money');
          utils.addItem('rod');
          return R('happy', true, true, [
            'เบ็ดตกปลา 1 คันนะครับ',
            'ขอบคุณที่อุดหนุนครับ!']);
        case 'rod':
          utils.removeItem('rod');
          utils.addItem('money');
          return R('sad', true, true, [
            'เบ็ดใช้งานไม่ดีหรือครับ',
            'ไม่เป็นไรครับ ผมคืนเงินให้ครับ']);
        case 'oil':
        case 'ice':
          return R(null, true, true, [
            'ขอโทษครับ ผมยังไม่ต้องการลูกน้องครับ']);
        default:
          return R(null, true, true, [
            'ขอโทษครับ ผมไม่รับซื้อของครับ']);
      }
    },
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

  // b3: midboss [+ ent kit --> access to c1]
  map_data.b3 = {
    pid: 'b3', row: 1, col: 4,
    arrows: {'nw': 'b4', 'sw': 'b2', 'e': 'c1', 'se': 's'},
    hideArrows: {'midbossDefeated': 'e'},
    onMove: function (destPid, flags, utils) {
      if (destPid === 's') flags.shopBOpen = true;
    },
  };

  npc_data.midboss = {
    nid: 'midboss', loc: 'b3',
    name: 'สัตว์ประหลาด',
    actionText: 'ขอทางหน่อย',
    itemText: USE,
    mapStates: {'midbossDefeated': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.midbossCleaned) {
            return R(null, true, true, [
              '...',
              '(มีสัตว์ประหลาดขวางทางอยู่)']);
          } else {
            return R('cleaned', true, false, [
              'สวัสดี!',
              'ขอบใจเจ้าอีกครั้งที่ช่วยตรวจหูข้า']);
          }
        case 'action':
          if (!flags.midbossCleaned) {
            return R(null, true, true, [
              'ฮะ? พูดว่าอะไรนะ?',
              '<b>ข้าไม่ได้ยิน</b>']);
          } else {
            flags.midbossDefeated = true;
            utils.refreshNpcOnMap('midboss');
            utils.refreshNpcOnMap('receptionist');
            utils.showArrows();
            return R('cleaned', false, false, [
              'ได้สิ! ขอให้เจ้าเดินทางปลอดภัย']);
          }
        case 'entkit':
          utils.removeItem('entkit');
          flags.midbossCleaned = true;
          return R('cleaned', true, false, [
            'อ๊ะ!',
            'จู่ๆ ข้าก็ได้ยินชัดขึ้น',
            'ขอบใจเจ้ามากที่ช่วยตรวจหูข้า']);
        default:
          return R(null, true, true, [
            '...',
            '(สัตว์ประหลาดไม่สนใจ)']);
      }
    },
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

  // b6: fire [+ ice --> gem]
  map_data.b6 = {
    pid: 'b6', row: 1, col: 0,
    arrows: {'ne': 'b5'},
  };

  // b7: receptionist [+ money --> access to b8][(gone) --> money]
  map_data.b7 = {
    pid: 'b7', row: 1, col: 2,
    arrows: {'sw': 'b8', 'ne': 'b4'},
    hideArrows: {'feePaid': 'sw'},
  };

  npc_data.receptionist = {
    nid: 'receptionist', loc: 'b7',
    name: 'แผนกต้อนรับ',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    mapStates: {'midbossDefeated': 'rest', 'moneyStolen': 'stolen'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.midbossDefeated) {
            if (!flags.feePaid) {
              return R(null, true, true, [
                'ไพรสัณฑ์คลินิก<br>ยินดีต้อนรับค่ะ',
                'คลินิกเราอยู่ในโครงการ <b>30 บาทรักษา 1 โรค</b>นะคะ']);
            } else {
              return R(null, true, false, [
                'ไพรสัณฑ์คลินิก<br>ยินดีต้อนรับค่ะ',
                'เชิญพบคุณหมอที่ห้องตรวจได้เลยค่ะ']);
            }
          } else if (!flags.moneyStolen) {
            return R('rest', true, false, [
              'ป้าย:<br>"พักเที่ยงค่ะ"',
              'บนโต๊ะมี<b>เงิน</b>อยู่']);
          } else {
            return R('stolen', false, false, [
              'ป้าย:<br>"พักเที่ยงค่ะ"']);
          }
        case 'action':
          if (!flags.midbossDefeated) {
            if (!flags.feePaid) {
              return R(null, true, true, [
                'ไม่ให้ค่ะ']);
            } else {
              return R(null, true, false, [
                'ทางเราไม่มีนโยบายคืนเงินค่ะ']);
            }
          } else {
            utils.addItem('money');
            flags.moneyStolen = true;
            return R('stolen', false, false, [
              'คุณ <b>"ยืม"</b> เงิน 30 บาท จากโต๊ะ']);
          }
        case 'money':
          utils.removeItem('money');
          flags.feePaid = true;
          utils.showArrows();
          return R(null, true, false, [
            'เชิญพบคุณหมอที่ห้องตรวจได้เลยค่ะ']);
        case 'oil':
          return R(null, true, true, [
            'กรุณาชำระเงิน 30 บาทก่อนพบคุณหมอค่ะ']);
        default:
          return R(null, true, true, [
            'ไม่เอาค่ะ']);
      }
    },
  };

  // b8: nurse [+ oil --> ent kit]
  map_data.b8 = {
    pid: 'b8', row: 2, col: 1,
    arrows: {'ne': 'b7'},
  };

  npc_data.nurse = {
    nid: 'nurse', loc: 'b8',
    name: 'พยาบาล',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.nurseHelped) {
            return R(null, true, true, [
              'สวัสดีครับ',
              'เชิญนั่งรอก่อนนะครับ<br><b>ไม่รู้หมอไปไหน</b>']);
          } else {
            return R(null, true, false, [
              'สวัสดีครับหมอ']);
          }
        case 'action':
          if (!flags.nurseHelped) {
            return R('sad', true, true, [
              'เอิ่ม...',
              'ผมไม่มีเงินให้ครับ']);
          } else {
            return R('sad', true, false, [
              'ขอโทษครับหมอ ช่วงนี้ผมช็อตเงิน']);
          }
        case 'oil':
          utils.addItem('entkit');
          flags.nurseHelped = true;
          return R('happy', true, false, [
            'อ้อ! คุณเป็นหมอ ENT ใหม่สินะครับ',
            'ดีเลย ช่วงนี้คนไข้เยอะ นี่<b>ชุดตรวจหู</b>ครับ']);
        default:
          return R('sad', true, true, [
            'เอิ่ม...',
            'อะไรครับเนี่ย']);
      }
    },
  };

  // ################################################

  // c1:
  map_data.c1 = {
    pid: 'c1', row: 1, col: 6,
    arrows: {'w': 'b3', 'ne': 'c6', 'se': 'c2'},
  };

  // c2:
  map_data.c2 = {
    pid: 'c2', row: 2, col: 7,
    arrows: {'nw': 'c1', 'e': 'c3'},
  };

  // c3:
  map_data.c3 = {
    pid: 'c3', row: 2, col: 9,
    arrows: {'w': 'c2', 'ne': 'c4', 'sw': 'c7', 'se': 'd1'},
  };

  // c4: sword in stone [+ oil --> sword]
  map_data.c4 = {
    pid: 'c4', row: 1, col: 10,
    arrows: {'nw': 'c5', 'sw': 'c3'},
  };

  // c5:
  map_data.c5 = {
    pid: 'c5', row: 0, col: 9,
    arrows: {'w': 'c6', 'se': 'c4'},
  };

  // c6: lake [+ fishing rod --> fish]
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

  // d1:
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
