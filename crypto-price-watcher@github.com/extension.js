// Autor : Sébastien Duruz
// Date : 19.06.2021
// Description : A simple gnome extension to check bitcoin / ethereum price.


const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Glib = imports.gi.GLib;


let panelBitcoin, panelEthereum, labelBitcoin, labelEthereum, timeout;

// Get Price of BTC / ETH from coingecko V3 api
function getPricesDatas () {

    // Get bitcoin price and extract price from the string
    let [ok, out, err, exit] = Glib.spawn_command_line_sync('curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"');
    let rawPrice = out.toString().split(':')[2];
    let extractedPrice = rawPrice.substring(0, rawPrice.length - 2);
    
    // Set bitcoin price to label
    labelBitcoin.set_text( "BTC/USD: " + extractedPrice + "$" );

    // Get ethereum price and extract price from the string
    [ok, out, err, exit] = Glib.spawn_command_line_sync('curl "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=USD"');
    rawPrice = out.toString().split(':')[2];
    extractedPrice = rawPrice.substring(0, rawPrice.length - 2);

    // Set ethereum price to label
    labelEthereum.set_text( "ETH/USD : " + extractedPrice + "$" );

    return true;
}

function init () {
    
    // Create the necessary objects
    panelBitcoin = new St.Bin({
        style_class : "panel-button"
    });
    labelBitcoin = new St.Label({
        style_class : "priceLabel",
    });
    panelEthereum = new St.Bin({
        style_class : "panel-button"
    });
    labelEthereum = new St.Label({
        style_class : "priceLabel",
    })

    // Add the labels to parents
    panelBitcoin.set_child(labelBitcoin);
    panelEthereum.set_child(labelEthereum);
}


function enable () {

    // Insert the objects to center box
    Main.panel._centerBox.insert_child_at_index(panelBitcoin, 1);
    Main.panel._centerBox.insert_child_at_index(panelEthereum, 2);
    
    // Exec the function at start
    getPricesDatas();

    // Add the function to loop
    timeout = Mainloop.timeout_add_seconds(30.0, getPricesDatas);
}


function disable () {

    // Remove the function from loop
    Mainloop.source_remove(timeout);

    // Remove the objects from center box
    Main.panel._centerBox.remove_child(panelBitcoin);
    Main.panel._centerBox.remove_child(panelEthereum);
}