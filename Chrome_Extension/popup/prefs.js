function get_saved_prefs(){
    chrome.storage.sync.get({'prefs': {target_roi: 0, min_profit: 0, ship_amz_rate: 0, sales_tax_rate: 0, other: 0}}, function (re) {
        let p = re.prefs
        //id('roi').value = p['target_roi']
        //id('profit').value = p['min_profit']
        id('ship_amz').value = p['ship_amz_rate']
        id('sales_tax').value = p['sales_tax_rate']
        id('addtl').value = p['other_fee']
        id('fba_fbm').checked = p['fba_fbm']
    })
    chrome.storage.sync.get({keepa: null}, function (result){
        id('key').value = result.keepa ?? ""
    })
}
get_saved_prefs()

function id(my_id){
    return document.getElementById(my_id)
}

function negOrNone(el){
    let val = el.value
    if (el.value < 0 || el.value == ""){
        val = 0
    }
    return val
}

function update_inputs() {
    //let roi = negOrNone(id('roi'))
    //let min_profit = negOrNone(id('profit'))
    let roi = 0
    let min_profit = 0
    let ship_amz = negOrNone(id("ship_amz"))
    let sales_tax = negOrNone(id('sales_tax'))
    let addtl = negOrNone(id('addtl'))
    let ship_method = id('fba_fbm').checked
    let keepa = id('key').value ?? ""
    let new_prefs = {target_roi: roi, min_profit: min_profit, ship_amz_rate: ship_amz, sales_tax_rate: sales_tax, other_fee: addtl, fba_fbm: ship_method}
    chrome.storage.sync.set({prefs: new_prefs})
    chrome.storage.sync.set({keepa: keepa})
}

var doneTypingInterval = 300;  //time in ms (.3 seconds)
var typingTimer;
document.body.onkeyup = function (e){
    let f = e.target
    clearTimeout(typingTimer);
    if (f.value) {
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
    function doneTyping(){
        update_inputs()
    }
}
id('fba_fbm').addEventListener("change",update_inputs)