console.log("working")
function getASIN(url) {
    var urlArray = url.split('/')

    function getURLSlice(url2) {
        for (let each in url2) {
            if (urlArray[each] === "dp" || urlArray[each] === "gp") {
                var nextSlice = Number(each) + 1
                if (urlArray[nextSlice].length !== 10){
                    nextSlice = Number(each) + 2
                }
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
        "www.amazon.com.mx" : "11"
    }
    console.log(host_dict[host_name])
    return host_dict[host_name]
}

function main () {
    fetch(chrome.runtime.getURL('/amz.html')).then(r => r.text()).then(html => {
        var url1 = document.location.href
        let title = document.getElementById('title_feature_div')
        title.insertAdjacentHTML('afterend', html);
        chrome.storage.sync.get({spreadsheets: null}, function (re){
            if (re.spreadsheets === null) {
                chrome.storage.sync.get(['fileID'], function (result) {
                    const fileID = result.fileID
                    chrome.storage.sync.get(['is_dynam'], function (result) {
                        const is_dynam = result.is_dynam
                        chrome.storage.sync.get(['order'], function (result) {
                            let asin = getASIN(url1)
                            let domain_id = get_domain_id()
                            const my_order = result.order
                            let source = "https://www.oa2gsheets.com/input?fileID=" + fileID + "&o=" + my_order + "&asin=" + asin + "&dy=" + is_dynam + "&d_id=" + domain_id
                            let frame1 = document.getElementById("input_oa2gsheets")
                            frame1.setAttribute("src", source)
                        });
                    });
                });
            }
            else {
                let s = re.spreadsheets
                var fileID; var my_order; var asin; var is_dynam; var domain_id
                for (let each of s){
                    if (each.def == true){
                        console.log(each)
                        is_dynam = each.is_dynam
                        fileID = each.file_id
                        my_order = each.order
                        asin = getASIN(url1)
                        domain_id = get_domain_id()
                    }
                }
                let source = "https://www.oa2gsheets.com/test/input_test?fileID=" + fileID + "&o=" + my_order + "&asin=" + asin + "&dy=" + is_dynam + "&d_id=" + domain_id
                let frame1 = document.getElementById("input_oa2gsheets")
                frame1.setAttribute("src", source)
            }
        })

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
