const axios = require('../utils/apiClient.js');
class SmartPlugAccessory {

    constructor(log, config) {
        this.log = log;
        this.name = config["name"];
        this.plugName = config["plug_name"] || this.name; // fallback to "name" if you didn't specify an exact "bulb_name"
        // this.binaryState = 0; // bulb state, default is OFF
        this.log("Starting a smart plug device with name '" + this.plugName + "'...");
        this.serial_number = config['serial_number'];
        this.access_token = config['access_token'];
        this.apiClient = (new axios(this.access_token, this.refresh_token)).instance


    }

    getServices() {
        let smartPlugService = new Service.Outlet(this.name);

        let getPowerOn = (callback) => {
            var plugName = this.plugName
            this.apiClient.get("controllers/" + this.serial_number, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.access_token
                }
            }).then(function (response) {
                var controller = response.data.controller;
                var relay_state = controller.relay_state;
                var binaryState = relay_state ? 1 : 0;
                var state = relay_state ? 'on' : 'off';
                // console.log("Power state for the '%s' is %s", plugName, state);
                callback(null, binaryState);
            })
        }
        let setPowerOn = (powerOn, callback) => {

            // console.log(powerOn);
            // this.binaryState = powerOn ? 'on' : 'off'; 
            var state = powerOn ? 'on' : 'off';
            var plugName = this.plugName
            callback(null);
            this.apiClient.post("provider/send", {
                "serial_number": this.serial_number,
                "command": "switch_on_off",
                "state": state
            }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.access_token
                    }
                }).then(function (response) {
                    console.log("Set power state on the '%s' to %s", plugName, state);
                })
        }

        smartPlugService.getCharacteristic(Characteristic.On)
            .on('get', getPowerOn)
            .on('set', setPowerOn);
        return [smartPlugService];
    }

}
module.exports = SmartPlugAccessory
