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
cd lumi-fr
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
node /opt/lumi-fr/lumi.js
```

We check that the data from the sensors has gone and add to autorun: 

```
cd /opt/lumi-fr
chmod +x lumi
cp lumi /etc/init.d/lumi
/etc/init.d/lumi enable
/etc/init.d/lumi start
```

---

### Update to the latest version: 

```
/etc/init.d/lumi stop
cd /opt/lumi-fr
git pull
/etc/init.d/lumi start
```

---

### Comand Samples:

Топик | Значение | Описание
---|---|---
lumi/light/set | {"state":"ON"} | Turn on backlight 
lumi/light/set | {"state":"ON", "color":{"r":50,"g":50,"b":50}} | Turn on highlight with specified color
lumi/light/set | {"state":"ON", "colorhex":"#00AA00"} | Turn on highlight with specified hexadecimal color
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
- add hex color :)


### Troubleshoot

#### MDP

Sometime, MPD-MPC does not work properly. When you run this
```bash
mpc current --format '%name% - %artist% - %title%'
```
```txt
MPD error: Connection refused
```
and
```bash
/etc/init.d/mpd start
```
gaves you
```txt
mkdir: can't create directory '': No such file or directory
BusyBox v1.36.1 (2024-09-23 12:34:46 UTC) multi-call binary.

Usage: chown [-Rh]... USER[:[GRP]] FILE...

Change the owner and/or group of FILEs to USER and/or GRP

        -h      Affect symlinks instead of symlink targets
        -R      Recurse
```
if you cat process run:
```txt
#!/bin/sh /etc/rc.common
# Copyright (C) 2007-2014 OpenWrt.org

START=93

USE_PROCD=1

PROG=/usr/bin/mpd
CONFIGFILE=/etc/mpd.conf
NICEPRIO=-10

USER="mpd"
GROUP="mpd"

#TODO: Add uci config - nice, config

start_service() {
        local pld lport

        #create mpd directories from config
        pld=$(grep ^playlist_directory "$CONFIGFILE" | cut -d "\"" -f 2 | sed "s/~/\/root/g")
        if [ ! -d "$pld" ]; then
                mkdir -m 0755 -p "$pld"
                chown $USER:$GROUP $pld
        fi

        lport=$(grep ^port "$CONFIGFILE" | cut -d "\"" -f 2)
        [ -z "$lport" ] && lport=6600

        procd_open_instance
        procd_add_mdns "mpd" "tcp" "$lport"
        procd_set_param command "$PROG" --no-daemon "$CONFIGFILE"
        procd_set_param user "$USER"
        procd_set_param group "$GROUP"
        procd_set_param stderr 1
        # Give MPD some real-time priority
        procd_set_param nice "$NICEPRIO"
        procd_close_instance
}
```
Base on error return the line $(grep ^playlist_directory "$CONFIGFILE" | cut -d "\"" -f 2 | sed "s/~/\/root/g") is the problem.
By the way, let's check audio_output

```bash
 aplay -l
```
```txt
**** List of PLAYBACK Hardware Devices ****
card 0: tfa9882audio [tfa9882-audio], device 0: 2028000.sai-tfa9882-hifi tfa9882-hifi-0 [2028000.sai-tfa9882-hifi tfa9882-hifi-0]
  Subdevices: 1/1
  Subdevice #0: subdevice #0
```
Let's stop update param and create  folder
```bash
/etc/init.d/mpd stop
mkdir "/usr/share/playlist"
vi /etc/mdp.conf
```
and set conf :)
```conf
playlist_directory		"/usr/share/playlist"
user				"mpd"
group				"audio"
audio_output {
        type            "alsa"
        name            "My ALSA Device"
        device          "hw:0,0"        # optional found in 'aplay -l' return
        format          "44100:16:2"    # optional
        mixer_device    "default"       # optional
        mixer_control   "PCM"           # optional
        mixer_index     "0"             # optional
}
```
Check all stuff
```bash
/etc/init.d/mpd start
mpc current --format '%name% - %artist% - %title%'
/etc/init.d/lumi start
```
\o/ No error

#### MQTT
Well try to connect to our Lumi with MQTT_explorer is a good way to check.