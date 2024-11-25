const common = require('./common');
if (common.config.use_mac_in_mqtt_topic) {
    common.mac = '_' + require('os').networkInterfaces().wlan0[0].mac.replace(/:/g,'').toUpperCase();
    common.config.mqtt_topic = common.config.mqtt_topic + common.mac;
}
common.config.mqtt_options.clientId = 'mqtt_js_' + Math.random().toString(16).substr(2, 8);
common.config.mqtt_options.will.topic = common.config.mqtt_topic + '/state';

const gateway = require('./gateway');
const mqtt = require('./mqtt_client');

if (common.config.sound_volume != 0) {
    gateway.setVolume(common.config.sound_volume);
}

// Démarrer la minuterie 1 pour la luminosité
setInterval(() => {
    gateway.getIlluminance(common.config.sensor_treshhold);
}, 1 * 1000);

// Démarrage la minuterie 2 pour publier les états des capteurs
let timer_ID = setTimeout( function tick() {
    common.myLog('timer 2: Publish sensor values', common.colors.cyan);

    // Envoi des états de l'appareil
    gateway.getState();

    timer_ID = setTimeout(tick, common.config.sensor_debounce_period * 1000);
}, common.config.sensor_debounce_period * 1000);