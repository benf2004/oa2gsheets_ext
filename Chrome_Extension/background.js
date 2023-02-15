importScripts('content_scripts/ExtPay.js') // or `import` / `require` if using a bundler

chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
        if (changeInfo.url) {
            chrome.tabs.sendMessage( tabId, {
                message: 'url_change',
                url: changeInfo.url
            })
        }
    }
);

chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "update_order") {
            chrome.storage.sync.get(["spreadsheets"], function (re) {
                let s_l = re.spreadsheets
                let s = s_l[request.index]
                s.file_id = request.fileID
                s.order = request.order
                s.is_dynam = request.is_dynam
                chrome.storage.sync.set({spreadsheets: s_l})
            })
        }
        if (request.message === "id"){
            chrome.identity.getAuthToken({interactive: true}, function (token) {
                sendResponse({token: token})
            });
        }
        if (request.message === "get_spreadsheets") {
            chrome.storage.sync.get(["spreadsheets"], function (re) {
                let s_l = re.spreadsheets
                sendResponse(s_l)
            })
        }
        if (request.message === "get_prefs") {
            chrome.storage.sync.get({['prefs']: {target_roi: 0, min_profit: 0, ship_amz_rate: 0, sales_tax_rate: 0, other: 0}}, function (re) {
                let my_prefs = re.prefs
                sendResponse(my_prefs)
            })
        }
        if (request.message === "set_prefs") {
            let new_prefs = request.prefs
            chrome.storage.sync.set({prefs: new_prefs})
        }
    }
);


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("RECIEVED MESSAGE:")
        console.log(request)
        if (request === "is_paid") {
            chrome.storage.sync.get(['oa_plan'], function(result) {
                let plan = result.oa_plan
                const extpay = ExtPay(plan)
                extpay.getUser().then(user => {
                    console.log("MESSAGE RECIEVED")
                    const now = new Date();
                    const days_14 = 1000*60*60*24*14 // in milliseconds
                    let send;
                    if (user.paid) {
                        send = "true"
                    }
                    else if (user.trialStartedAt && (now - user.trialStartedAt) < days_14){
                        send = "true"
                    }
                    else {
                        send = "false"
                    }
                    sendResponse(send)
                })
            });
        }
        if (request === "id"){
            chrome.identity.getAuthToken({interactive: true}, function (token,scopes) {
                sendResponse({token: token, scopes: scopes})
            });
        }
        if (request === "monthly_activated"){
                console.log("received message")
                var extpay = ExtPay('oa2gsheets');
                extpay.startBackground();
                sendResponse("monthly started")

        }
        if (request === "lifetime_activated") {
            console.log("received message")
            var extpay = ExtPay('oa2gsheets-lifetime')
            extpay.startBackground();
            sendResponse("lifetime activated")
        }
        return true;
    }
);

async function validKey(key){
    console.log(key)
    if (key === null) {
        return false;
    }
    let response = await fetch(`https://api.keepa.com/token?key=${key}`)
    let data = await response.json()
    return data.tokensLeft !== 0
}

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        if (request?.message === "validKey"){
            let key = request.key
            let valid = await validKey(key)
            sendResponse({valid: valid})
        }
    }
);

chrome.storage.sync.get(['oa_plan'], function result() {
    let extpay = ExtPay(result.oa_plan)
    extpay.onPaid.addListener(user => {
        console.log('user paid!')
        chrome.storage.sync.get(['oa_email'], function (result) {
            let encode_email = encodeURIComponent(result.oa_email)
            let thanks_url = "https://www.oa2gsheets.com/mail?=" + encode_email
            chrome.tabs.create({url: thanks_url});
        })
    })
})

