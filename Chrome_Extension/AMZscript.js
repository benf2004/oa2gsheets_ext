console.log("working")
function getASIN(url) {
    var urlArray = url.split('/')

    function getURLSlice(url2) {
        for (let each in url2) {
            if (urlArray[each] === "dp") {
                var nextSlice = Number(each) + 1
            }
        }
        return nextSlice
    }

    let nextSlice = getURLSlice(urlArray)
    let asinChunk = urlArray[nextSlice]
    let asin = asinChunk.slice(0, 10)
    console.log(asin)
    return asin
}

function get_domain_id() {
    let host_name = location.hostname
    console.log(host_name)
    let host_dict = {
        "www.amazon.com" : "1",
        "www.amazon.co.uk" : "2",
        "www.amazon.de" : "3",
        "www.amazon.fr" : "4",
        "www.amazon.co.jp" : "5",
        "www.amazon.ca" : "6",
        "www.amazon.it" : "8",
        "www.amazon.es" : "9",
        "www.amazon.in" : "10",
        "www.amazon.com.mx" : "1"
    }
    console.log(host_dict[host_name])
    return host_dict[host_name]
}

function main () {
    fetch(chrome.runtime.getURL('/amz.html')).then(r => r.text()).then(html => {
        var url1 = document.location.href
        let title = document.getElementById('title_feature_div')
        title.insertAdjacentHTML('afterend', html);
        chrome.storage.sync.get(['fileID'], function (result) {
            const fileID = result.fileID
            console.log(fileID)
            chrome.storage.sync.get(['is_dynam'], function (result) {
                const is_dynam = result.is_dynam
                console.log(is_dynam)
                console.log(typeof is_dynam)
                chrome.storage.sync.get(['order'], function (result) {
                    let asin = getASIN(url1)
                    console.log(result)
                    let domain_id = get_domain_id()
                    const my_order = result.order
                    console.log(my_order)
                    let source = "https://www.oa2gsheets.com/input?fileID=" + fileID + "&o=" + my_order + "&asin=" + asin + "&dy=" + is_dynam + "&d_id=" + domain_id
                    console.log("source is" + source)
                    let frame1 = document.getElementById("input_oa2gsheets")
                    frame1.setAttribute("src", source)
                });
            });
        });
    });
}


chrome.runtime.sendMessage('is_paid', function (response) {
        let is_paid = response;
        console.log(is_paid)
        if (is_paid === "true") {
            console.log("PAID")
            main()
        }
        else {
            console.log("UNPAID")
        }
    });

// updates window when user switches variation
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // listen for messages sent from background.js
        if (request.message === 'url_change') {
            console.log("URL CHANGED")
            document.getElementById("div1_oa2gsheets").remove()
            main()
        }
    });
