// ===== LOGGER =====
function log(msg, cls) {
    var div = document.getElementById('debug-log-content');
    var el = document.createElement('div');
    el.className = cls || 'log-ok';
    el.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
    div.appendChild(el);
    div.scrollTop = div.scrollHeight;
}

// ===== TRACK EXTENSION CLICKS =====
var activePatientRow = null;
document.addEventListener('click', function(e) {
    var btn = e.target.closest('a.btncall, a.btntablecall');
    if (btn) {
        e.preventDefault();
        var row = btn.closest('tr');
        var name = row.querySelector('td:nth-child(3)').textContent;
        log('CALL BUTTON CLICKED -> ' + name, 'log-click');
        activePatientRow = row;

        var dischargeBtn = document.createElement('a');
        dischargeBtn.href = '#';
        dischargeBtn.className = 'btn btn-danger btn-sm mr-3';
        dischargeBtn.textContent = ' Discharge';
        btn.replaceWith(dischargeBtn);

        dischargeBtn.addEventListener('click', function(ev) {
            ev.preventDefault();
            log('PATIENT DISCHARGED -> ' + name, 'log-warn');
            row.remove();
            activePatientRow = null;
            log('Waiting for extension to auto-call next patient...', 'log-ok');
        });
    }
}, true);

// ===== SIMULATE PATIENT =====
var counter = 0;
var names = ['PATIENT ALPHA', 'PATIENT BETA', 'PATIENT GAMMA', 'PATIENT DELTA'];

function simulateNewPatient() {
    var tbody = document.getElementById('PatientPendTable');
    var id = 1000001 + counter;
    var name = names[counter % names.length];
    var phone = '050000' + String(counter).padStart(4, '0');
    var now = new Date();
    var time = now.getFullYear() + '-' +
        String(now.getMonth()+1).padStart(2,'0') + '-' +
        String(now.getDate()).padStart(2,'0') + ' ' +
        String(now.getHours()).padStart(2,'0') + ':' +
        String(now.getMinutes()).padStart(2,'0');

    var row = document.createElement('tr');
    row.className = 'clsPendingRow warningrow';
    row.innerHTML =
        '<td></td>' +
        '<td>' + id + '</td>' +
        '<td>' + name + '</td>' +
        '<td>' + (25 + counter) + '</td>' +
        '<td>' + time + '</td>' +
        '<td>' + phone + '</td>' +
        '<td>Phone</td>' +
        '<td>' +
            '<a href="#" ' +
               'class="btn btn-info btn-sm btncall CsActionPat mr-3 btntablecall"> call</a>' +
        '</td>';

    tbody.appendChild(row);
    counter++;
    log('Patient "' + name + '" added to queue.', 'log-warn');
    log('Waiting for extension to auto-click (up to 2s)...', 'log-ok');
}

// ===== INIT =====
document.getElementById('simulateBtn').addEventListener('click', simulateNewPatient);

log('Page loaded. Table #PatientPendTable ready.', 'log-ok');
log('Click "Simulate New Patient" to test.', 'log-ok');

setTimeout(function() {
    log('Auto-adding first patient...', 'log-warn');
    simulateNewPatient();
}, 3000);
