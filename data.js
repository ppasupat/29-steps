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
    key: 'กุญแจ',
    entkit: 'ชุดตรวจหู',
    sword: 'ดาบกากๆ',
    gem: 'อัญมณี',
    powersword: 'ดาบปราบมาร',
  };
  const GIVE = (x => 'ให้ <b>' + (itemNames[x] || '???') + '</b>');
  const USE = (x => 'ใช้ <b>' + (itemNames[x] || '???') + '</b>');

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
            'คุณใส่' + itemNames[op] + 'ในรูกุญแจ');
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
    mapStates: {'pondFished': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(null, false, true, [
            'มี<b>ปลา</b>ว่ายอยู่ในบ่อน้ำ']);
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
            'สวัสดี ' + itemNames[op],
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
    hideArrows: {'doorOpen': 'nw', 'midbossDefeated': 'e'},
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

  npc_data.fire = {
    nid: 'fire', loc: 'b6',
    name: 'กองไฟ',
    actionText: 'แหย่มือ',
    itemText: USE,
    mapStates: {'fireIced': 'iced'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.fireIced) {
            return R(null, true, true, [
              'กองไฟลุกโชติช่วง',
              'ในกองไฟเหมือน<b>มีอะไร</b>ประกายแสงอยู่']);
          } else if (!flags.gemPicked) {
            return R('iced', true, false, [
              'ไฟถูกดับแล้ว',
              'ในกองขี้เถ้ามี<b>อัญมณี</b>สะท้อนแสงวับวาว']);
          } else {
            return R('picked', false, false, [
              'ไฟถูกดับแล้ว',
              'ไม่มีอะไรอยู่ในกองขี้เถ้า']);
          }
        case 'action':
        case 'oil':
          if (!flags.fireIced) {
            return R(null, true, true, [
              '<b>โอ๊ย! ร้อนๆ!</b>',
              'คุณดึงมือออกทันควัน']);
          } else {
            utils.addItem('gem');
            flags.gemPicked = true;
            return R('picked', false, false, [
              'คุณเก็บอัญมณีขึ้นมา']);
          }
        case 'ice':
          utils.deselectItems();
          flags.fireIced = true;
          utils.refreshNpcOnMap('fire');
          return R('iced', true, false, [
            'คุณใช้ ICE (น้ำแข็ง) ดับไฟ',
            'ในกองขี้เถ้ามี<b>อัญมณี</b>สะท้อนแสงวับวาว']);
        default:
          return R(null, true, true, [
            'อย่าโยนของลงกองไฟสิ!']);
      }
    },
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
              'เชิญนั่งรอก่อนนะครับ',
              'ช่วงนี้เป็นอะไรไม่รู้ <b>หมอหายไปหมดเลย</b>']);
          } else {
            return R(null, true, false, [
              'สวัสดีครับหมอ']);
          }
        case 'action':
          return R('sad', true, !flags.nurseHelped, [
            'เฮ้อ... ผมก็ไม่มีเงินเหมือนกัน',
            'จู่ๆ คลินิกเราก็โดนตัดงบ ไม่รู้ทำไม']);
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

  // c2: blacksmith [+ sword + gem --> power sword]
  map_data.c2 = {
    pid: 'c2', row: 2, col: 7,
    arrows: {'nw': 'c1', 'e': 'c3'},
  };

  npc_data.blacksmith = {
    nid: 'blacksmith', loc: 'c2',
    name: 'ช่างตีเหล็ก',
    actionText: 'ขอตังหน่อย',
    itemText: GIVE,
    content: function (op, flags, utils) {
      let bpic = (() => {
        if (flags.swordGiven && !flags.gemGiven)
          return 'sword';
        if (!flags.swordGiven && flags.gemGiven)
          return 'gem';
        return null;
      });
      switch (op) {
        case 'enter':
          if (!flags.swordGiven || !flags.gemGiven) {
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
          flags.swordGiven = true;
          utils.removeItem('sword');
          if (!flags.gemGiven) {
            return R(bpic(), true, true, [
              'โอ้! ดาบของเจ้าค่อนข้าง... กาก',
              'แต่ข้าเสริมพลังให้มันได้ ถ้ามีแหล่งพลังอย่าง<b>อัญมณีเวท</b>']);
          } else {
            utils.addItem('powersword');
            return R('happy', false, false, [
              'โอ้! พอดีเลย',
              'ด้วยพลังอัญมณี<br><b>ดาบปราบมาร</b><br>เล่มนี้จะสยบมารได้ทุกระดับ!']);
          }
        case 'gem':
          flags.gemGiven = true;
          utils.removeItem('gem');
          if (!flags.swordGiven) {
            return R(bpic(), true, true, [
              'โอ้! อัญมณีเวท ช่างงามยิ่งนัก',
              'ข้าสามารถใช้มันเสริมพลัง<b>อาวุธ</b>ได้']);
          } else {
            utils.addItem('powersword');
            return R('happy', false, false, [
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
        case 'key':
        case 'rod':
          return R(bpic(), true, true, [
            'อืมม.. ขอโทษด้วย',
            itemNames[op] + 'ใช้เป็นอาวุธได้ก็จริง แต่ข้าเสริมพลังมันไม่เป็น']);
      }
    },
  };


  // c3:
  map_data.c3 = {
    pid: 'c3', row: 2, col: 9,
    arrows: {'w': 'c2', 'ne': 'c4', 'sw': 'c7', 'se': 'd1'},
  };

  // c4:
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

  npc_data.lake = {
    nid: 'lake', loc: 'c6',
    name: 'ทะเลสาบ',
    actionText: 'ทำไมรูปคุ้นๆ',
    itemText: USE,
    mapStates: {'lakeFished': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(null, true, true, [
            'มี<b>ปลา</b>ว่ายอยู่ในทะเลสาบ']);
        case 'action':
          return R(null, true, true, [
            'เออ ไอซ์ขี้เกียจวาดใหม่']);
        case 'rod':
          utils.addItem('fish');
          flags.lakeFished = true;
          utils.refreshNpcOnMap('lake');
          return R('fished', false, false, [
            'คุณตก<b>ปลา</b>ขึ้นมาจากทะเลสาบ']);
        case 'oil':
          return R(null, true, true, [
            'คุณพยายามจับปลาด้วยมือ แต่ปลาลื่นเกินไป']);
        default:
          return R(null, true, true, [
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
  };

  npc_data.stone = {
    nid: 'stone', loc: 'c9',
    name: 'ศิลา',
    actionText: 'ดึงดาบ',
    itemText: USE,
    mapStates: {'swordPulled': 'pulled'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          if (!flags.stoneOiled) {
            return R(null, true, true, [
              'ก้อนศิลาใหญ่',
              'มี<b>ดาบ</b>เสียบแน่นอยู่']);
          } else if (!flags.swordPulled) {
            return R('oiled', true, false, [
              'ก้อนศิลาใหญ่',
              'น้ำมันหล่อลื่นทำให้<b>ดาบ</b>ดึงออกได้ง่าย']);
          } else {
            return R('pulled', false, false, [
              'ก้อนศิลาใหญ่',
              'ไม่มีอะไรเสียบอยู่ เหมือนที่ศิลาปกติควรจะเป็น']);
          }
        case 'action':
          if (!flags.stoneOiled) {
            return R(null, true, true, [
              '<b>ฮึด! ฮึดดด!</b>',
              'ดาบเสียบแน่นมาก<br>ดึงไม่ออก']);
          } else {
            utils.addItem('sword');
            flags.swordPulled = true;
            utils.refreshNpcOnMap('stone');
            return R('pulled', false, false, [
              'คุณดึงดาบออกมา',
              'แต่พอมองดูดีๆ แล้ว มันเป็นแค่<b>ดาบกากๆ</b>']);
          }
        case 'oil':
          flags.stoneOiled = true;
          return R('iced', true, false, [
            'คุณใช้ OIL (น้ำมัน) หล่อลื่น',
            'ดาบน่าจะดึงออกได้ง่ายแล้ว']);
        default:
          return R(null, true, true, [
            'ใช้ยังงัยวะ?']);
      }
    },
  };


  // d1:
  map_data.d1 = {
    pid: 'd1', row: 3, col: 10,
    arrows: {'nw': 'c3', 'sw': 'd2'},
  };

  // d2
  map_data.d2 = {
    pid: 'd2', row: 4, col: 9,
    arrows: {'ne': 'd1', 'sw': 'd3', 'se': 'd4'},
  };

  // d3: shackle [+ key --> ice]
  map_data.d3 = {
    pid: 'd3', row: 5, col: 8,
    arrows: {'ne': 'd2'},
  };

  npc_data.shackle = {
    nid: 'shackle', loc: 'd3',
    name: 'ไอซ์',
    actionText: 'ขอตังหน่อย',
    itemText: USE,
    mapStates: {'iceEscaped': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(null, true, true, [
            '<b>ช่วยด้วย!</b>',
            'ไอซ์โดนจอมมารล่ามโซ่ไว้']);
        case 'action':
          return R('angry', true, true, [
            'นี่ออยจะขอตังทุกคนเลยเหรอ?']);
        case 'key':
          utils.removeItem('key');
          utils.addItem('ice', 5);
          flags.iceEscaped = true;
          utils.refreshNpcOnMap('shackle');
          return R('escaped', false, false, [
            '<b>อิสรภาพ!</b>',
            'ขอบใจออยมาก ไอซ์ขอตามออยไปด้วยละกันนะ']);
        case 'oil':
          return R(null, true, true, [
            'โซ่มันแน่นมาก ดึงเองไม่ออกหรอก',
            'คงต้องหา<b>กุญแจ</b>มาไข']);
        case 'money':
          return R(null, true, true, [
            'ไม่เป็นไร',
            'ไอซ์ไม่งกเหมือนออย']);
        case 'fish':
          return R(null, true, true, [
            'ไม่เป็นไร',
            'ไอซ์ไม่หิว']);
        case 'sword':
          return R(null, true, true, [
            'ดาบกากๆ แบบนั้นตัดโซ่ไม่ขาดหรอก']);
        case 'rod':
          return R(null, true, true, [
            'จะมาตกปลากะพงเหรอจร๊ะ?']);
        default:
          return R(null, true, true, [
            'ใช้ยังงัยอะ?']);
      }
    },
  };

  // d4: boss [+ power sword --> (win)]
  map_data.d4 = {
    pid: 'd4', row: 5, col: 10,
    arrows: {'nw': 'd2'},
  };

  npc_data.boss = {
    nid: 'boss', loc: 'd4',
    name: 'จอมมาร',
    actionText: 'หมอที่หายไป ฝึมือแก?',
    itemText: USE,
    mapStates: {'bossDefeated': 'gone'},
    content: function (op, flags, utils) {
      switch (op) {
        case 'enter':
          return R(null, true, true, [
            'ข้าคือ<b>จอมมาร</b>ผู้ครองป่านี้',
            'ข้าจะทำให้แพทย์ทุกคนต้องทุกข์ระทม <b>555+</b>']);
        case 'action':
          return R(null, true, true, [
            'ไอ้คลินิกไพรสัณฑ์อะไรนั่น มันบังอาจต่อต้านข้า',
            'ข้าเลย "จัดการ" พวกมันซะ <b>555+</b>']);
        case 'powersword':
          utils.deselectItems();
          flags.bossDefeated = true;
          utils.refreshNpcOnMap('boss');
          // TODO: Show the win scene
          return R(null, false, false, [
            '<b>อ๊าก!! เป็นไปไม่ได้!!</b>',
            'แก... แกไปเอาดาบนั่นมาจากไหน <b>อ้ากกกก!!!</b>']);
        case 'sword':
          return R(null, true, true, [
            'ดาบกากๆ แบบนั้นทำอะไรข้าไม่ได้หรอก <b>555+</b>']);
        case 'gem':
          return R(null, true, true, [
            'อัญมณีเวทเฉยๆ ทำอะไรข้าไม่ได้หรอก <b>555+</b>']);
        case 'oil':
        case 'ice':
          return R(null, true, true, [
            'มนุษย์ธรรมดาอย่างเจ้า จะทำอะไรข้าได้ <b>555+</b>']);
        case 'money':
          return R(null, true, true, [
            'จะติดสินบนข้า แต่มีแค่ 30 บาท ข้าไม่รับหรอก <b>555+</b>']);
        case 'rod':
        case 'fish':
        case 'key':
          return R(null, true, true, [
            'จะเอา' + itemNames[op] + 'มาตีข้างั้นเหรอ บ้าหรือเปล่า <b>555+</b>']);
      }
    },
  };

  return [map_data, npc_data];

}();
