// --- Venex Binner Base Script ---
document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const hiddenColorPicker = document.getElementById('hiddenColorPicker');
    const colorPickerBtn = document.getElementById('colorPickerBtn');
    const defaultAccent = '#97bc52';

    function hexToRgbArray(hex) {
        let r = 0, g = 0, b = 0;
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
        return [r, g, b];
    }

    function darkenColor(hex, percent) {
        const [rOrig, gOrig, bOrig] = hexToRgbArray(hex);
        const factor = 1 - percent / 100;
        const r = Math.max(0, Math.floor(rOrig * factor));
        const g = Math.max(0, Math.floor(gOrig * factor));
        const b = Math.max(0, Math.floor(bOrig * factor));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function getContrastTextColor(hexcolor) {
        const [r, g, b] = hexToRgbArray(hexcolor);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 135) ? '#121212' : '#FFFFFF';
    }
    
    window.getAccentRgb = () => {
        const rgbString = getComputedStyle(root).getPropertyValue('--accent-primary-rgb').trim();
        const [r, g, b] = rgbString.split(',').map(Number);
        return { r, g, b };
    };

    function applyAccentColor(hexColor) {
        if (!/^#[0-9A-F]{3}(?:[0-9A-F]{3})?$/i.test(hexColor)) {
            hexColor = getComputedStyle(root).getPropertyValue('--accent-primary').trim() || defaultAccent;
        }
        const rgbArray = hexToRgbArray(hexColor);
        const rgbString = rgbArray.join(', ');
        const darkColor = darkenColor(hexColor, 15);
        const textColor = getContrastTextColor(hexColor);

        root.style.setProperty('--accent-primary', hexColor);
        root.style.setProperty('--accent-primary-rgb', rgbString);
        root.style.setProperty('--accent-primary-dark', darkColor);
        root.style.setProperty('--accent-primary-text', textColor);

        localStorage.setItem('themeAccentColor', hexColor);
    }

    function loadAccentColor() {
        const savedColor = localStorage.getItem('themeAccentColor');
        applyAccentColor(savedColor || defaultAccent);
    }

    if (colorPickerBtn) {
        colorPickerBtn.addEventListener('click', () => {
            const currentAccent = getComputedStyle(root).getPropertyValue('--accent-primary').trim();
            hiddenColorPicker.value = currentAccent;
            hiddenColorPicker.click();
        });
    }

    if (hiddenColorPicker) {
        hiddenColorPicker.addEventListener('input', (event) => {
            applyAccentColor(event.target.value);
            if (typeof createSnakes === 'function') { createSnakes(); }
        });
    }

    loadAccentColor();
});


const themeCheckbox = document.getElementById('theme-checkbox');
const currentTheme = localStorage.getItem('theme') || 'dark';
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        if (themeCheckbox) themeCheckbox.checked = true;
    } else {
        document.body.classList.remove('light-mode');
        if (themeCheckbox) themeCheckbox.checked = false;
    }
}
applyTheme(currentTheme);
if (themeCheckbox) {
    themeCheckbox.addEventListener('change', function() {
        const newTheme = this.checked ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

var audio = new Audio('live.mp3');
var successSound = new Audio('approved.mp3');
var maxThreads = 1;
var activeThreads = 0;
var processingQueue = [];
var stopped = true;
var totalItems = 0; var testedItems = 0; var approvedItems = 0; var declinedItems = 0; var liveResultItems = 0; var errorItems = 0;
var checkDelay = 150; 
toastr.options = { "closeButton": true, "debug": false, "newestOnTop": true, "progressBar": true, "positionClass": "toast-top-right", "preventDuplicates": false, "onclick": null, "showDuration": "300", "hideDuration": "1000", "timeOut": "4000", "extendedTimeOut": "1000", "showEasing": "swing", "hideEasing": "linear", "showMethod": "fadeIn", "hideMethod": "fadeOut" };
var activeAjaxRequests = [];
var currentGateForBatch = '';

function isValidLuhn(cc) { let s = 0; let a = false; for (let i = cc.length - 1; i >= 0; i--) { let n = parseInt(cc.charAt(i), 10); if (a) { n *= 2; if (n > 9) n -= 9; } s += n; a = !a; } return s % 10 === 0; }
function getCardDetails(cc) { if ((cc.startsWith("34") || cc.startsWith("37")) && cc.length === 15) return { type: "AMEX", length: 15, cvcLength: 4 }; if (cc.startsWith("4") && (cc.length === 16 || cc.length === 13)) return { type: "Visa", length: cc.length, cvcLength: 3 }; if ((/^5[1-5]/.test(cc) || /^2[2-7]/.test(cc)) && cc.length === 16) return { type: "Mastercard", length: 16, cvcLength: 3 }; if ((cc.startsWith("6011") || cc.startsWith("65") || cc.startsWith("644") || cc.startsWith("645") || cc.startsWith("646") || cc.startsWith("647") || cc.startsWith("648") || cc.startsWith("649")) && cc.length === 16) return { type: "Discover", length: 16, cvcLength: 3 }; return null; }
function extractValidCCFormat(e) { const t = e.split('\n').filter((e => "" !== e.trim())), o = new Set, n = new Date, s = n.getFullYear(), r = n.getMonth() + 1; return t.forEach((e => { let t = e.replace(/[^0-9]/g, ' ').trim(); const n = t.split(/\s+/).filter((e => e.length > 0)); if (n.length < 3) return; let l = "", i = -1; let c = t.match(/\b(\d{13}|\d{15,16})\b/); if (c) { l = c[0]; const cardParts=l.match(/\d+/g)||[]; const lastPart=cardParts.pop(); if(lastPart){ for(let k=0;k<n.length;k++){ if(n[k].endsWith(lastPart) && n.slice(0,k+1).join('').endsWith(l)){ i=k; break; } } if(i===-1 && n.includes(l)) i = n.indexOf(l); } } else { for (let e = 0; e < n.length - 2; e++) { let t = n.slice(0, e + 1).join(''); if (t.length === 13 || t.length === 15 || t.length === 16) { l = t, i = e; break; } } } if (!l || i === -1) return; const cardDetails = getCardDetails(l); if (!cardDetails || !isValidLuhn(l)) return; const m = i + 1; if (m >= n.length) return; const h = n[m].match(/^(0?[1-9]|1[0-2])$/); if (!h) return; const g = h[1].padStart(2, '0'); const p = m + 1; if (p >= n.length) return; let v; let yearStr = n[p]; if (yearStr.length === 2 && /^\d+$/.test(yearStr)) { v = parseInt(`20${yearStr}`, 10); } else if (yearStr.length === 4 && /^\d+$/.test(yearStr)) { v = parseInt(yearStr, 10); } else { return; } if (isNaN(v) || v < s || v > s + 20) return; if (v === s && parseInt(g) < r) return; let f = `${l}|${g}|${v}`; const k = p + 1; if (k < n.length) { const cvvMatch = n[k].match(/^\d{3,4}$/); if (cvvMatch) { const cvv = cvvMatch[0]; if ((cardDetails.type === "AMEX" && cvv.length === 4) || (cardDetails.type !== "AMEX" && cvv.length === 3)) { f += `|${cvv}`; } } } o.add(f); })), Array.from(o).join('\n') || ""; }

function updateStats() {
    $('.counters .counter.approved .counter-value.approved').text(approvedItems);
    $('.counters .counter.live .counter-value.aprovadas').text(liveResultItems);
    $('.counters .counter.declined .counter-value.reprovadas').text(declinedItems + errorItems);
    $('.result-block-title .badge.badge-success.approved').text(approvedItems);
    $('.result-block-title .badge.badge-warning.aprovadas').text(liveResultItems);
    $('.result-block-title .badge.badge-danger.reprovadas').text(declinedItems + errorItems);
    $('.result-block-total span.approved').text(approvedItems);
    $('.result-block-total span.aprovadas').text(liveResultItems);
    $('.result-block-total span.reprovadas').text(declinedItems + errorItems);
    const progressBar = $('#main-progress-bar');
    if (progressBar.length) {
        if (totalItems > 0 && testedItems >= 0) {
            const percentage = (testedItems / totalItems) * 100;
            progressBar.css('width', percentage + '%');
        } else {
            progressBar.css('width', '0%');
        }
    }
}
function updateCardListCount() {
    const ta = $('#input-list');
    let count = 0;
    if (ta.length) {
         const currentListContent = ta.val().trim();
         if (currentListContent !== "") {
            const validatedContentForCount = extractValidCCFormat(currentListContent);
            count = validatedContentForCount ? validatedContentForCount.split('\n').length : 0;
         }
    }
    $('.cardlist').text(count);
}

function processQueue() {
    if (stopped) return;
    if (processingQueue.length === 0 && activeThreads === 0) {
        if (!stopped) {
            stopped = true;
            $("#checker-status").attr("class", "badge-venex badge-success").html('<i class="fas fa-check"></i> PROCESSING COMPLETE!');
            toastr.success(`FINISHED CHECKING ${totalItems} CARDS.`);
            enableInputs();
            updateStats();
        }
        return;
    }
    while (activeThreads < maxThreads && processingQueue.length > 0 && !stopped) {
        activeThreads++;
        checkItem(processingQueue.shift(), currentGateForBatch);
    }
}

function removeLineFromTextarea(itemToRemove) {
    const ta = $("#input-list");
    if (!ta.length) return;
    let currentList = ta.val();
    const lines = currentList.split('\n');
    const filteredLines = lines.filter(line => line.trim() !== itemToRemove.trim());
    ta.val(filteredLines.join('\n'));
    updateCardListCount();
}

function checkItem(currentItem, gateForThisItem) {
    if (!currentItem || stopped) {
        if (activeThreads > 0) activeThreads--;
        const xhrIndex = activeAjaxRequests.findIndex(req => req && req.currentItemForAbort === currentItem);
        if (xhrIndex > -1) activeAjaxRequests.splice(xhrIndex, 1);
        setTimeout(processQueue, 0);
        return;
    }

    testedItems++;
    updateStats();
    $("#checker-status").attr("class", "badge-venex badge-info").html(`<i class="fas fa-sync fa-spin"></i> CHECKING [${testedItems}/${totalItems}]: ${currentItem.substring(0, 12)}...`);

    if (!gateForThisItem) {
        handleCheckError(currentItem, "NO GATE SELECTED FOR BATCH");
        finishCheckItem(currentItem);
        return;
    }
    const reqData = { lista: currentItem };

    if (gateForThisItem !== 'Amazon.php' && $('#proxy-toggle').is(':checked')) {
        const allProxies = $('#proxy_input').val().trim();
        if (allProxies) {
            reqData.use_proxy = 'true';
            reqData.proxies = allProxies;
            reqData.proxy_type = $('#proxy_type').val();
        }
    }

    if (gateForThisItem === "Auto.php") {
        let cookie = $("#manual_cookie").val().trim();
        let link = $("#link_site").val().trim();
        if (!cookie || !link) {
            handleCheckError(currentItem, "MISSING WOOCOMMERCE COOKIE OR LINK");
            finishCheckItem(currentItem);
            return;
        }
        reqData.manual_cookie = cookie;
        reqData.link_site = link;
    } else if (gateForThisItem === "Amazon.php") {
         let region = $("#amazon_region").val();
         let cookie = $("#amazon_cookie").val().trim();
         if (!cookie) {
             handleCheckError(currentItem, "MISSING AMAZON COOKIE");
             finishCheckItem(currentItem);
             return;
         }
         reqData.amazon_region = region;
         reqData.amazon_cookie = cookie;
    }
    
    const xhr = $.ajax({
        url: gateForThisItem,
        type: 'GET',
        data: reqData
    });
    xhr.currentItemForAbort = currentItem;
    activeAjaxRequests.push(xhr);
    xhr.done(function(res) {
        if (stopped) return;
        handleApiResponse(currentItem, res);
    }).fail(function(jqXHR, textStatus, errorThrown) {
        if (stopped) return;
        let errorMsg = `REQUEST FAILED: ${textStatus}`;
        if (errorThrown) errorMsg += ` - ${errorThrown}`;
        handleCheckError(currentItem, errorMsg);
    }).always(function() {
        if (stopped) return;
        const index = activeAjaxRequests.findIndex(req => req === xhr);
        if (index > -1) activeAjaxRequests.splice(index, 1);
        finishCheckItem(currentItem);
    });
}


function handleApiResponse(card, responseText) {
    try {
        if (stopped) return;
        const resText = responseText || "[EMPTY RESPONSE]";
        const resLow = String(resText).toLowerCase();
        const displayCard = card;
        if (resLow.includes("approved")) {
            approvedItems++;
            $('#lista_approved').append(`<div class="approved-entry">${displayCard} - ${resText}</div>`);
            const approvedEntry = $('#lista_approved').children().last();
            approvedEntry.css({ backgroundColor: 'var(--status-success-light)' });
            setTimeout(() => approvedEntry.css({ backgroundColor: '' }), 1000);
            try { successSound.play().catch(()=>{}); } catch(e) {}
        } else if (resLow.includes("live")) {
             liveResultItems++;
             $('#lista_aprovadas').append(`<div class="live-entry">${displayCard} - ${resText}</div>`);
             const liveEntry = $('#lista_aprovadas').children().last();
             liveEntry.css({ backgroundColor: 'var(--status-live-light)' });
             setTimeout(() => liveEntry.css({ backgroundColor: '' }), 1000);
             try { audio.play().catch(()=>{}); } catch(e) {}
        } else {
             declinedItems++;
             $('#lista_reprovadas').append(`<div class="declined-entry">${displayCard} - ${resText}</div>`);
        }
    } catch (err) {
        console.error("ERROR PROCESSING RESPONSE:", err);
        handleCheckError(card, `RESPONSE PROCESSING ERROR: ${err.message}`);
    } finally {
        updateStats();
    }
}


function handleCheckError(card, message) {
    errorItems++;
    $('#lista_reprovadas').append(`<div class="declined-entry"><span class="badge badge-danger mr-1">ERROR</span> ${card} - ${message}</div>`);
    toastr.error(`${String(card).substring(0, 12)}... - ${message}`, "CHECK FAILED");
    console.error(`ERROR FOR ${card}: ${message}`);
}

function finishCheckItem(card) {
    removeLineFromTextarea(card);
    if (activeThreads > 0) activeThreads--;
    setTimeout(processQueue, checkDelay);
}

function cleanGenCVV(e, i) { return String(e).replace(/[^0-9]/g, '').slice(0, i ? 4 : 3); }
function genRndCVV(i) { let l = i ? 4 : 3, c = ''; for (let n = 0; n < l; n++) c += Math.floor(Math.random() * 10); return c; }
function genRndMonth() { return String(Math.floor(Math.random() * 12) + 1).padStart(2, '0'); }
function genRndYear() { let y = new Date().getFullYear(); return String(y + Math.floor(Math.random() * 10) + 1); }
function ensureFutureDate(sm, sy) { let n = new Date(), cy = n.getFullYear(), cm = n.getMonth() + 1; let mo, yr; yr = (sy === 'Random') ? genRndYear() : sy; mo = (sm === 'Random') ? genRndMonth() : sm.padStart(2, '0'); if (parseInt(yr) < cy || (parseInt(yr) === cy && parseInt(mo) < cm)) { yr = genRndYear(); if (parseInt(yr) === cy) mo = String(Math.floor(Math.random() * (12 - cm + 1)) + cm).padStart(2, '0'); else mo = genRndMonth(); } return { month: mo, year: yr }; }

function genCardNum(p) {
    let iA = p.startsWith('34') || p.startsWith('37');
    let len = iA ? 15 : 16;
    let pfx = '';
    let pattWithoutX = p.replace(/[^0-9]/g, '');
    let x = p.toLowerCase().indexOf('x');
    if (x !== -1) {
        pfx = pattWithoutX.substring(0, x);
    } else {
        pfx = pattWithoutX;
    }
    if (pfx.length >= len) return null;
    let att = 0;
    while (att < 30) {
        let b = pfx;
        let n_fill = len - 1 - pfx.length;
        if (n_fill < 0) return null;
        for (let i = 0; i < n_fill; i++) b += Math.floor(Math.random() * 10);
        let s = 0;
        let a = true;
        for (let i = b.length - 1; i >= 0; i--) {
            let d = parseInt(b[i], 10);
            if (a) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            s += d;
            a = !a;
        }
        let c = (s * 9) % 10;
        let card = b + c;
        if (card.length === len && isValidLuhn(card) && getCardDetails(card)) return card;
        att++;
    }
    console.warn(`Failed to generate valid card for pattern ${p} after ${att} attempts.`);
    return null;
}

function generate() {
    const binIn = $('#bin'), cvvIn = $('#gencvv'), qtyIn = $('#genqty'), moSel = $('#month'), yrSel = $('#year'), outTA = $('#input-list'), genBtn = $('#generateBtn');
    let binsRaw = binIn.val().trim();
    if (!binsRaw) { toastr.warning("PLEASE ENTER A BIN PATTERN."); binIn.focus(); return; }
    const bins = binsRaw.split(';').map(p => p.trim().replace(/[^0-9xX]/gi, '')).filter(p => p && p.replace(/[xX]/g, '').length >= 4);
    if (bins.length === 0) { toastr.error("NO VALID BIN PATTERNS (MIN 4 DIGITS)."); binIn.focus(); return; }
    const specCVV = cvvIn.val().trim();
    const qty = Math.min(Math.max(1, parseInt(String(qtyIn.val() || '10').replace(/[^0-9]/g,''), 10) || 10), 5000);
    qtyIn.val(qty);
    const selMo = moSel.val();
    const selYr = yrSel.val();
    let generatedList = '';
    let totalGen = 0;
    let attempts = 0;
    const maxAttempts = qty * 15;
    genBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> GENERATING...');
    
    setTimeout(() => {
        try {
            while (totalGen < qty && attempts < maxAttempts) {
                attempts++;
                let currentBinIndex = totalGen % bins.length;
                let patt = bins[currentBinIndex];
                let card = genCardNum(patt);
                if (card) {
                    let generatedCardInfo = getCardDetails(card);
                    let isGeneratedAmex = generatedCardInfo && generatedCardInfo.type === "AMEX";
                    let { month: mo, year: yr } = ensureFutureDate(selMo, selYr);
                    
                    let cvv;
                    if (specCVV) {
                        cvv = cleanGenCVV(specCVV, isGeneratedAmex);
                    } else {
                        cvv = genRndCVV(isGeneratedAmex);
                    }
                    
                    generatedList += `${card}|${mo}|${yr}|${cvv}\n`;
                    totalGen++;
                }
            }
            if (attempts >= maxAttempts && totalGen < qty) toastr.warning(`GENERATION STOPPED. ONLY ${totalGen}/${qty} CARDS GENERATED.`, "LIMIT REACHED");
            outTA.val('');
            if (generatedList) {
                const cleanedGenerated = extractValidCCFormat(generatedList.trim());
                if (cleanedGenerated) {
                    outTA.val(cleanedGenerated);
                    localStorage.setItem('inputValue', cleanedGenerated);
                    toastr.success(`${cleanedGenerated.split('\n').length} CARDS GENERATED!`);
                } else {
                     localStorage.setItem('inputValue', '');
                     toastr.warning("GENERATED CARDS WERE INVALID.", "WARNING");
                }
            } else if (totalGen === 0 && attempts >= maxAttempts) {
                   toastr.error("CARD GENERATION FAILED.");
                   localStorage.setItem('inputValue', '');
            }
        } catch (error) {
            console.error("Generation error:", error);
            toastr.error("GENERATION ERROR.");
            outTA.val("");
            localStorage.setItem('inputValue', '');
        }
        finally {
            genBtn.prop('disabled', false).html('<i class="fas fa-rocket"></i> GENERATE');
            updateCardListCount();
        }
    }, 10);
}
function cleanAndValidateQuantity(val) { let num = parseInt(String(val).replace(/[^0-9]/g, ''), 10); if (isNaN(num) || num < 1) return '10'; if (num > 5000) num = 5000; return String(num); }

function copyToClipboardHelper(textToCopy, buttonElement) {
     if (!textToCopy) { toastr.info("NOTHING TO COPY!"); return; }
     navigator.clipboard.writeText(textToCopy).then(() => {
         let originalHtml = $(buttonElement).html();
         $(buttonElement).html('<i class="fas fa-check"></i> COPIED!');
         setTimeout(() => { $(buttonElement).html(originalHtml); }, 1500);
         toastr.success("COPIED TO CLIPBOARD!");
     }, (err) => {
         toastr.error("FAILED TO COPY."); console.error("Clipboard error:", err);
         try {
            const ta = document.createElement("textarea"); ta.value = textToCopy; ta.style.position = "fixed";
            document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
            let originalHtml = $(buttonElement).html(); $(buttonElement).html('<i class="fas fa-check"></i> COPIED!');
            setTimeout(() => { $(buttonElement).html(originalHtml); }, 1500);
            toastr.success("COPIED (FALLBACK)!");
         } catch (fallbackErr) { console.error("Fallback copy error:", fallbackErr); toastr.error("COPY FAILED."); }
     });
 }
function getTextFromDivWithNewlines(elementId){
    let cardLines = [];
    $(`#${elementId} > div[class$="-entry"]`).each(function() {
        let fullText = $(this).text().trim();
         let cardPart = fullText.split(' - ')[0].trim();
         if (cardPart && cardPart.includes('|')) cardLines.push(cardPart);
         else if (cardPart) cardLines.push(cardPart);
    });
    return cardLines.join('\n').trim();
}
function copyGeneratedList(){
    const ta = document.getElementById('input-list');
    const btn = document.getElementById('copyGenBtn');
    if (!ta || !ta.value) return toastr.info("NO GENERATED LIST TO COPY!");
    copyToClipboardHelper(ta.value, btn);
}

function disableInputs() {
    $("#input-list, #bin, #gencvv, #genqty, #month, #year, #generateBtn, #copyGenBtn, #gate, #manual_cookie, #link_site, #amazon_region, #amazon_cookie, #wooTutorialAndroidBtn, #wooTutorialWindowsBtn, #proxy-toggle, #proxy_input, #proxy_type, #checker-speed").prop("disabled", true);
    $("#btn-start").prop("disabled", true);
    $("#btn-stop").prop("disabled", false);
}
function enableInputs() {
    $("#input-list, #bin, #gencvv, #genqty, #month, #year, #generateBtn, #copyGenBtn, #gate, #proxy-toggle, #proxy_input, #proxy_type, #checker-speed").prop("disabled", false);
    const selGate = $('#gate').val();
    $('#manual_cookie').prop('disabled', selGate !== 'Auto.php');
    $('#link_site').prop('disabled', selGate !== 'Auto.php');
    $('#wooTutorialAndroidBtn').prop('disabled', selGate !== 'Auto.php' || !stopped);
    $('#wooTutorialWindowsBtn').prop('disabled', selGate !== 'Auto.php' || !stopped);
    $('#amazon_region').prop('disabled', selGate !== 'Amazon.php');
    $('#amazon_cookie').prop('disabled', selGate !== 'Amazon.php');
    if(stopped) {
        $("#btn-start").prop("disabled", false);
        $("#btn-stop").prop("disabled", true);
    } else {
        $("#btn-start").prop("disabled", true);
        $("#btn-stop").prop("disabled", false);
    }
}

function updateAmazonHelperLink() {
    const regionSelect = document.getElementById('amazon_region');
    const helperLinkSpan = document.getElementById('amazon-cookie-helper-link');
    if (!regionSelect || !helperLinkSpan) { if (helperLinkSpan) $(helperLinkSpan).hide(); return; }
    const selectedRegion = regionSelect.value;
    let linkUrl = ''; let linkText = 'GET COOKIE FROM THIS PAGE';
    switch (selectedRegion) {
        case 'it': linkUrl = 'https://www.amazon.it/ax/account/manage'; break;
        case 'ca': linkUrl = 'https://www.amazon.ca/ax/account/manage'; break;
        case 'us': linkUrl = 'https://www.amazon.com/ax/account/manage'; break;
        case 'mx': linkUrl = 'https://www.amazon.com.mx/ax/account/manage'; break;
        case 'jp': linkUrl = 'https://www.amazon.co.jp/ax/account/manage'; break;
    }
    if (linkUrl) $(helperLinkSpan).html(`(<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" title="Go to Amazon Account Management">${linkText}</a>)`).show();
    else $(helperLinkSpan).html('').hide();
}

function resetApplication(elements) {
    if (!stopped) {
        $('#btn-stop').trigger('click');
        toastr.info("Checker was stopped before resetting.");
    }

    $('#lista_approved, #lista_aprovadas, #lista_reprovadas').empty();
    approvedItems = 0; liveResultItems = 0; declinedItems = 0; errorItems = 0; totalItems = 0; testedItems = 0;
    
    const keysToRemove = [
        'themeAccentColor', 'theme', 'gateValue', 'link_site_value', 
        'manualCookieValue', 'amazonRegionValue', 'amazonCookieValue', 'binValue',
        'gencvvValue', 'genqtyValue', 'monthValue', 'yearValue',
        'inputValue', 'proxyInputValue', 'proxyTypeValue', 'proxyEnabled', 'checkerSpeedValue'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));

    elements.binIn.val('');
    elements.cvvIn.val('');
    elements.qtyIn.val('10');
    elements.inputList.val('');
    elements.manualCookie.val('');
    elements.linkSite.val('');
    elements.amazonCookie.val('');
    elements.proxyInput.val('');
    
    elements.moIn.val('Random');
    elements.yrIn.val('Random');
    elements.gate.val('Amazon.php');
    elements.amazonRegion.val('it');
    elements.proxyType.val('http');
    elements.checkerSpeed.val('1');

    elements.proxyToggle.prop('checked', false);
    
    // Explicitly find and call the globally scoped functions
    window.applyTheme('dark'); 
    window.applyAccentColor('#97bc52');
    
    updateStats();
    updateCardListCount();
    updateConditionalInputs();
    updateProxyInputs();
    
    if (typeof createSnakes === 'function') {
        createSnakes();
    }
    
    toastr.success("Application has been reset to default.", "RESET COMPLETE");
}

$(document).ready(function() {
    const background = document.querySelector('.background');
    for (let i = 0; i < 15; i++) {
        const size = Math.floor(Math.random() * 120) + 30;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = Math.floor(Math.random() * 15) + 15;
        const delay = Math.random() * 15;
        
        const box = document.createElement('div');
        box.className = 'box';
        box.style.width = `${size}px`;
        box.style.height = `${size}px`;
        box.style.left = `${left}%`;
        box.style.top = `${top}%`;
        box.style.animationDuration = `${duration}s`;
        box.style.animationDelay = `${delay}s`;
        
        background.appendChild(box);
    }
    
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const snakes = [];
    const snakeCount = 7;
    
    window.createSnakes = function() {
        snakes.length = 0;
        const accentRgb = window.getAccentRgb();
        if (!accentRgb || !accentRgb.r) return;

        for (let i = 0; i < snakeCount; i++) {
            snakes.push({
                points: [],
                length: Math.floor(Math.random() * 15) + 10,
                width: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 1,
                color: `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${Math.random() * 0.4 + 0.2})`,
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                angle: Math.random() * Math.PI * 2,
                angleSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }
    
    function drawSnakes() {
        if (snakes.length === 0) window.createSnakes();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        snakes.forEach(snake => {
            snake.angle += snake.angleSpeed;
            snake.x += Math.cos(snake.angle) * snake.speed;
            snake.y += Math.sin(snake.angle) * snake.speed;
            
            if (snake.x < 0) snake.x = canvas.width;
            if (snake.x > canvas.width) snake.x = 0;
            if (snake.y < 0) snake.y = canvas.height;
            if (snake.y > canvas.height) snake.y = 0;
            
            snake.points.unshift({ x: snake.x, y: snake.y });
            
            if (snake.points.length > snake.length) {
                snake.points.pop();
            }
            
            ctx.beginPath();
            if (snake.points[0]) {
               ctx.moveTo(snake.points[0].x, snake.points[0].y);
            }
            
            for (let i = 1; i < snake.points.length; i++) {
                ctx.lineTo(snake.points[i].x, snake.points[i].y);
            }
            
            ctx.strokeStyle = snake.color;
            ctx.lineWidth = snake.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(snake.x, snake.y, snake.width * 2, 0, Math.PI * 2);
            ctx.fillStyle = snake.color;
            ctx.fill();
        });
        
        requestAnimationFrame(drawSnakes);
    }
    
    drawSnakes();

    const elements = {
        gate: $('#gate'), linkSite: $('#link_site'), manualCookie: $('#manual_cookie'),
        amazonRegion: $('#amazon_region'), amazonCookie: $('#amazon_cookie'), amazonCookieHelper: $('#amazon-cookie-helper-link'),
        inputList: $('#input-list'), paymentIcon: $('#paymentIcon'), genBtn: $('#generateBtn'), copyGenBtn: $('#copyGenBtn'),
        startBtn: $('#btn-start'), stopBtn: $('#btn-stop'), cleanAllBtn: $('#btn-clean-all'),
        binIn: $('#bin'), cvvIn: $('#gencvv'), qtyIn: $('#genqty'), moIn: $('#month'), yrIn: $('#year'),
        manCookieGrp: $('#manual_cookie_group'), linkSiteGrp: $('#link_site_group'), amazonRegionGrp: $('#amazon_region_group'),
        gateCreditsDisplay: $('#gate-credits-display'), approvedList: $('#lista_approved'), liveList: $('#lista_aprovadas'),
        declinedList: $('#lista_reprovadas'), copyApprovedBtn: $('.btn-copy-approved'), copyLiveBtn: $('.btn-copy-live'),
        clearDeclinedBtn: $('.btn-trash'),
        wooTutorialAndroidBtn: $('#wooTutorialAndroidBtn'), wooTutorialWindowsBtn: $('#wooTutorialWindowsBtn'),
        wooTutorialGrp: $('#woocommerce_tutorial_group'),
        proxyToggle: $('#proxy-toggle'), proxyToggleWrapper: $('.proxy-toggle-wrapper'), proxySettingsContainer: $('#proxy-settings-container'),
        proxyInput: $('#proxy_input'), proxyType: $('#proxy_type'),
        checkerSpeed: $('#checker-speed'),
        resetBtn: $('#resetDataBtn')
    };

    elements.gate.val(localStorage.getItem('gateValue') || 'Amazon.php');
    elements.linkSite.val(localStorage.getItem('link_site_value') || '');
    elements.manualCookie.val(localStorage.getItem('manualCookieValue') || '');
    elements.amazonRegion.val(localStorage.getItem('amazonRegionValue') || 'it');
    elements.amazonCookie.val(localStorage.getItem('amazonCookieValue') || '');
    elements.binIn.val(localStorage.getItem('binValue') || '');
    elements.cvvIn.val(localStorage.getItem('gencvvValue') || '');
    elements.qtyIn.val(localStorage.getItem('genqtyValue') || '10');
    elements.moIn.val(localStorage.getItem('monthValue') || 'Random');
    elements.yrIn.val(localStorage.getItem('yearValue') || 'Random');
    const savedList = localStorage.getItem('inputValue') || '';
    if (savedList) elements.inputList.val(extractValidCCFormat(savedList));
    elements.proxyInput.val(localStorage.getItem('proxyInputValue') || '');
    elements.proxyType.val(localStorage.getItem('proxyTypeValue') || 'http');
    const proxyEnabled = localStorage.getItem('proxyEnabled') === 'true';
    elements.proxyToggle.prop('checked', proxyEnabled);
    elements.checkerSpeed.val(localStorage.getItem('checkerSpeedValue') || '1');
    elements.checkerSpeed.on('change', function() {
        localStorage.setItem('checkerSpeedValue', $(this).val());
    });
    updateCardListCount();
    updateStats();

    const updateProxyInputs = () => {
        if (elements.proxyToggle.is(':checked')) {
            elements.proxySettingsContainer.slideDown(200);
        } else {
            elements.proxySettingsContainer.slideUp(200);
        }
    };

    const updateConditionalInputs = () => {
        const selGate = elements.gate.val();
        elements.proxyToggleWrapper.show();
        elements.manCookieGrp.hide();
        elements.linkSiteGrp.hide();
        elements.amazonRegionGrp.hide();
        elements.amazonCookieHelper.hide();
        elements.gateCreditsDisplay.hide().html('');
        elements.wooTutorialGrp.hide();

        const icons = {
            'Paypal.php': 'https://cdn.iconscout.com/icon/free/png-512/free-paypal-logo-icon-download-in-svg-png-gif-file-formats--bitcoin-payment-social-media-pack-logos-icons-5582514.png?f=webp&w=512',
            'Payflow.php': 'https://startup.network/upload/iblock/9e9/Payflow_logo_vertical-_1_.png',
            'Vbv.php': 'https://cdn3.iconfinder.com/data/icons/leto-finance-money-1/64/credit_card_aproove_check_validation-512.png',
            'Auto.php': 'https://maksimer.com/wp-content/uploads/sites/3/2023/08/woocommerce-icon-3d-purple.png',
            'Amazon.php': 'https://cdn-icons-png.flaticon.com/512/14079/14079391.png'
        };
        elements.manualCookie.prop('disabled', true);
        elements.linkSite.prop('disabled', true);
        elements.amazonRegion.prop('disabled', true);
        elements.amazonCookie.prop('disabled', true);
        elements.wooTutorialAndroidBtn.prop('disabled', true);
        elements.wooTutorialWindowsBtn.prop('disabled', true);

        let creditText = `GATE CREDITS: <a href="https://t.me/Venex444" target="_blank" rel="noopener noreferrer"><i class="fab fa-telegram"></i> ＶＥＮＥＸ 新ドラゴン</a>`;

        if (selGate === "Auto.php") {
            elements.manCookieGrp.show();
            elements.linkSiteGrp.show();
            elements.wooTutorialGrp.show();
            elements.manualCookie.prop('disabled', false);
            elements.linkSite.prop('disabled', false);
            elements.wooTutorialAndroidBtn.prop('disabled', !stopped);
            elements.wooTutorialWindowsBtn.prop('disabled', !stopped);
        } else if (selGate === "Amazon.php") {
            elements.amazonRegionGrp.show();
            elements.amazonRegion.prop('disabled', false);
            elements.amazonCookie.prop('disabled', false);
            updateAmazonHelperLink();
            creditText = `AMAZON GATE CREDITS: <a href="https://t.me/PladixOficial" target="_blank" rel="noopener noreferrer"><i class="fab fa-telegram"></i> PLADIX_OFICIAL</a>`;
            elements.proxyToggleWrapper.hide();
        }
        elements.gateCreditsDisplay.html(creditText).show();
        elements.paymentIcon.attr('src', icons[selGate] || icons['Paypal.php']);
    };
    updateConditionalInputs();
    updateProxyInputs();

    elements.gate.on('change', function() {
        localStorage.setItem('gateValue', $(this).val());
        updateConditionalInputs();
        ['manualCookie', 'linkSite', 'amazonCookie'].forEach(id => $(`#${id}`).removeClass('is-invalid-input'));
    });
    elements.linkSite.on('input', function() { localStorage.setItem('link_site_value', $(this).val()); $(this).removeClass('is-invalid-input'); });
    elements.manualCookie.on('input', function() { localStorage.setItem('manualCookieValue', $(this).val()); $(this).removeClass('is-invalid-input'); });
    elements.amazonRegion.on('change', function() { localStorage.setItem('amazonRegionValue', $(this).val()); updateAmazonHelperLink(); });
    elements.amazonCookie.on('input', function() { localStorage.setItem('amazonCookieValue', $(this).val()); $(this).removeClass('is-invalid-input');});
    elements.binIn.on('input', function() {
        localStorage.setItem('binValue', $(this).val());
        elements.cvvIn.trigger('input');
    });
    elements.cvvIn.on('input', function() {
        const binVal = elements.binIn.val().trim();
        let isAmexForCVV = false;
        if (binVal.startsWith('34') || binVal.startsWith('37')) {
            isAmexForCVV = true;
        }
        $(this).val(cleanGenCVV($(this).val(), isAmexForCVV));
        localStorage.setItem('gencvvValue', $(this).val());
    });
    elements.qtyIn.on('input change', function() {
        $(this).val(cleanAndValidateQuantity($(this).val()));
        localStorage.setItem('genqtyValue', $(this).val());
    });
    elements.moIn.on('change', function() { localStorage.setItem('monthValue', $(this).val()); });
    elements.yrIn.on('change', function() { localStorage.setItem('yearValue', $(this).val()); });
    elements.inputList.on('input paste', function() {
        const el = this;
        const originalVal = el.value;
        setTimeout(() => {
            if (!stopped) {
                console.warn("Checker is running, input list modification skipped.");
                return;
            }
            const currentVal = $(el).val();
            const convertedContent = extractValidCCFormat(currentVal);
            if (currentVal !== convertedContent) {
                 $(el).val(convertedContent);
                 if (originalVal.length > convertedContent.length + 5 && convertedContent.length > 0) {
                     toastr.info("INVALID FORMATS CONVERTED/REMOVED.", "LIST CLEANED", { timeOut: 1500 });
                 } else if (originalVal.length > 0 && convertedContent.length === 0 && originalVal !== "") {
                     toastr.info("NO VALID CARDS FOUND AFTER PARSING.", "LIST CLEANED", { timeOut: 1500 });
                 }
            }
            localStorage.setItem('inputValue', convertedContent);
            updateCardListCount();
        }, 50);
    });

    elements.proxyToggle.on('change', function() {
        localStorage.setItem('proxyEnabled', $(this).is(':checked'));
        updateProxyInputs();
    });
    elements.proxyInput.on('input', function() { localStorage.setItem('proxyInputValue', $(this).val()); });
    elements.proxyType.on('change', function() { localStorage.setItem('proxyTypeValue', $(this).val()); });

    elements.genBtn.on('click', generate);
    elements.copyGenBtn.on('click', copyGeneratedList);
    
    elements.resetBtn.on('click', function() {
        Swal.fire({
            title: 'RESET ALL SETTINGS?',
            text: "THIS WILL CLEAR ALL INPUTS, RESULTS, AND RESTORE DEFAULT SETTINGS (INCLUDING THEME AND COLORS). THIS ACTION CANNOT BE UNDONE.",
            ICON: 'WARNING',
            showCancelButton: true,
            confirmButtonText: 'YES, RESET!',
            background: document.body.classList.contains('light-mode') ? 'var(--lm-bg-secondary)' : 'var(--bg-secondary)',
            customClass: { popup: 'swal-custom' }
        }).then((result) => {
            if (result.isConfirmed) {
                resetApplication(elements);
            }
        });
    });

    elements.startBtn.on('click', function() {
         if (!stopped) { toastr.warning("CHECKER IS ALREADY RUNNING."); return; }
         let listContent = elements.inputList.val().trim();
         listContent = extractValidCCFormat(listContent);
         if (!listContent) {
             toastr.warning("NO VALID CARDS TO CHECK.", "INPUT ERROR");
             elements.inputList.focus().val('');
             updateCardListCount();
             return;
         }
         elements.inputList.val(listContent);
         updateCardListCount();

         maxThreads = parseInt(elements.checkerSpeed.val(), 10) || 1;

         if (elements.proxyToggle.is(':checked') && !elements.proxyInput.val().trim()) {
            toastr.error("PROXY MODE IS ON, BUT PROXY LIST IS EMPTY.", "PROXY ERROR");
            elements.proxyInput.focus();
            return;
         }

         currentGateForBatch = elements.gate.val();
         let gateValid = true;
         ['manualCookie', 'linkSite', 'amazonCookie'].forEach(id => $(`#${id}`).removeClass('is-invalid-input'));

         if (currentGateForBatch === "Auto.php") {
             if (!elements.manualCookie.val().trim()) { elements.manualCookie.addClass('is-invalid-input'); gateValid = false; }
             if (!elements.linkSite.val().trim()) { elements.linkSite.addClass('is-invalid-input'); gateValid = false; }
             if (!gateValid) { toastr.warning("WOOCOMMERCE REQUIRES COOKIE AND LINK.", "INPUT MISSING"); return; }
         } else if (currentGateForBatch === "Amazon.php") {
             if (!elements.amazonCookie.val().trim()) {
                 elements.amazonCookie.addClass('is-invalid-input');
                 toastr.warning("AMAZON REQUIRES COOKIE.", "INPUT MISSING");
                 return;
             }
         }

         processingQueue = listContent.split('\n').filter(Boolean).slice();
         totalItems = processingQueue.length;
         testedItems = 0;
         if ($("#lista_reprovadas > div").length > 0) $("#lista_reprovadas").empty();
         declinedItems = 0;
         errorItems = 0;
         activeThreads = 0;
         stopped = false;
         updateStats();
         toastr.info(`STARTING CHECK FOR ${totalItems} CARDS VIA ${$('#gate option:selected').text()}...`);
         $("#checker-status").attr("class", "badge-venex badge-info").html('<i class="fas fa-cog fa-spin"></i> STARTING CHECK...');
         disableInputs();
         processQueue();
    });

    elements.stopBtn.on('click', function() {
         if (stopped) return;
         stopped = true;
         processingQueue = [];
         currentGateForBatch = '';
        if (activeAjaxRequests.length > 0) {
            toastr.warning("STOPPING... CANCELLING REQUESTS.", "PROCESSING", {timeOut: 2000});
            console.log(`STOPPING. ABORTING ${activeAjaxRequests.length} REQUESTS.`);
        }
        [...activeAjaxRequests].forEach(req => {
            try { if (req && typeof req.abort === 'function') req.abort(); }
            catch (e) { console.warn("ERROR ABORTING REQUEST:", e); }
        });
        activeAjaxRequests = [];

        setTimeout(() => {
             activeThreads = 0;
             $("#checker-status").attr("class", "badge-venex badge-secondary").html('<i class="fas fa-stop"></i> STOPPED.');
             toastr.info("CHECKER STOPPED. REQUESTS CANCELLED.");
             enableInputs();
             updateStats();
        }, 500);
    });

    elements.cleanAllBtn.on('click', function() {
        Swal.fire({
            title: 'CLEAR ALL RESULTS?',
            text: "THIS CLEARS ALL CHECKER RESULTS AND COUNTERS.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--status-success)',
            cancelButtonColor: 'var(--status-declined)',
            confirmButtonText: 'YES, CLEAR!',
            background: document.body.classList.contains('light-mode') ? 'var(--lm-bg-secondary)' : 'var(--bg-secondary)',
            customClass: { popup: 'swal-custom' }
        }).then((result) => {
            if (result.isConfirmed) {
                $("#lista_approved, #lista_aprovadas, #lista_reprovadas").empty();
                approvedItems = 0; liveResultItems = 0; declinedItems = 0; errorItems = 0; testedItems = 0;
                updateStats();
                toastr.success("ALL RESULTS CLEARED.");
            }
        })
    });
    elements.copyApprovedBtn.on('click', function() { var listContent = getTextFromDivWithNewlines('lista_approved'); copyToClipboardHelper(listContent, this); });
    elements.copyLiveBtn.on('click', function() { var listContent = getTextFromDivWithNewlines('lista_aprovadas'); copyToClipboardHelper(listContent, this); });
    elements.clearDeclinedBtn.on('click', function() {
        Swal.fire({
            title: 'CLEAR DECLINED/ERRORS?',
            text: "CLEARS ONLY DECLINED/ERROR LIST AND COUNTER.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--status-success)',
            cancelButtonColor: 'var(--status-declined)',
            confirmButtonText: 'YES, CLEAR!',
            background: document.body.classList.contains('light-mode') ? 'var(--lm-bg-secondary)' : 'var(--bg-secondary)',
            customClass: { popup: 'swal-custom' }
        }).then((result) => {
            if (result.isConfirmed) {
                $('#lista_reprovadas').empty();
                declinedItems = 0; errorItems = 0;
                updateStats();
                toastr.success("DECLINED/ERROR LIST CLEARED.");
            }
        })
    });

    elements.wooTutorialAndroidBtn.on('click', function() {
        Swal.fire({
            title: 'WOOCOMMERCE ANDROID TUTORIAL',
            html: `<video width="100%" height="auto" controls autoplay playsinline><source src="android_tutorial.mp4" type="video/mp4">Your browser does not support video playback.</video>`,
            showConfirmButton: false, width: '80vw', maxWidth: '800px',
            background: document.body.classList.contains('light-mode') ? 'var(--lm-bg-secondary)' : 'var(--bg-secondary)',
            customClass: { popup: 'swal-custom swal-embed', title: 'swal-custom-title', htmlContainer: 'swal-custom-html-container' },
            showCloseButton: true,
            onOpen: () => { const vid = Swal.getHtmlContainer().querySelector('video'); if (vid) vid.play().catch(e => console.warn("Android tutorial video autoplay prevented:", e)); }
        });
    });

    elements.wooTutorialWindowsBtn.on('click', function() {
        Swal.fire({
            title: 'WOOCOMMERCE WINDOWS TUTORIAL',
            html: `<video width="100%" height="auto" controls autoplay playsinline><source src="windows_tutorial.mp4" type="video/mp4">Your browser does not support video playback.</video>`,
            showConfirmButton: false, width: '80vw', maxWidth: '800px',
            background: document.body.classList.contains('light-mode') ? 'var(--lm-bg-secondary)' : 'var(--bg-secondary)',
            customClass: { popup: 'swal-custom swal-embed', title: 'swal-custom-title', htmlContainer: 'swal-custom-html-container' },
            showCloseButton: true,
            onOpen: () => { const vid = Swal.getHtmlContainer().querySelector('video'); if (vid) vid.play().catch(e => console.warn("Windows tutorial video autoplay prevented:", e)); }
        });
    });

    enableInputs();
    updateConditionalInputs();
});
