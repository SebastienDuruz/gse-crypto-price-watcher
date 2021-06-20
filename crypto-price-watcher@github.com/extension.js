// Autor : Sébastien Duruz
// Date : 19.06.2021
// Description : A simple gnome extension to check bitcoin / ethereum price.

const Main = imports.ui.main;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Mainloop = imports.mainloop;
const Glib = imports.gi.GLib;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const ByteArray = imports.byteArray;

let panelButton, priceLabel, timeout, priceTimer, myPopup;

/*
* Get the settings from schema
*/
function getSettings(){

    let GioSSS = Gio.SettingsSchemaSource;
    let schemaSource = GioSSS.new_from_directory(
        Me.dir.get_child("schemas").get_path(),
        GioSSS.get_default(),
        false
    );
    let schemaObj = schemaSource.lookup('org.gnome.shell.extensions.crypto-price-watcher', true);

    // The schema cannot be found
    if(!schemaObj){
        throw new Error("The schema [org.gnome.shell.extensions.crypto-price-watcher] cannot be found.");
    }

    return new Gio.Settings({ settings_schema : schemaObj });
}

/*
* Get price data for Bitcoin and Ethereum from CoinGecko api V3
*/
function getPricesDatas () {

    let priceLabelText = "";
    let coins = [
        ['bitcoin', 'BTC'], 
        ['ethereum', 'ETH']
    ];

    // Check all the coins
    coins.forEach(getCoinPrice);

    /*
    * Get the price of the current coin
    */
    function getCoinPrice(item, index){

        // Get the price of the current item
        let [ok, out, err, exit] = Glib.spawn_command_line_sync("curl \"https://api.coingecko.com/api/v3/simple/price?ids=\"" + item[0] + "\"&vs_currencies=usd\"");
        
        // Extract the price from the returned results of the command
        let rawPrice = ByteArray.toString(out).split(':')[2];
        
        // Check if a price as been get
        if(rawPrice != undefined)
        {
            let extractedPrice = rawPrice.substring(0, rawPrice.length - 2);
        
            // Set price to label
            priceLabelText += item[1] + "/USD: " + extractedPrice + "$ ";
        }
        else
        {
            priceLabelText += item[1] + "/USD: ERROR ";
        }
    }

    // Set the new text to the label
    priceLabel.set_text(priceLabelText);

    return true;
}

/*
* Intiation of the extension
*/
function init () {

    log(`initializing ${Me.metadata.name}`);
    
    // Get the settings from shema
    let settings = getSettings();

    // Get the price timer from settings object
    priceTimer = settings.get_int('timeout').toString();

    // Create the necessary objects
    panelButton = new St.Bin({
        style_class : "panel-button",
        reactive : true,
        track_hover : true
    });
    priceLabel = new St.Label({
        style_class : "priceLabel",
    });

    // Add the label to parent
    panelButton.set_child(priceLabel);
}

/*
* Occured each time the extension is enabled
*/
function enable () {

    log(`enabling ${Me.metadata.name}`);

    // Insert the objects to rightBox box
    Main.panel._rightBox.insert_child_at_index(panelButton, 0);

    // Exec the function at start
    getPricesDatas();

    // Add the function to loop
    timeout = Mainloop.timeout_add_seconds(priceTimer, getPricesDatas);
}

/*
* Occured each time the extension is disabled
*/
function disable () {

    log(`disabling ${Me.metadata.name}`);

    // Remove the function from loop
    Mainloop.source_remove(timeout);

    // Remove the objects from center box
    Main.panel._rightBox.remove_child(panelButton);
}