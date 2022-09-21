# Lumi MQTT

MQTT publish for Xiaomi DGNWG05LM (Light/Sound/Illuminance) + Jeedom Templates 
Made for [OpenWRT](https://github.com/openlumi/xiaomi-gateway-openwrt).
Allows you to interact with the gateway via MQTT.
Based on https://github.com/Beetle-II/lumi

Interaction | MQTT topic, получение | MQTT topic, gestion
--- | --- | ---
Light Sensor | lumi/illumination
Led Ring | lumi/lamp | lumi/lamp/set
Alamr Mode |  | lumi/alarm/set
Button | lumi/button/action
Read Sound /URL and volume | lumi/audio/play | lumi/audio/play/set
Volume Only | lumi/audio/volume | lumi/audio/volume/set
Speak |  | lumi/say/set

[Comand Samples](#Comand-Samples)

---
Questions and discussion - https://t.me/lumi_mqtt

---
Node.js, git, mpc packages are required to download and work

Installing them: 

```
opkg update && opkg install node git-http mpg123 mpc mpd-full
```

Download lumi: 

```
mkdir /opt
cd /opt
git clone https://github.com/Ch-Philou/lumi-fr.git
cd lumi
cp config_example.json config.json
```

Change the configuration file config.json Specify the address of your server, login and password 

```json
{
  "sensor_debounce_period": 300,
  "sensor_treshhold": 50,
  "button_click_duration": 300,
          
  "homeassistant": true,
  "tts_cache": true,
  "sound_channel": "Master",
  "sound_volume": 50,
  "mqtt_url": "mqtt://<MQTT Broker's IP>",
  "mqtt_topic": "lumi",
  "use_mac_in_mqtt_topic": false,
  "mqtt_options": {
    "port": 1883,
    "username": "username",
    "password": "password",
    "keepalive": 60,
    "reconnectPeriod": 1000,
    "clean": true,
    "encoding": "utf8",
    "will": {
      "topic": "lumi/state",
      "payload": "offline",
      "qos": 1,
      "retain": true
    }
  }
}
```

Parameter | Description
--- | ---
"homeassistant": true | Notify the MQTT broker about gateway devices. Helps to add devices to HomeAssistant
||
"tts_cache": true | cache Text To Speech files after playback 
||
"sound_channel": "Master" | audio output channel 
"sound_volume": 50 | default volume 
||
"sensor_debounce_period": 300 | period for sending device status data (in seconds) 
"sensor_treshhold": 50 | sensor state change threshold, for instant data sending 
"button_click_duration": 300 | time in ms between button clicks. 
||
"use_mac_in_mqtt_topic": true | add gateway MAC to MQTT topics 

Running:

```
node /opt/lumi/lumi.js
```

We check that the data from the sensors has gone and add to autorun: 

```
cd /opt/lumi
chmod +x lumi
cp lumi /etc/init.d/lumi
/etc/init.d/lumi enable
/etc/init.d/lumi start
```

---

### Update to the latest version: 

```
/etc/init.d/lumi stop
cd /opt/lumi
git pull
/etc/init.d/lumi start
```

---

### Comand Samples:

Топик | Значение | Описание
---|---|---
lumi/light/set | {"state":"ON"} | Turn on backlight 
lumi/light/set | {"state":"ON", "color":{"r":50,"g":50,"b":50}} | Turn on highlight with specified color
lumi/light/set | {"state":"ON", "timeout": 30} | Turn on the backlight and turn it off after the specified time (sec) 
lumi/light/set | {"state":"OFF"} | Turn off backlight 
||
lumi/audio/play/set | {"url": "http://ep128.hostingradio.ru:8030/ep128"} | Enable Radio Europe+ 
lumi/audio/play/set | {"url": ""/tmp/test.mp3"} | Play local sound file 
lumi/audio/play/set | {"url": "https://air.radiorecord.ru:805/rr_320", "volume": 50} | Enable Radio Europe+  and set volume
lumi/audio/play/set | {"url": "STOP"} | Turn off playback 
||
lumi/audio/volume/set | 30 | Change volume to 30 
||
lumi/say/set | {"text": "Hello", "lang": "en", "volume": 80} | SAy Hello and set volume 80
lumi/alarm/set | {"state":"ON"} | Enable blinking lamp 
lumi/alarm/set | {"state":"ON", "color":{"r":50,"g":50,"b":50}} | Enable blinking of the lamp in the specified color 
lumi/alarm/set | {"state":"ON", "time": 1} | Turn on the flashing lamp with a frequency of 1 second 
lumi/alarm/set | {"state":"ON", "count": 5} | Turn on the flashing lamp 5 times, then turn it off 
lumi/alarm/set | {"state":"OFF"} | Turn off flashing lamp 


### Why a Fork:
- Set language to english
- Fix an issue (when settin alarm state was erased by a valu wich broke status)
- Add A Jeedom Template for easy integration