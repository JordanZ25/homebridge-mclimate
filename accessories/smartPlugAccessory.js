class SmartPlugAccessory{
	constructor(log, config){
	this.log = log;
    this.name = config["name"];
    this.plugName = config["plug_name"] || this.name; // fallback to "name" if you didn't specify an exact "bulb_name"
    // this.binaryState = 0; // bulb state, default is OFF
    this.log("Starting a smart plug device with name '" + this.plugName + "'...");
    this.serial_number = config['serial_number'];
    this.access_token = config['access_token'];

	}


	getServices () {
    var smartPlugService = new Service.Outlet(this.name);
    smartPlugService.getCharacteristic(Characteristic.On).on('get', this.getPowerOn.bind(this)).on('set', this.setPowerOn.bind(this));
    return [smartPlugService];
}

}