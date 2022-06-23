function monthly() {
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
                extpay.openPaymentPage()
            })
        }
        else {
            const extpay = ExtPay('oa2gsheets')
            extpay.openPaymentPage()
        }
    })
}

function lifetime(){
    chrome.storage.local.remove(['extensionpay_api_key','extensionpay_installed_at', "extensionpay_user", 'oa_plan'])
    chrome.storage.sync.remove(['extensionpay_api_key','extensionpay_installed_at', "extensionpay_user", 'oa_plan'], function() {
        console.log("LIFETIME CLICKED")
        chrome.storage.sync.set({oa_plan: 'oa2gsheets-lifetime'}, function() {
            chrome.runtime.sendMessage('lifetime_activated')
            const extpay = ExtPay('oa2gsheets-lifetime')
            extpay.openPaymentPage()
        })
    })
}

function open_dashboard(){
    const extpay = ExtPay('oa2gsheets')
    extpay.openPaymentPage()
}

function start_trial() {
    let email = document.getElementById('email').value
    chrome.storage.sync.set({oa_email: email});
    console.log("Email Set!")
    chrome.storage.local.remove(['extensionpay_api_key','extensionpay_installed_at', "extensionpay_user", 'oa_plan'])
    chrome.storage.sync.remove(['extensionpay_api_key','extensionpay_installed_at', "extensionpay_user", 'oa_plan'], function() {
        chrome.storage.sync.set({oa_plan: 'oa2gsheets'})
        chrome.runtime.sendMessage('monthly_activated')
        const extpay = ExtPay('oa2gsheets')
        extpay.openTrialPage("7-day")
    })
}

function show_email() {
    document.getElementById("email_div").classList.remove('d-none');
}

function confirm_cancel() {
    // start here tomorrow
    document.getElementById("confirm").classList.remove('d-none');
}

document.getElementById('dashboard').addEventListener('click', open_dashboard)
document.getElementById('oa2gsheets').addEventListener("click", monthly)
document.getElementById('oa2gsheets_lifetime').addEventListener("click", lifetime)
document.getElementById('trial1').addEventListener("click", show_email)
document.getElementById('trial2').addEventListener("click", start_trial)
document.getElementById('updgrade_button').addEventListener("click", confirm_cancel)
document.getElementById('cancel').addEventListener('click', open_dashboard)
document.getElementById('confirm').addEventListener('click', lifetime)

function check_trial(user) {
    const now = new Date();
    const days_21 = 1000*60*60*24*21 // in milliseconds
    if (user.trialStartedAt && (now - user.trialStartedAt) < days_21) {
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
            handle_paid("trial")
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

function handle_paid(p) {
    let paid = p
    if (paid === true) {
        document.getElementById("picker").className = 'nav-link'
        chrome.storage.sync.get(['oa_plan'], function (result){
            if (result.oa_plan === 'oa2gsheets') {
                document.getElementById('oa2gsheets').innerHTML = "Manage Subscription"
                document.getElementById('button_div').remove()
                document.getElementById('l_div').remove()
                document.getElementById("upgrade_div").classList.remove('d-none');
                document.getElementById('dash_div').style.display = 'inline'
                document.getElementById('trial_div').remove()
                document.getElementById('oa2gsheets_lifetime').style.marginLeft = "70px";
                document.getElementById('oa2gsheets_lifetime').innerHTML = "Upgrade Now"
                document.getElementById('oa2gsheets-lifetime').classList.add('disabled')
            }
            else {
                document.getElementById('monthly_div').remove()
                document.getElementById('lifetime_div').remove()
                document.getElementById('setup').remove()
                document.getElementById('trial_div').remove()
                document.getElementById('thank_you').classList.remove('d-none')
            }
        })
    }
    else if (paid === "trial"){
        document.getElementById('trial_div').remove()
    }
    else if (paid === "no_trial") {
        console.log("UNPAID")
        document.getElementById("trial_div").classList.remove('d-none');
        document.getElementById("trial_div").style.display = "block"
        document.getElementById("picker").className = 'nav-link disabled'
    }
    else {
        document.getElementById("picker").className = 'nav-link disabled'
    }
}
is_paid()



