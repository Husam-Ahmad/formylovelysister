// popup.js
// Communicates with content.js via messaging.
// Supports Chrome and Microsoft Edge.

var browserAPI = (typeof browser !== 'undefined' && browser.runtime) ? browser : chrome;

var statusEl = document.getElementById('status');
var doneBtn = document.getElementById('doneBtn');

function updateStatus() {
    try {
        browserAPI.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (browserAPI.runtime.lastError || !tabs || !tabs[0]) {
                showOff();
                return;
            }
            browserAPI.tabs.sendMessage(tabs[0].id, { action: 'getStatus' }, function (res) {
                if (browserAPI.runtime.lastError || !res) {
                    showOff();
                    return;
                }
                if (res.isBusy) {
                    statusEl.textContent = 'In call - waiting for patient';
                    statusEl.className = 'status-busy';
                    doneBtn.disabled = false;
                } else {
                    statusEl.textContent = 'Idle - waiting for next patient';
                    statusEl.className = 'status-idle';
                    doneBtn.disabled = true;
                }
            });
        });
    } catch (e) {
        showOff();
    }
}

function showOff() {
    statusEl.textContent = 'Not active on this page';
    statusEl.className = 'status-off';
    doneBtn.disabled = true;
}

doneBtn.addEventListener('click', function () {
    browserAPI.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs || !tabs[0]) return;
        browserAPI.tabs.sendMessage(tabs[0].id, { action: 'markDone' }, function (res) {
            if (browserAPI.runtime.lastError) return;
            if (res && res.status === 'done') {
                statusEl.textContent = 'Idle - waiting for next patient';
                statusEl.className = 'status-idle';
                doneBtn.disabled = true;
            }
        });
    });
});

updateStatus();
setInterval(updateStatus, 1000);
