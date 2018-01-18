var tessel = require('tessel');
var relaylib = require('relay-mono');
var rfidlib = require('rfid-pn532');

var relay = relaylib.use(tessel.port['C']); 
var rfid = rfidlib.use(tessel.port['A']); 

var permissionList = 
[  
  '3c554200',
  '40613d57',
  '90ebacfc'
];

var relayRemainTime = 1000;

function clockwiseSpin()
{
  relay.toggle(1, function toggleOneResult(err) {     
    if (err) console.log("Err toggling 1", err);
  });
};

function counterclockwiseSpin()
{
  relay.toggle(2, function toggleOneResult(err) {     
    if (err) console.log("Err toggling 2", err);
  });
};

function securityCheck(UID)
{
  for (var i=0; i<permissionList.length; i++)
     if (permissionList[i] == UID) return true;
  return false;
};

rfid.on('ready', function (version) {
  console.log('Ready to read RFID card\n');
  var count = 1;
  rfid.on('data', function(card) {
    var UID = card.uid.toString('hex');
    console.log('UID:', UID);
    if (securityCheck(UID)) {   
      console.log('Security Check Succeed!');    
      if (count%2) {
        console.log('Lock the door!');
        clockwiseSpin();
        setTimeout(clockwiseSpin, relayRemainTime);
      }
      else {   
        console.log('Unlock the door!');
        counterclockwiseSpin();
        setTimeout(counterclockwiseSpin, relayRemainTime);
      }
      count++;
    }
    else console.log('Security Check Fail!');
  });
});

relay.on('latch', function(channel, value) {
  if (value == true)  console.log('Relay channel ' + channel + ' ON!');
  else                console.log('Relay channel ' + channel + ' OFF!\n');  
});

rfid.on('error', function (err) {
  console.error(err);
});

relay.on('error', function (err) {
  console.error(err);
});
