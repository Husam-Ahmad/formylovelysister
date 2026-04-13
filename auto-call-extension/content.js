// content.js
// Fully automatic for livecare.hmg.com
// 1. On patient list page (no VCID in URL): auto-clicks "Call"
// 2. On call page (VCID in URL): does nothing (call in progress)
// 3. When page returns to list: auto-clicks next patient
// Supports Chrome and Edge. No page modification.

var browserAPI = (typeof browser !== 'undefined' && browser.runtime) ? browser : chrome;

var processedRows = new WeakSet();

// Click a link safely — avoids CSP block on javascript: hrefs
function safeClick(el) {
    var href = el.getAttribute('href');
    if (href && href.indexOf('javascript:') === 0) {
        el.removeAttribute('href');
    }
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    if (href) {
        el.setAttribute('href', href);
    }
}

// Check if a call is already in progress (URL has VCID parameter)
function isCallInProgress() {
    return window.location.search.indexOf('VCID=') !== -1;
}

function checkForNewPatients() {
    // Don't click if a call is already in progress
    if (isCallInProgress()) return;

    var table = document.getElementById('PatientPendTable');
    if (!table) return;

    var rows = table.querySelectorAll('tr.clsPendingRow');

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (processedRows.has(row)) continue;

        var callBtn = row.querySelector('a.btncall, a.btntablecall, a.CsActionPat');
        if (callBtn) {
            var text = (callBtn.innerText || callBtn.value || '').trim().toLowerCase();
            if (text === 'call') {
                processedRows.add(row);
                safeClick(callBtn);
                console.log('[AutoCall] Clicked call. Page will navigate for the call.');
                return;
            }
        }
    }
}

// Poll every 2 seconds
setInterval(checkForNewPatients, 2000);
setTimeout(checkForNewPatients, 1000);

if (isCallInProgress()) {
    console.log('[AutoCall] Call in progress (VCID in URL). Waiting...');
} else {
    console.log('[AutoCall] Patient list page. Looking for patients to call...');
}
