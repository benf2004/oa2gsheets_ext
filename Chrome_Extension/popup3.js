function monthly(win_type = "payment") {
    console.log("WORKING!")
    chrome.storage.sync.get(['oa_plan'], function (result) {
        let plan = result.oa_plan
        console.log("PLAN: " + plan)
        if (plan === "oa2gsheets-lifetime") {
            //chrome.storage.local.remove(['extensionpay_api_key', 'extensionpay_installed_at', "extensionpay_user", 'oa_plan'])
            chrome.storage.sync.remove(['extensionpay_api_key', 'extensionpay_installed_at', "extensionpay_user", 'oa_plan'], function () {
                chrome.storage.sync.set({oa_plan: 'oa2gsheets'})
                chrome.runtime.sendMessage('monthly_activated')
                const extpay = ExtPay('oa2gsheets')
                if (win_type === "login"){
                    extpay.openLoginPage()
                }
                else {
                    extpay.openPaymentPage()
                }
            })
        }
        else {
            const extpay = ExtPay('oa2gsheets')
            if (win_type === "login"){
                extpay.openLoginPage()
            }
            else {
                extpay.openPaymentPage()
            }        }
    })
}

function lifetime(win_type = "payment"){
    chrome.storage.local.remove(['extensionpay_api_key','extensionpay_installed_at', "extensionpay_user", 'oa_plan'])
    chrome.storage.sync.remove(['extensionpay_api_key','extensionpay_installed_at', "extensionpay_user", 'oa_plan'], function() {
        console.log("LIFETIME CLICKED")
        chrome.storage.sync.set({oa_plan: 'oa2gsheets-lifetime'}, function() {
            chrome.runtime.sendMessage('lifetime_activated')
            const extpay = ExtPay('oa2gsheets-lifetime')
            if (win_type === "login"){
                extpay.openLoginPage()
            }
            else {
                extpay.openPaymentPage()
            }
        })
    })
}

function open_dashboard(){
    const extpay = ExtPay('oa2gsheets')
    extpay.openPaymentPage()
}

function start_trial() {
    chrome.storage.local.remove(['extensionpay_api_key','extensionpay_installed_at', "extensionpay_user", 'oa_plan'])
    chrome.storage.sync.remove(['extensionpay_api_key','extensionpay_installed_at', "extensionpay_user", 'oa_plan'], function() {
        chrome.storage.sync.set({oa_plan: 'oa2gsheets'})
        chrome.runtime.sendMessage('monthly_activated')
        const extpay = ExtPay('oa2gsheets')
        extpay.openTrialPage("14-day")
    })
    chrome.storage.sync.get(['extensionpay_user'], function(response){
        let mail = response.email
        chrome.storage.sync.set({oa_email: mail});
    })
}

function show_email() {
    document.getElementById("email_div").classList.remove('d-none');
}

function confirm_cancel() {
    // start here tomorrow
    document.getElementById("confirm").classList.remove('d-none');
}

function login1() {
    document.getElementById('login2').classList.remove('d-none')
}

function l_login(){
    lifetime("login")
}

function m_login(){
    monthly("login")
}

document.getElementById('dashboard').addEventListener('click', open_dashboard)
document.getElementById('oa2gsheets').addEventListener("click", monthly)
document.getElementById('oa2gsheets_lifetime').addEventListener("click", lifetime)
document.getElementById('trial1').addEventListener("click", start_trial)
document.getElementById('trial2').addEventListener("click", start_trial)
document.getElementById('upgrade_button').addEventListener("click", confirm_cancel)
document.getElementById('cancel').addEventListener('click', open_dashboard)
document.getElementById('confirm').addEventListener('click', lifetime)
document.getElementById('already_paid').addEventListener("click", login1)
document.getElementById('lifetime').addEventListener("click", l_login)
document.getElementById('monthly').addEventListener('click', m_login)

function check_trial(user) {
    const now = new Date();
    const days_14 = 1000*60*60*24*14 // in milliseconds
    if (user.trialStartedAt && (now - user.trialStartedAt) < days_14) {
        return true
    }
    else {
        return false
    }
}

async function is_paid() {
    chrome.storage.sync.get(['oa_plan'], async function (result) {
        let plan = result.oa_plan
        console.log(plan)
        const extpay = ExtPay(plan)
        const user = await extpay.getUser();
        if (user.paid === true) {
            handle_paid(true)
        }
        else if (check_trial(user) === true){
            let days = get_days_left(user)
            handle_paid({type: "trial", days_left: days})
        }
        else if (user.paid === false){
            if (user.trialStartedAt === null){
                handle_paid("no_trial")
            }
            else {
                handle_paid(false)
            }
        }
    });
}

function get_days_left(user) {
    const now = new Date();
    const days_14 = 1000*60*60*24*14 // in milliseconds
    let mils_left = user.trialStartedAt - now + days_14
    let days_left = Math.ceil(mils_left/(1000*60*60*24))
    return days_left
}

function handle_paid(p) {
    let paid = p
    if (paid === true) {
        document.getElementById("picker").className = 'nav-link'
        chrome.storage.sync.get(['oa_plan'], function (result){
            if (result.oa_plan === 'oa2gsheets') {
                document.getElementById('oa2gsheets').innerHTML = "Manage Subscription"
                document.getElementById('dashboard').style.marginLeft = "80px";
                document.getElementById('button_div').remove()
                document.getElementById('l_div').remove()
                document.getElementById("upgrade_div").classList.remove('d-none');
                document.getElementById("dash_div").classList.remove('d-none');
                document.getElementById('trial_div').remove()
                document.getElementById('login').remove()
                document.getElementById('trial_started').remove()
                //document.getElementById('oa2gsheets_lifetime').style.marginLeft = "70px";
                //document.getElementById('oa2gsheets_lifetime').innerHTML = "Upgrade Now"
                load_first()
            }
            else {
                document.getElementById('trial_started').remove()
                document.getElementById('login').remove()
                document.getElementById('monthly_div').remove()
                document.getElementById('lifetime_div').remove()
                document.getElementById('setup').remove()
                document.getElementById('trial_div').remove()
                document.getElementById('thank_you').classList.remove('d-none')
                load_first()
            }
        })
    }
    else if (paid.type === "trial"){
        document.getElementById('trial_div').remove()
        document.getElementById('trial_started').classList.remove('d-none')
        document.getElementById('days_left').innerHTML = paid.days_left
        load_first()
    }
    else if (paid === "no_trial") {
        console.log("UNPAID")
        document.getElementById("trial_div").classList.remove('d-none');
        document.getElementById("trial_div").style.display = "block"
        document.getElementById("picker").className = 'nav-link disabled'
        document.getElementById("prefs").className = 'nav-link disabled'
        load_first()
    }
    else {
        document.getElementById('trial_started').classList.remove('d-none')
        document.getElementById('memo').innerHTML = "Your trial has ended. \n Please select a plan to continue using OA2Gsheets."
        document.getElementById("picker").className = 'nav-link disabled'
        load_first()
    }
}
is_paid()

function load_first(){
    document.getElementById('filler').classList.add('d-none')
    document.getElementById('outer').classList.remove('d-none')
}
