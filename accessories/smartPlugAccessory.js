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
    getPowerOn(callback) {
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
            callback(null, binaryState);
        })
    }
    setPowerOn(powerOn, callback) {

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


    getServices() {
        let smartPlugService = new Service.Outlet(this.name);
        smartPlugService.getCharacteristic(Characteristic.On)
            .on('get', this.getPowerOn.bind(this))
            .on('set', this.setPowerOn.bind(this));
        return [smartPlugService];
    }

}
module.exports = SmartPlugAccessory
