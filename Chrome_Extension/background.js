importScripts('ExtPay.js') // or `import` / `require` if using a bundler

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

function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function (cookie) {
        if (callback) {
            callback(cookie.value);
        }
    });
}

const website = 'http://www.oa2gsheets.com/'

chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        console.log("TRIGGERED")
        getCookies(website, "fileID", function (id) {
            console.log(id);
            chrome.storage.sync.set({fileID: id}, function () {
                console.log('Value is set to ' + id);
            });
        });

        getCookies(website, "order", function (id) {
            console.log(id);
            chrome.storage.sync.set({order: id}, function () {
                console.log("Success adding order to sync!")
                console.log(id)
            })
        })

        getCookies(website, 'is_dynam', function (id) {
            console.log(id)
            chrome.storage.sync.set({is_dynam: id}, function () {
                console.log("Success adding is_dynam to sync!")
            })
        })
    }
);

const filter2 = {
    url: [
        {
            urlMatches: 'https://extensionpay.com/extension/oa2gsheets-lifetime/paid',
        },
    ],
};

chrome.webNavigation.onCompleted.addListener(() => {
    chrome.storage.sync.get(['oa_email'], function (result) {
        getCookies(website, "visited_l", function(id) {
            if (id !== "true") {
                let encode_email = encodeURIComponent(result.oa_email)
                let thanks_url = "https://www.oa2gsheets.com/thanks_lifetime?mail=" + encode_email
                chrome.tabs.create({url: thanks_url});
            }
        })
    })
}, filter2)

const filter3 = {
    url: [
        {
            urlMatches: 'https://extensionpay.com/extension/oa2gsheets/subscribed',
        },
    ],
}

chrome.webNavigation.onCompleted.addListener(() => {
    chrome.storage.sync.get(['oa_email'], function (result) {
        getCookies(website, "visited", function(id) {
            if (id !== "true") {
                let encode_email = encodeURIComponent(result.oa_email)
                let thanks_url = "https://www.oa2gsheets.com/thank_you?mail=" + encode_email
                chrome.tabs.create({url: thanks_url});
            }
        })
    })
}, filter3)

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
                    const days_7 = 1000*60*60*24*7 // in milliseconds
                    let send;
                    if (user.paid) {
                        send = "true"
                    }
                    else if (user.trialStartedAt && (now - user.trialStartedAt) < days_7){
                        send = "true"
                    }
                    else {
                        send = "false"
                    }
                    sendResponse(send)
                })
            });
        }
        if (request === "monthly_activated"){
                console.log("received message")
                var extpay = ExtPay('oa2gsheets');
                extpay.startBackground();
                sendResponse("monthly started")

        }
        if (request === "lifetime_activated"){
            console.log("received message")
            var extpay = ExtPay('oa2gsheets-lifetime')
            extpay.startBackground();
            sendResponse("lifetime activated")
        }
        return true;
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
