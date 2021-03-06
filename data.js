const [MAP_DATA, NPC_DATA] = function () {
  'use strict';

  const map_data = {}, npc_data = {};

  // ################################
  // Macros

  const itemNames = {
    oil: 'OIL',
    ice: 'ICE',
    money: 'เงิน 30 บาท',
    rod: 'เบ็ดตกปลา',
    fish: 'ปลา',
    grilledfish: 'ปลาย่าง',
    key: 'กุญแจ',
    entkit: 'ชุดตรวจหู',
    sword: 'ดาบกากๆ',
    gem: 'อัญมณี',
    powersword: 'ดาบปราบมาร',
  };
  const GIVE = (x => 'ให้ <b>' + (itemNames[x] || '???') + '</b>');
  const USE = (x => 'ใช้ <b>' + (itemNames[x] || '???') + '</b>');
  const GRAY = '#667', BROWN = '#741', PURPLE = '#606';

  function escapeHtml(x) {
    return x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function R(mood, enableAction, enableItem, dialog) {
    return {
      mood: mood,
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
    mainNpc: 'fairy',
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
            return R(0, true, false, [
              'สวัสดีจ้ะ เธอคือผู้กล้าที่จะมาช่วยพวกเราจาก<b>จอมมาร</b>สินะ',
              'มีอะไรให้ฉันช่วยไหม?']);
          else
            return R(0, false, true, [
              'ก่อนเธอจะไป ลองฝึกใช้ไอเทมดูหน่อยนะ<br><i>(เลือก<b>เงิน</b>แล้วกด “ให้”)</i>']);
        case 'action':
          flags.gotMoneyFromFairy = 1;
          utils.addItem('money');
          return R(1, false, true, [
            'งกจริง!<br>เอาไป <b>30 บาท</b>',
            'ก่อนเธอจะไป ลองฝึกใช้ไอเทมดูหน่อยนะ<br><i>(เลือก<b>เงิน</b>แล้วกด “ให้”)</i>']);
        case 'money':
          utils.deselectItems();
          flags.tutorialDone1 = flags.tutorialDone2 = 1;
          utils.refreshNpcOnMap('fairy');
          utils.showArrows();
          return R(0, false, false, [
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
    customColors: {'ne': BROWN},
  };

  // a4: door [+ key --> access to b1]
  map_data.a4 = {
    pid: 'a4', row: 4, col: 1,
    arrows: {'nw': 'a5', 'ne': 'b1', 'e': 'a6', 'sw': 'a1'},
    hideArrows: {'doorOpen': 'ne'},
    customColors: {'e': GRAY},
    mainNpc: 'door',
  };

  npc_data.door = {
    nid: 'door', loc: 'a4',
    name: 'ประตู',
    actionText: 'งั้นเดินอ้อม',
    itemText: USE,
    mapStates: {'doorOpen': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.doorOpen) {
            return R(0, true, true, [
              'มีประตูบานใหญ่ปิดทางอยู่']);
          } else {
            return R(1, false, false, [
              'ประตูเปิดอยู่ คุณสามารถเดินผ่านได้']);
          }
        case 'action':
          return R(0, true, true, [
            'อย่าโกงสิลูก',
            'ที่ประตูมี<b>รูกุญแจ</b>อยู่']);
        case 'key':
          utils.removeItem('key');
          flags.doorOpen = 1;
          utils.refreshNpcOnMap('door');
          utils.refreshNpcOnMap('noBridgeB');
          utils.refreshNpcOnMap('bridgeB');
          utils.showArrows();
          return R(999, false, false, [
            'คุณใช้กุญแจเปิดประตู',
            'แล้วประตูก็หายไป!',
            '<i>เพราะไอซ์ขี้เกียจวาด</i>']);
        default:
          let line1 = (
            op === 'money' ? 'คุณพยายามติดสินบนประตู' :
            op === 'oil' ? 'คุณพยายามพังประตู' :
            'คุณใส่' + itemNames[op] + 'ในรูกุญแจ');
          return R(0, true, true, [
            line1, 'แต่ประตูก็ยังเปิดไม่ออก']);
      }
    },
  };

  // a5: pond [+ fishing rod --> fish]
  map_data.a5 = {
    pid: 'a5', row: 3, col: 0,
    arrows: {'se': 'a4'},
    customColors: {'x': BROWN, 'se': GRAY},
    mainNpc: 'pond',
  };

  npc_data.pond = {
    nid: 'pond', loc: 'a5',
    nidAlias: 'fish',
    name: 'บ่อน้ำ',
    actionText: '',
    itemText: USE,
    mapStates: {'pondFished': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, false, true, [
            'มี<b>ปลา</b>ว่ายอยู่ในบ่อน้ำ']);
        case 'rod':
          utils.addItem('fish');
          flags.pondFished = 1;
          utils.refreshNpcOnMap('pond');
          return R(999, false, false, [
            'คุณตก<b>ปลา</b>ขึ้นมาจากบ่อน้ำ']);
        case 'oil':
          return R(0, false, true, [
            'คุณพยายามจับปลาด้วยมือ แต่ปลาลื่นเกินไป']);
        default:
          return R(0, false, true, [
            'อย่าทิ้งของลงน้ำสิ!']);
      }
    },
  };

  // a6:
  map_data.a6 = {
    pid: 'a6', row: 4, col: 3,
    arrows: {'w': 'a4', 'ne': 'a7'},
    customColors: {'x': BROWN, 'ne': BROWN},
  };

  // a7: cat [+ fish --> key]
  map_data.a7 = {
    pid: 'a7', row: 3, col: 4,
    arrows: {'sw': 'a6'},
    customColors: {'x': BROWN},
    mainNpc: 'cat',
  };

  npc_data.cat = {
    nid: 'cat', loc: 'a7',
    name: 'แมว (?)',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, true, true, [
            'เมี้ยว!']);
        case 'action':
          return R(1, true, true, [
            'ฉันไม่มีเงินเลยเมี้ยว!',
            'แต่ถ้าเธอให้<b>อาหาร</b>ฉัน ฉันมีของให้เธอนะเมี้ยว!']);
        case 'fish':
          if (flags.catFed) {
            return R(1, true, true, [
              'เบื่อปลา<b>ดิบ</b>แล้วหงะเมี้ยว!',
              'มีอย่างอื่นมั้ยเมี้ยว?']);
          } else {
            utils.removeItem('fish');
            utils.addItem('key');
            flags.catFed = 1;
            return R(2, true, true, [
              'เมี้ยวๆๆ อร่อยจัง!',
              'ฉันจะให้ของเธอเป็นการตอบแทนนะเมี้ยว!']);
          }
        case 'grilledfish':
          utils.removeItem('grilledfish');
          utils.addItem('key');
          return R(2, true, true, [
            'เมี้ยวๆๆ อร่อยจัง!',
            'ฉันจะให้ของเธอเป็นการตอบแทนนะเมี้ยว!']);
        case 'key':
          return R(0, true, true, [
            'เธอเก็บมันไว้เถอะ ไม่ต้องเกรงใจเมี้ยว!']);
        case 'oil':
        case 'ice':
          return R(0, true, true, [
            'สวัสดี ' + itemNames[op],
            'ยินดีที่ได้รู้จักเมี้ยว!']);
        default:
          return R(1, true, true, [
            'อะไรหนะ? ฉันกินไม่เป็นเมี้ยว!']);
      }
    },
  };

  // s: shop [+ money --> fishing rod][+ fishing rod --> money]
  map_data.s = {
    pid: 's', row: 3, col: 6,
    arrows: {'nw': 'b3', 'sw': 'a3', 'e': 'c7'},
    hideArrows: {'doorOpen': 'nw', 'midbossDefeated': 'e'},
    customColors: {'x': GRAY, 'e': BROWN},
    mainNpc: 'shop',
  };

  npc_data.noBridgeB = {
    nid: 'noBridgeB', loc: 's', cosmetic: true,
    nidAlias: 'construction',
    name: 'noBridgeB',
    mapStates: {'doorOpen': 'gone'},
  };
  npc_data.bridgeB = {
    nid: 'bridgeB', loc: 's', cosmetic: true,
    name: 'bridgeB',
    mapStates: {'doorOpen': 'appear'},
  };
  npc_data.noBridgeC = {
    nid: 'noBridgeC', loc: 's', cosmetic: true,
    nidAlias: 'construction',
    name: 'noBridgeC',
    mapStates: {'midbossDefeated': 'gone'},
  };
  npc_data.bridgeC = {
    nid: 'bridgeC', loc: 's', cosmetic: true,
    name: 'bridgeC',
    mapStates: {'midbossDefeated': 'appear'},
  };

  npc_data.shop = {
    nid: 'shop', loc: 's',
    name: 'พ่อค้า',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, true, true, [
            'แวะชมของก่อนได้นะครับ',
            'ตอนนี้<b>เบ็ดตกปลา</b>ราคาพิเศษ 30 บาทเท่านั้น!']);
        case 'action':
          return R(1, true, true, [
            'ผมให้เงินคุณฟรีๆ ไม่ได้หรอกครับ',
            'แต่ถ้าคุณไม่พอใจสินค้า ผมยินดี<b>คืนเงิน</b>ครับ']);
        case 'money':
          utils.removeItem('money');
          utils.addItem('rod');
          return R(2, true, true, [
            'เบ็ดตกปลา 1 คันนะครับ',
            'ขอบคุณที่อุดหนุนครับ!']);
        case 'rod':
          utils.removeItem('rod');
          utils.addItem('money');
          return R(1, true, true, [
            'เบ็ดใช้งานไม่ดีหรือครับ',
            'ไม่เป็นไรครับ ผมคืนเงินให้ครับ']);
        case 'oil':
        case 'ice':
          return R(0, true, true, [
            'ขอบคุณครับ แต่ผมยังไม่ต้องการลูกน้องครับ']);
        default:
          return R(1, true, true, [
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
    customColors: {'e': GRAY, 'se': BROWN},
    mainNpc: 'midboss',
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
            return R(0, true, true, [
              '...',
              '<i>(สัตว์ประหลาดขวางสะพานอยู่)</i>']);
          } else {
            return R(1, true, false, [
              'สวัสดี!',
              'ขอบใจเจ้าอีกครั้งที่ช่วยตรวจหูข้า']);
          }
        case 'action':
          if (!flags.midbossCleaned) {
            return R(0, true, true, [
              'ฮะ? พูดว่าอะไรนะ?',
              '<b>ข้าไม่ได้ยิน</b>']);
          } else {
            flags.midbossDefeated = 1;
            utils.refreshNpcOnMap('midboss');
            utils.refreshNpcOnMap('receptionist');
            utils.refreshNpcOnMap('noBridgeC');
            utils.refreshNpcOnMap('bridgeC');
            utils.showArrows();
            return R(1, false, false, [
              'ได้สิ! ขอให้เจ้าเดินทางปลอดภัย']);
          }
        case 'entkit':
          utils.removeItem('entkit');
          flags.midbossCleaned = 1;
          return R(1, true, false, [
            'อ๊ะ!',
            'จู่ๆ ข้าก็ได้ยินชัดขึ้น',
            'ขอบใจเจ้ามากที่ช่วยตรวจหูข้า']);
        default:
          return R(0, true, true, [
            '...',
            '<i>(สัตว์ประหลาดไม่สนใจ)</i>']);
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
    mainNpc: 'fire',
  };

  npc_data.fire = {
    nid: 'fire', loc: 'b6',
    name: 'กองไฟ',
    actionText: 'แหย่มือ',
    itemText: USE,
    mapStates: {'fireIced': 'map-fire-1', 'gemPicked': 'map-fire-2'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.fireIced) {
            return R(0, true, true, [
              'กองไฟลุกโชติช่วง',
              'ในกองไฟเหมือน<b>มีอะไร</b>ประกายแสงอยู่']);
          } else if (!flags.gemPicked) {
            return R(1, true, false, [
              'ไฟถูกดับแล้ว',
              'ในกองไม้มี<b>อัญมณี</b>สะท้อนแสงวับวาว']);
          } else {
            return R(2, false, false, [
              'ไฟถูกดับแล้ว']);
          }
        case 'action':
        case 'oil':
          if (!flags.fireIced) {
            return R(0, true, true, [
              '<b>โอ๊ย! ร้อนๆ!</b>',
              'คุณดึงมือออกทันควัน']);
          } else {
            utils.addItem('gem');
            flags.gemPicked = 1;
            utils.refreshNpcOnMap('fire');
            return R(2, false, false, [
              'คุณเก็บอัญมณีขึ้นมา']);
          }
        case 'ice':
          utils.deselectItems();
          flags.fireIced = 1;
          utils.refreshNpcOnMap('fire');
          return R(1, true, false, [
            'คุณใช้ ICE (น้ำแข็ง) ดับไฟ',
            'ในกองขี้เถ้ามี<b>อัญมณี</b>สะท้อนแสงวับวาว']);
        case 'fish':
          utils.removeItem('fish');
          utils.addItem('grilledfish');
          return R(0, true, true, [
            'คุณย่างปลา',
            'กลิ่นหอมน่ากินมาก']);
        case 'grilledfish':
          return R(0, true, true, [
            'ย่างพอแล้ว',
            'เดี๋ยวก็ไหม้หรอก']);
        case 'rod':
          return R(0, true, true, [
            'คุณพยายามตกของในกองไฟ แต่มันตกไม่ขึ้น']);
        default:
          return R(0, true, true, [
            'อย่าโยนของลงกองไฟสิ!']);
      }
    },
  };

  // b7: receptionist [+ money --> access to b8][(gone) --> money]
  map_data.b7 = {
    pid: 'b7', row: 1, col: 2,
    arrows: {'sw': 'b8', 'ne': 'b4'},
    hideArrows: {'feePaid': 'sw'},
    customColors: {'x': PURPLE, 'ne': PURPLE},
    mainNpc: 'receptionist',
  };

  npc_data.receptionist = {
    nid: 'receptionist', loc: 'b7',
    name: 'แผนกต้อนรับ',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    mapStates: {'midbossDefeated': 'map-receptionist-3',
      'moneyStolen': 'map-receptionist-4'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.midbossDefeated) {
            if (!flags.feePaid) {
              return R(0, true, true, [
                'ไพรสัณฑ์คลินิก<br>ยินดีต้อนรับค่ะ',
                'คลินิกเราอยู่ในโครงการ <b>30 บาทรักษา 1 โรค</b>นะคะ']);
            } else {
              return R(2, true, false, [
                'ไพรสัณฑ์คลินิก<br>ยินดีต้อนรับค่ะ',
                'เชิญพบคุณหมอที่ห้องตรวจได้เลยค่ะ']);
            }
          } else if (!flags.moneyStolen) {
            return R(3, true, false, [
              'ป้าย:<br>“พักเที่ยงค่ะ”',
              'บนโต๊ะมี<b>เงิน</b>อยู่']);
          } else {
            return R(4, false, false, [
              'ป้าย:<br>“พักเที่ยงค่ะ”']);
          }
        case 'action':
          if (!flags.midbossDefeated) {
            if (!flags.feePaid) {
              return R(1, true, true, [
                'ไม่ให้ค่ะ']);
            } else {
              return R(0, true, false, [
                'ทางเราไม่มีนโยบายคืนเงินค่ะ']);
            }
          } else {
            utils.addItem('money');
            flags.moneyStolen = 1;
            utils.refreshNpcOnMap('receptionist');
            return R(4, false, false, [
              'คุณ <b>“ยืม”</b> เงิน 30 บาท จากโต๊ะ']);
          }
        case 'money':
          utils.removeItem('money');
          flags.feePaid = 1;
          utils.showArrows();
          return R(2, true, false, [
            'เชิญพบคุณหมอที่ห้องตรวจได้เลยค่ะ']);
        case 'oil':
          return R(0, true, true, [
            'กรุณาชำระเงิน 30 บาทก่อนพบคุณหมอค่ะ']);
        default:
          return R(1, true, true, [
            'ไม่เอาค่ะ']);
      }
    },
  };

  // b8: nurse [+ oil --> ent kit]
  map_data.b8 = {
    pid: 'b8', row: 2, col: 1,
    arrows: {'ne': 'b7'},
    customColors: {'x': PURPLE, 'ne': PURPLE},
    mainNpc: 'nurse',
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
            return R(0, true, true, [
              'เชิญนั่งรอก่อนนะครับ',
              'ช่วงนี้เป็นอะไรไม่รู้ <b>หมอหายไปหมดเลย</b>']);
          } else {
            return R(1, true, false, [
              'สวัสดีครับอาจารย์']);
          }
        case 'action':
          return R(0, true, !flags.nurseHelped, [
            'เฮ้อ... ผมก็ไม่มีเงินเหมือนกัน',
            'พอไม่มีหมอ คลินิกเราก็ขาดทุน ...']);
        case 'oil':
          utils.addItem('entkit');
          flags.nurseHelped = 1;
          return R(1, true, false, [
            'อ้อ! คุณเป็นหมอ ENT ใหม่สินะครับ',
            'พอดีเลย นี่<b>ชุดตรวจหู</b>ครับอาจารย์']);
        default:
          return R(0, true, true, [
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

  // c2: blacksmith [+ sword + gem --> power sword]
  map_data.c2 = {
    pid: 'c2', row: 2, col: 7,
    arrows: {'nw': 'c1', 'e': 'c3'},
    mainNpc: 'blacksmith',
  };

  npc_data.blacksmith = {
    nid: 'blacksmith', loc: 'c2',
    name: 'ช่างตีเหล็ก',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    mapStates: {'swordGiven': 'map-blacksmith-1', 'gemGiven': 'map-blacksmith-2'},
    content: function (op, flags, utils) {
      let bpic = (() => {
        if (flags.swordGiven && !flags.gemGiven)
          return 1;
        if (!flags.swordGiven && flags.gemGiven)
          return 2;
        return 0;
      });
      switch (op) {
        case 'enter':
          if (!flags.crafted) {
            return R(bpic(), true, true, [
              'โย่! ยินดีต้อนรับสู่โรงตีเหล็กของข้า']);
          } else {
            return R(bpic(), false, false, [
              'เป็นงัย ดาบปราบมารของข้า ใช้ได้ดีมั้ย?']);
          }
        case 'action':
          return R(bpic(), true, true, [
            'ข้าไม่มีเงินให้',
            'แต่เอางี้ ข้าจะ<b>เสริมพลังอาวุธ</b>ให้เจ้าฟรีครั้งนึง']);
        case 'sword':
          utils.removeItem('sword');
          if (!flags.gemGiven) {
            flags.swordGiven = 1;
            utils.refreshNpcOnMap('blacksmith');
            return R(bpic(), true, true, [
              'โอ้! ดาบของเจ้าค่อนข้าง... กาก',
              'แต่ข้าเสริมพลังให้มันได้ ถ้ามีแหล่งพลังอย่าง<b>อัญมณีเวท</b>']);
          } else {
            delete flags.gemGiven;
            flags.crafted = 1;
            utils.refreshNpcOnMap('blacksmith');
            utils.addItem('powersword');
            return R(bpic(), false, false, [
              'โอ้! พอดีเลย',
              'ด้วยพลังอัญมณี<br><b>ดาบปราบมาร</b><br>เล่มนี้จะสยบมารได้ทุกระดับ!']);
          }
        case 'gem':
          utils.removeItem('gem');
          if (!flags.swordGiven) {
            flags.gemGiven = 1;
            utils.refreshNpcOnMap('blacksmith');
            return R(bpic(), true, true, [
              'โอ้! อัญมณีเวท ช่างงามยิ่งนัก',
              'ข้าสามารถใช้มันเสริมพลัง<b>อาวุธ</b>ได้']);
          } else {
            delete flags.swordGiven;
            flags.crafted = 1;
            utils.refreshNpcOnMap('blacksmith');
            utils.addItem('powersword');
            return R(bpic(), false, false, [
              'โอ้! พอดีเลย',
              'ด้วยพลังอัญมณี<br><b>ดาบปราบมาร</b><br>เล่มนี้จะสยบมารได้ทุกระดับ!']);
          }
        case 'oil':
        case 'ice':
          return R(bpic(), true, true, [
            'อืมม.. ตอนนี้ข้ายังไม่ต้องการผู้ช่วย']);
        case 'money':
          return R(bpic(), true, true, [
            'ไม่เป็นไรๆ',
            'ข้าจะเสริมพลังอาวุธให้เจ้า<b>ฟรี</b>ครั้งนึง']);
        case 'fish':
        case 'grilledfish':
        case 'key':
        case 'rod':
          return R(bpic(), true, true, [
            'อืมม..',
            itemNames[op] + 'ใช้เป็นอาวุธได้ก็จริง แต่ข้าเสริมพลังมันไม่เป็น']);
      }
    },
  };


  // c3:
  map_data.c3 = {
    pid: 'c3', row: 2, col: 9,
    arrows: {'w': 'c2', 'ne': 'c4', 'sw': 'c7', 'se': 'd1'},
    customColors: {'se': GRAY},
  };

  // c4: (hint for receptionist)
  map_data.c4 = {
    pid: 'c4', row: 1, col: 10,
    arrows: {'nw': 'c5', 'sw': 'c3'},
    mainNpc: 'restceptionist',
  };

  npc_data.restceptionist = {
    nid: 'restceptionist', loc: 'c4',
    name: 'คนต้อนรับ',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, true, false, [
            'อย่ากวนเดี๊ยน',
            'เดี๊ยนพักเที่ยงอยู่']);
        case 'action':
          return R(1, true, false, [
            'เออ! พูดถึงเงิน<br>เดี๊ยนลืมเงินไว้<b>บนโต๊ะ</b>',
            '... คงไม่มีใคร<br><b>ขโมย</b>หรอกมั้ง ...']);
      }
    },
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
    mainNpc: 'lake',
  };

  npc_data.lake = {
    nid: 'lake', loc: 'c6',
    nidAlias: 'fish',
    name: 'ทะเลสาบ',
    actionText: 'ทำไมรูปคุ้นๆ',
    itemText: USE,
    mapStates: {'lakeFished': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, true, true, [
            'มี<b>ปลา</b>ว่ายอยู่ในทะเลสาบ']);
        case 'action':
          return R(0, true, true, [
            'เออ ไอซ์ขี้เกียจวาดใหม่']);
        case 'rod':
          utils.addItem('fish');
          flags.lakeFished = 1;
          utils.refreshNpcOnMap('lake');
          return R(999, false, false, [
            'คุณตก<b>ปลา</b>ขึ้นมาจากทะเลสาบ']);
        case 'oil':
          return R(0, true, true, [
            'คุณพยายามจับปลาด้วยมือ แต่ปลาลื่นเกินไป']);
        default:
          return R(0, true, true, [
            'อย่าทิ้งของลงน้ำสิ!']);
      }
    },
  };

  // c7: 
  map_data.c7 = {
    pid: 'c7', row: 3, col: 8,
    arrows: {'w': 's', 'ne': 'c3', 'sw': 'c8'},
  };

  // c8:
  map_data.c8 = {
    pid: 'c8', row: 4, col: 7,
    arrows: {'ne': 'c7', 'sw': 'c9'},
  };

  // c9: sword in stone [+ oil --> sword]
  map_data.c9 = {
    pid: 'c9', row: 5, col: 6,
    arrows: {'ne': 'c8'},
    mainNpc: 'stone',
  };

  npc_data.stone = {
    nid: 'stone', loc: 'c9',
    name: 'ศิลา',
    actionText: 'ดึงดาบ',
    itemText: USE,
    mapStates: {'swordPulled': 'map-stone-2'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.stoneOiled) {
            return R(0, true, true, [
              'ก้อนศิลา',
              'มี<b>ดาบ</b>เสียบแน่นอยู่']);
          } else if (!flags.swordPulled) {
            return R(1, true, false, [
              'ก้อนศิลา',
              'น้ำมันหล่อลื่นทำให้<b>ดาบ</b>ดึงออกได้ง่าย']);
          } else {
            return R(2, false, false, [
              'ก้อนศิลา',
              'ไม่มีอะไรเสียบอยู่ เหมือนที่ศิลาปกติควรจะเป็น']);
          }
        case 'action':
          if (!flags.stoneOiled) {
            return R(0, true, true, [
              '<b>ฮึด! ฮึดดด!</b>',
              'ดาบเสียบแน่นมาก<br>ดึงไม่ออก']);
          } else {
            utils.addItem('sword');
            flags.swordPulled = 1;
            utils.refreshNpcOnMap('stone');
            return R(2, false, false, [
              'คุณดึงดาบออกมา',
              'แต่พอมองดูดีๆ แล้ว มันเป็นแค่<b>ดาบกากๆ</b>']);
          }
        case 'oil':
          flags.stoneOiled = 1;
          utils.deselectItems();
          return R(1, true, false, [
            'คุณใช้ OIL (น้ำมัน) หล่อลื่น',
            'ดาบน่าจะดึงออกได้ง่ายแล้ว']);
        default:
          return R(0, true, true, [
            'ใช้ยังงัยวะ?']);
      }
    },
  };


  // d1:
  map_data.d1 = {
    pid: 'd1', row: 3, col: 10,
    arrows: {'nw': 'c3', 'sw': 'd2'},
    customColors: {'x': BROWN},
  };

  // d2
  map_data.d2 = {
    pid: 'd2', row: 4, col: 9,
    arrows: {'ne': 'd1', 'sw': 'd3', 'se': 'd4'},
    customColors: {'x': BROWN, 'ne': BROWN, 'se': BROWN},
  };

  // d3: shackle [+ key --> ice]
  map_data.d3 = {
    pid: 'd3', row: 5, col: 8,
    arrows: {'ne': 'd2'},
    customColors: {'x': BROWN, 'ne': BROWN},
    mainNpc: 'shackle',
  };

  npc_data.shackle = {
    nid: 'shackle', loc: 'd3',
    name: 'ไอซ์',
    actionText: 'ขอตังหน่อย',
    itemText: x => (x === 'money' ? GIVE(x) : USE(x)),
    mapStates: {'iceEscaped': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, true, true, [
            '<b>ช่วยด้วย!</b>',
            'ไอซ์โดนจอมมารล่ามโซ่ไว้']);
        case 'action':
          return R(0, true, true, [
            'นี่ออยจะขอตังทุกคนเลยเหรอ?']);
        case 'key':
          utils.removeItem('key');
          utils.addItem('ice', 5);
          flags.iceEscaped = 1;
          utils.refreshNpcOnMap('shackle');
          return R(999, false, false, [
            '<b>อิสรภาพ!</b>',
            'ขอบใจออยมาก ไอซ์ขอตามออยไปด้วยละกันนะ']);
        case 'oil':
          return R(0, true, true, [
            'โซ่มันแน่นมาก ดึงเองไม่ออกหรอก',
            'คงต้องหา<b>กุญแจ</b>มาไข']);
        case 'money':
          return R(0, true, true, [
            'ไม่เป็นไร',
            'ไอซ์ไม่งกเหมือนออย']);
        case 'fish':
        case 'grilledfish':
          return R(0, true, true, [
            'ไม่เป็นไร',
            'ไอซ์ไม่หิว']);
        case 'sword':
          return R(0, true, true, [
            'ดาบกากๆ แบบนั้นตัดโซ่ไม่ขาดหรอก']);
        case 'rod':
          return R(0, true, true, [
            'จะมาตกปลากะพงเหรอจร๊ะ?']);
        default:
          return R(0, true, true, [
            'ใช้ยังงัยอะ?']);
      }
    },
  };

  // d4: boss [+ power sword --> (win)]
  map_data.d4 = {
    pid: 'd4', row: 5, col: 10,
    arrows: {'nw': 'd2'},
    customColors: {'x': BROWN},
    mainNpc: 'boss',
  };

  npc_data.boss = {
    nid: 'boss', loc: 'd4',
    name: 'จอมมารที่ชื่อว่าอนุทิ',
    actionText: 'หมอที่หายไป ฝึมือแก?',
    itemText: USE,
    mapStates: {'gameWon': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(0, true, true, [
            'ข้าคือ<b>จอมมาร</b>ผู้ครองป่านี้',
            'ข้าจะทำให้แพทย์ทุกคนต้องทุกข์ระทม <b>555+</b>']);
        case 'action':
          return R(0, true, true, [
            'ไอ้คลินิกอะไรนั่น<br>มันบังอาจต่อต้านข้า',
            'ข้าเลย <b>“จัดการ”</b> พวกมันซะ <b>555+</b>']);
        case 'powersword':
          utils.deselectItems();
          flags.gameWon = 1;
          utils.refreshNpcOnMap('boss');
          return R(1, false, false, [
            '<b>อ๊าก!! เป็นไปไม่ได้!!</b>',
            'แก... แกไปเอาดาบนั่นมาจากไหน <b>อ้ากกกก!!!</b>']);
        case 'sword':
          return R(0, true, true, [
            'ดาบกากๆ แบบนั้นทำอะไรข้าไม่ได้หรอก <b>555+</b>']);
        case 'gem':
          return R(0, true, true, [
            'อัญมณีเวทเฉยๆ ทำอะไรข้าไม่ได้หรอก <b>555+</b>']);
        case 'oil':
        case 'ice':
          return R(0, true, true, [
            'มนุษย์ธรรมดาอย่างเจ้า จะทำอะไรข้าได้ <b>555+</b>']);
        case 'money':
          return R(0, true, true, [
            'จะติดสินบนข้า แต่มีแค่ 30 บาท ข้าไม่รับหรอก <b>555+</b>']);
        case 'rod':
        case 'fish':
        case 'grilledfish':
        case 'key':
          return R(0, true, true, [
            'จะเอา' + itemNames[op] + 'มาตีข้างั้นเหรอ บ้าหรือเปล่า <b>555+</b>']);
      }
    },
  };

  // win screen
  // Don't persist the states
  let cakeState = 0, cakeEaten = {};

  npc_data.cake = {
    nid: 'cake', loc: 'd4',
    name: '',
    actionText: '',
    itemText: x => ((x === 'ice' || x === 'oil') ? GIVE(x) : USE(x)),
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          cakeState = 0;
          return R(cakeState, false, true, [
            '<b>สุขสันต์วันเกิด</b>',
            'ขอให้ออยมีความสุข ประสบความสำเร็จ มีสุขภาพดีนะครับ']);
        case 'powersword':
          if (cakeState === 0) {
            cakeState = 1;
            return R(cakeState, false, true, [
              'คุณใช้ดาบปราบมารตัดเค้ก',
              'ขี่ช้างจับตั๊กแตนจริงๆ']);
          } else {
            return R(cakeState, false, true, [
              'ตัดพอแล้วลูก',
              'เดี๋ยวเค้กก็เละหรอก']);
          }
        case 'oil':
        case 'ice':
          if (cakeState === 0) {
            return R(cakeState, false, true, [
              'เค้กก้อนใหญ่เกิน',
              'จะกินงัยเนี่ย']);
          } else if (cakeState === 1) {
            cakeEaten[op] = true;
            cakeState = 2;
            return R(cakeState, false, true, [
              'งั่มๆ อร่อยจัง']);
          } else if (cakeEaten[op]) {
            return R(cakeState, false, true, [
              itemNames[op] + ' อิ่มแล้วล่ะ',
              'อีกครึ่งนึงให้ ' + itemNames[op === 'oil' ? 'ice' : 'oil'] + ' เถอะ']);
          } else {
            cakeState = 3;
            return R(cakeState, false, false, [
              'งั่มๆ อร่อยจัง']);
          }
      }
    },
  };

  return [map_data, npc_data];

}();
