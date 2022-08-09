function open_picker(r_num){
    chrome.storage.sync.get(["spreadsheets"], function(r){
        let s_list = r.spreadsheets
        let i_num = r_num - 1
        let s = s_list[i_num]
        window.open("https://www.oa2gsheets.com/picker?order=" + s.order+ "&index_num=" + i_num +"&f_id=" + s.file_id, "_blank")
    })
}

function add_config() {
    var t = document.getElementById("table")
    var r = t.insertRow()
    var c1 = r.insertCell(0)
    c1.innerHTML = "<input id='input' class='form-control form-control-sm' placeholder='Name'>"
    var c2 = r.insertCell(1)
    c2.innerHTML = "<button class='manage btn btn-sm btn-outline-primary'>Setup</button>"
    var c3 = r.insertCell(2)
    c3.innerHTML = "<div class=\"form-check\"> <input class=\"form-check-input rad\" type=\"radio\" name=\"radio\"> </div>"
    var c4 = r.insertCell(3)
    c4.innerHTML = "<button class='btn btn-sm btn-outline-primary link' disabled><i class='link fa-solid fa-arrow-up-right-from-square'></i></button>"
    var c5 = r.insertCell(4)
    c5.innerHTML = "<button class='btn btn-sm btn-outline-danger trash'><i class=\"trash fa-solid fa-trash-can-xmark\"></i></button>"


    chrome.storage.sync.get({spreadsheets: []}, function(result){
        let re = result.spreadsheets
        re.push({row_num: r.rowIndex, order: "none", is_dynam: null, file_id: null, name:"unnamed", def:false})
        chrome.storage.sync.set({spreadsheets: re})
    })
}

document.getElementById('link').addEventListener('click', add_config)
var doneTypingInterval = 800;  //time in ms (5 seconds)
var typingTimer;
document.body.onkeyup = function (e){
    let f = e.target
    clearTimeout(typingTimer);
    if (f.value) {
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
    function doneTyping(){
        let row_ndx = f.parentElement.parentElement.rowIndex - 1
        chrome.storage.sync.get(["spreadsheets"], function (re){
            let s_l = re.spreadsheets
            let s = s_l[row_ndx]
            s.name = f.value
            chrome.storage.sync.set({spreadsheets: s_l})
        })
    }
}


document.body.onclick = function(e) {
    e = e.target
    if (e.className && e.className.indexOf('manage') !== -1) {
        let f = e.parentElement
        console.log(f)
        let h = f.parentElement
        console.log(h)
        let row_num = h.rowIndex
        console.log(h.rowIndex)
        open_picker(row_num)
    }
    if (e.className && e.className.indexOf('rad') !== -1) {
        let def_el_index = e.parentElement.parentElement.parentElement.rowIndex - 1
        console.log(def_el_index)
        chrome.storage.sync.get(['spreadsheets'], function (re) {
            let s = re.spreadsheets
            for (let each of s) {
                each.def = false
            }
            s[def_el_index].def = true
            chrome.storage.sync.set({spreadsheets: s})
        })
    }
    if (e.className && e.className.indexOf('trash') !== -1) {
        let row_in;
        if (e.nodeName === "I") {
            row_in = e.parentElement.parentElement.parentElement.rowIndex - 1
            e.parentElement.parentElement.parentElement.remove()
        }
        else {
            row_in = e.parentElement.parentElement.rowIndex - 1
            e.parentElement.parentElement.remove()
        }
        chrome.storage.sync.get(["spreadsheets"], function (re) {
            let s = re.spreadsheets
            s.splice(row_in, 1)
            chrome.storage.sync.set({spreadsheets: s})
        })
    }
    if (e.className && e.className.indexOf('link') !== -1) {
        console.log('EVENT')
        let row_in;
        if (e.nodeName === "I") {
            row_in = e.parentElement.parentElement.parentElement.rowIndex - 1
        }
        else {
            row_in = e.parentElement.parentElement.rowIndex - 1
        }
        chrome.storage.sync.get(["spreadsheets"], function (re) {
            let s_l = re.spreadsheets
            console.log(s_l)
            let s = s_l[row_in]
            console.log(s)
            window.open("https://docs.google.com/spreadsheets/d/" + s.file_id +"/edit", "_blank")
        })
    }
}

function add_row(name, default1=false){
    var t = document.getElementById("table")
    var r = t.insertRow()
    var c1 = r.insertCell(0)
    c1.innerHTML = "<input id='input' class='form-control form-control-sm' placeholder='Name' value=" + name + ">"
    var c2 = r.insertCell(1)
    var c3 = r.insertCell(2)
    if (default1 === false) {
        c3.innerHTML = "<div class=\"form-check\"> <input class=\"form-check-input rad\" type=\"radio\" name=\"radio\"> </div>"
    }
    else{
        c3.innerHTML = "<div class=\"form-check\"> <input class=\"form-check-input rad\" type=\"radio\" name=\"radio\" checked> </div>"
    }
    var c4 = r.insertCell(3)
    chrome.storage.sync.get(["spreadsheets"], function(re){
        let s = re.spreadsheets
        let row_in = r.rowIndex - 1
        if (s[row_in].file_id !== null) {
            c2.innerHTML = "<button class='manage btn btn-sm btn-outline-primary'>Manage</button>"
            c4.innerHTML = "<button class='btn btn-sm btn-outline-primary link'><i class='link fa-solid fa-arrow-up-right-from-square'></i></button>"
        }
        else {
            c2.innerHTML = "<button class='manage btn btn-sm btn-outline-primary'>Setup</button>"
            c4.innerHTML = "<button class='btn btn-sm btn-outline-primary link' disabled><i class='link fa-solid fa-arrow-up-right-from-square'></i></button>"
        }
    })
    var c5 = r.insertCell(4)
    c5.innerHTML = "<button class='btn btn-sm btn-outline-danger trash'><i class=\"trash fa-solid fa-trash-can-xmark\"></i></button>"
}

chrome.storage.sync.get({spreadsheets: []}, function(r){
    let s = r.spreadsheets
    for (let each of s){
        if (each.def === false){
            add_row(each.name)
        }
        else{
            add_row(each.name,true)
        }
    }
})

// keep at bottom
chrome.storage.sync.get(['fileID'], function (result) {
    const f_ID = result.fileID
    if (f_ID != null){
        var t = document.getElementById("table")
        var r = t.insertRow()
        var c1 = r.insertCell(0)
        c1.innerHTML = "<input id='input' class='form-control form-control-sm' placeholder='Name' value='Unnamed - Previously Linked'>"
        var c2 = r.insertCell(1)
        c2.innerHTML = "<button class='manage btn btn-sm btn-outline-primary'>Manage</button>"
        var c3 = r.insertCell(2)
        c3.innerHTML = "<div class=\"form-check\">\n" +
            "  <input class=\"form-check-input\" type=\"radio rad\" name=\"radio\" id=\"radio1\" checked>\n" +
            "</div>"
        chrome.storage.sync.get({spreadsheets: []}, function(result){
            let re = result.spreadsheets
            chrome.storage.sync.get(["order"], function (o){
                let order = o.order
                console.log(order)
                chrome.storage.sync.get(['is_dynam'], function(d){
                    let dynam = d.is_dynam
                    console.log(dynam)
                    re.push({row_num: r.rowIndex, order: order, is_dynam: dynam, file_id: f_ID, name: "Unnamed - Previously Linked", def: true})
                    chrome.storage.sync.set({spreadsheets: re})
                    chrome.storage.sync.set({fileID: null})
                    chrome.storage.sync.remove(['fileID'])
                    chrome.storage.sync.remove('is_dynam')
                    chrome.storage.sync.remove('order')
                })
            })
        })
    }
})