

'use strict';
/* ══════════════════════════════════════════════════
   IncomeWave — Complete JS
   Single clean script block, no Cloudflare interference
══════════════════════════════════════════════════ */

var G={
  txns:[],raw:[],hdrs:[],rowData:[],
  fxRates:{},country:'IN',regime:'new',baseCur:'INR',
  plan:'free',loaded:false,charts:{},
  adminPw:'IW@Guru#2026',
  payments:[],codes:[],users:[],
  payPlan:'pro',latestCode:'',
  mapDate:-1,mapCredit:-1,mapDebit:-1,mapDesc:-1,mapBal:-1,mapCur:-1,
  skipRows:0,_adminUnlocked:false
};
var RZP={pro:'https://rzp.io/rzp/WIlR7IA8',business:'https://rzp.io/rzp/VoTVJ6lo'};

/* ── ROUTING ── */
function goPage(id){
  var cur=document.querySelector('.page.on');
  if(cur){cur.style.opacity='0';cur.style.transform='translateY(6px)';cur.style.transition='opacity .15s,transform .15s';}
  setTimeout(function(){
    document.querySelectorAll('.page').forEach(function(p){
      p.classList.remove('on');p.style.opacity='';p.style.transform='';p.style.transition='';
    });
    var e=document.getElementById('page-'+id);
    if(e){
      e.classList.add('on');
      e.style.opacity='0';e.style.transform='translateY(10px)';
      requestAnimationFrame(function(){
        e.style.transition='opacity .3s ease,transform .3s ease';
        e.style.opacity='1';e.style.transform='translateY(0)';
      });
    }
    window.scrollTo(0,0);
    setTimeout(function(){
      document.querySelectorAll('.reveal:not(.visible)').forEach(function(el){
        var r=el.getBoundingClientRect();
        if(r.top<window.innerHeight)el.classList.add('visible');
      });
    },100);
  },150);
}
function showDV(id,btn){
  document.querySelectorAll('.dv').forEach(function(v){v.classList.remove('on');});
  document.querySelectorAll('.sb-btn').forEach(function(b){b.classList.remove('on');});
  var e=document.getElementById('dv-'+id);
  if(e){e.classList.add('on');e.style.animation='none';e.offsetHeight;e.style.animation='';}
  if(btn)btn.classList.add('on');
  /* Mobile: reset scroll position when switching tabs */
  var main=document.querySelector('.dash-main');
  if(main)main.scrollTop=0;
  window.scrollTo(0,0);
}
function showAV(id,btn){
  document.querySelectorAll('.av').forEach(function(v){v.classList.remove('on');});
  document.querySelectorAll('.asb-btn').forEach(function(b){b.classList.remove('on');});
  var e=document.getElementById(id);if(e)e.classList.add('on');
  if(btn)btn.classList.add('on');
}
function openM(id){var e=document.getElementById(id);if(e){e.classList.add('open');document.body.style.overflow='hidden';}}
function closeM(id){var e=document.getElementById(id);if(e){e.classList.remove('open');document.body.style.overflow='';}}
document.addEventListener('click',function(e){
  if(e.target&&e.target.classList.contains('modal')){e.target.classList.remove('open');document.body.style.overflow='';}
});
function notify(msg,type){
  type=type||'ok';
  var e=document.getElementById('notif');
  e.textContent=msg;e.className='notif '+type+' show';
  clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('show');},3800);
}

/* ── PROCESSING OVERLAY ── */
function showProc(s){var e=document.getElementById('proc-overlay');if(e)e.classList[s?'add':'remove']('show');}
function setProcStep(n,st){
  for(var i=1;i<=5;i++){
    var e=document.getElementById('psi-'+i);if(!e)continue;
    e.className='psi';
    if(i<n)e.classList.add('done');
    else if(i===n)e.classList.add(st||'active');
  }
}
function setProcText(t,s){
  var te=document.getElementById('proc-title'),se=document.getElementById('proc-sub');
  if(te)te.textContent=t||'';if(se)se.textContent=s||'';
}

/* ── DATE PARSER — Indian DD/MM/YYYY always first ── */
function parseDate(s){
  if(!s)return null;
  s=String(s).replace(/"/g,'').trim();
  if(!s||s==='-'||s==='--'||s.toLowerCase()==='nil'||s.toLowerCase()==='n/a')return null;
  /* Strip time component: "01-03-2026 07:28:09" -> "01-03-2026" */
  s=s.replace(/\s+\d{1,2}:\d{2}(:\d{2})?(\s*(AM|PM))?$/i,'').trim();

  var MONTHS={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,
    january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,october:9,november:10,december:11};
  var m,d1,d2,d3,yr;

  // Excel serial (5 digits like 45678)
  if(/^\d{5}$/.test(s)){
    var ed=new Date((parseInt(s)-25569)*86400000);
    if(!isNaN(ed.getTime())&&ed.getFullYear()>1990&&ed.getFullYear()<2100)return ed;
  }

  // YYYY-MM-DD (ISO — unambiguous, parse first)
  m=s.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})$/);
  if(m)return new Date(parseInt(m[1]),parseInt(m[2])-1,parseInt(m[3]));

  // DD/MM/YYYY  DD-MM-YYYY  DD.MM.YYYY — Indian standard, ALWAYS prefer DD/MM
  m=s.match(/^(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{2,4})$/);
  if(m){
    d1=parseInt(m[1]);d2=parseInt(m[2]);d3=parseInt(m[3]);
    if(d3<100)d3+=d3>50?1900:2000;
    if(d1>12)return new Date(d3,d2-1,d1);   // must be DD/MM
    if(d2>12)return new Date(d3,d1-1,d2);   // must be MM/DD (rare for India)
    return new Date(d3,d2-1,d1);            // ambiguous → treat as DD/MM (Indian)
  }

  // DD-Mon-YYYY  e.g. 15-Jan-2025, 15 Jan 2025, 15/Jan/25
  m=s.match(/^(\d{1,2})[\s\-\/]([A-Za-z]{3,9})[\s\-\/](\d{2,4})$/);
  if(m){
    var mo=MONTHS[m[2].toLowerCase()];
    if(mo!==undefined){
      yr=parseInt(m[3]);if(yr<100)yr+=yr>50?1900:2000;
      var dt=new Date(yr,mo,parseInt(m[1]));
      if(!isNaN(dt.getTime()))return dt;
    }
  }

  // Mon DD YYYY  e.g. Jan 15 2025
  m=s.match(/^([A-Za-z]{3,9})\s(\d{1,2}),?\s*(\d{2,4})$/);
  if(m){
    var mo2=MONTHS[m[1].toLowerCase()];
    if(mo2!==undefined){yr=parseInt(m[3]);if(yr<100)yr+=yr>50?1900:2000;return new Date(yr,mo2,parseInt(m[2]));}
  }

  // DDMMYYYY without separator e.g. 15012025
  m=s.match(/^(\d{2})(\d{2})(\d{4})$/);
  if(m){d1=parseInt(m[1]);d2=parseInt(m[2]);d3=parseInt(m[3]);if(d1>=1&&d1<=31&&d2>=1&&d2<=12)return new Date(d3,d2-1,d1);}

  return null;
}

/* ── AMOUNT PARSER ── */
function parseAmt(s){
  if(s===null||s===undefined||s==='')return null;
  s=String(s).replace(/"/g,'').trim();
  if(!s||s==='-'||s==='--'||s.toLowerCase()==='nil'||s.toLowerCase()==='n/a')return null;
  s=s.replace(/[\u20b9$\u00a3\u20ac\s]/g,'');   // strip ₹ $ £ € and spaces
  s=s.replace(/,/g,'');                          // strip all commas (handles 1,00,000)
  if(!s||s==='-')return null;
  if(/^\(.*\)$/.test(s))return -Math.abs(parseFloat(s.replace(/[()]/g,''))||0);
  var drm=s.match(/^([\d.]+)\s*(Dr|DR|D\.R\.|dr)$/i);if(drm)return -Math.abs(parseFloat(drm[1]));
  var crm=s.match(/^([\d.]+)\s*(Cr|CR|C\.R\.|cr)$/i);if(crm)return Math.abs(parseFloat(crm[1]));
  var v=parseFloat(s);if(isNaN(v))return null;
  /* Round to 2 decimal places max (handles PDF extraction artifacts like 9956.528) */
  return Math.round(v*100)/100;
}

/* ── HEADER ROW DETECTION ── */
function detectHeaderRow(rows){
  var TXNKW=['date','narration','description','particulars','debit','credit','balance',
             'amount','withdrawal','deposit','transaction','tran','ref','dr','cr',
             'withdrawal amt','deposit amt','closing balance','chq','value dt','remarks'];
  /* Bank-info keywords — rows containing these are NOT the header */
  var INFOKW=['account no','account number','branch','ifsc','micr','cust id','customer id',
              'opening balance','closing bal','statement from','statement of','page no',
              'address','phone','email','pan','gstin','nomination','joint holder',
              'od limit','currency','a/c open','generated','registered office'];
  var best=-1,bestScore=0;
  /* Search up to 60 rows — some banks have long header blocks */
  for(var i=0;i<Math.min(60,rows.length);i++){
    var row=rows[i];if(!row||!row.length)continue;
    var rowStr=row.join(' ').toLowerCase().trim();
    /* Skip pure separator rows (all asterisks, dashes, equals) */
    if(/^[\*\-\=\_\s]+$/.test(rowStr))continue;
    /* Skip blank rows */
    if(rowStr.length<3)continue;
    var score=0;
    TXNKW.forEach(function(k){if(rowStr.indexOf(k)!==-1)score+=2;});
    /* Penalise bank-info rows heavily */
    INFOKW.forEach(function(k){if(rowStr.indexOf(k)!==-1)score-=4;});
    /* Penalise rows with very long individual cells (bank info, not headers) */
    var maxLen=0;row.forEach(function(cell){if(String(cell||'').length>maxLen)maxLen=String(cell||'').length;});
    if(maxLen>80)score-=5;
    if(maxLen>40&&maxLen<80)score-=2;
    /* Reward rows with multiple short cells (real header cells are short) */
    var shortCells=row.filter(function(c){var l=String(c||'').trim().length;return l>2&&l<30;}).length;
    score+=Math.min(shortCells,5);
    if(score>bestScore){bestScore=score;best=i;}
  }
  return bestScore>=2?best:0;
}

/* ── COLUMN DETECTION ── */
function detectCols(hdrs){
  /* Each header cell might contain multi-word text like "Withdrawal Amt." */
  var h=hdrs.map(function(x){return String(x||'').toLowerCase().trim();});

  function find(terms){
    var bestCol=-1,bestScore=0;
    for(var i=0;i<h.length;i++){
      var cell=h[i];
      for(var j=0;j<terms.length;j++){
        if(cell.indexOf(terms[j])!==-1){
          /* Score by how specific the match is */
          var s=terms[j].length-(j*0.5); /* earlier terms = higher score */
          if(s>bestScore){bestScore=s;bestCol=i;}
        }
      }
    }
    return bestCol;
  }

  /* Special: if header is one long cell (some PDFs), split and re-search */
  var isSingleCell=hdrs.length<=2&&h[0]&&h[0].length>30;
  if(isSingleCell){
    /* Try splitting on 2+ spaces */
    var parts=h[0].split(/\s{2,}/);
    if(parts.length>=3){
      h=parts;
      hdrs=parts;
    }
  }

  /* Score-based find: try multi-word phrases first (more specific), then single words */
  function findBest(termGroups){
    /* termGroups = [[highPriority terms], [medPriority], [lowPriority]] */
    for(var g=0;g<termGroups.length;g++){
      var col=find(termGroups[g]);
      if(col>=0)return col;
    }
    return -1;
  }

  var dateCol=findBest([
    ['txn date','tran date','trans date','transaction date','value date'],
    ['date','posted','posting']
  ]);
  var creditCol=findBest([
    ['deposit amt','deposit amount','credit amt','credit amount'],
    ['deposits','credits'],
    ['credit','deposit','cr amt','money in','inflow','received']
  ]);
  var debitCol=findBest([
    ['withdrawal amt','withdrawal amount','debit amt','debit amount'],
    ['withdrawals','debits'],
    ['withdrawal','debit','dr amt','money out','outflow','paid']
  ]);
  /* If credit and debit found the same column, reset debit */
  if(creditCol>=0 && debitCol===creditCol) debitCol=-1;
  /* If only one amount column found, check if it's named "amount" (single-col format) */
  if(creditCol<0 && debitCol<0){
    creditCol=find(['amount','tran amt','net amount','transaction amount']);
  }

  return{
    date: dateCol,
    credit: creditCol,
    debit: debitCol,
    desc: findBest([
      ['narration','description','particulars','transaction details','transaction narration'],
      ['details','remarks','memo','payee','beneficiary'],
      ['trans','mode','particular']
    ]),
    balance: findBest([
      ['closing balance','running balance','available balance'],
      ['balance','bal']
    ]),
    currency: find(['currency','ccy','curr']),
    refno: find(['chq./ref.no.','chq/ref','ref no','reference no','cheque no','txn id','utr'])
  };
}

/* ── FILE HANDLING ── */
function handleFile(e){
  var file=e.target.files[0];if(!file)return;
  var ext=file.name.split('.').pop().toLowerCase();
  showProc(true);setProcText('Reading '+ext.toUpperCase()+' file…','Detecting format');setProcStep(1,'active');
  if(ext==='xlsx'||ext==='xls'){readExcel(file);}
  else if(ext==='pdf'){readPDF(file);}
  else if(ext==='ofx'||ext==='qfx'){readOFX(file);}
  else{var r=new FileReader();r.onload=function(ev){parseCSVText(ev.target.result);};r.readAsText(file);}
}
function readExcel(file){
  var r=new FileReader();
  r.onload=function(e){
    try{
      setProcStep(1,'done');setProcStep(2,'active');
      var wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});
      var ws=wb.Sheets[wb.SheetNames[0]];
      var rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:''});
      processRawRows(rows);
    }catch(err){showProc(false);notify('Could not read Excel file. Try exporting as CSV from your bank.','warn');}
  };
  r.readAsArrayBuffer(file);
}
function readPDF(file){
  setProcText('Reading PDF…','Loading PDF reader');
  setProcStep(1,'active');
  function doPDF(){
    if(typeof pdfjsLib==='undefined'){setTimeout(doPDF,300);return;}
    var r=new FileReader();
    r.onload=function(e){
      var data=new Uint8Array(e.target.result);
      setProcStep(1,'done');setProcStep(2,'active');
      setProcText('Extracting PDF text…','Reading every page');
      pdfjsLib.getDocument({data:data}).promise.then(function(pdf){
        var total=pdf.numPages,done=0,pageItems=[];
        for(var pg=1;pg<=total;pg++){
          (function(pn){
            pdf.getPage(pn).then(function(page){return page.getTextContent();})
            .then(function(content){
              /* Store raw items with position — sort by page,Y desc,X asc */
              var items=content.items.map(function(it){
                return{str:it.str.trim(),x:it.transform[4],y:it.transform[5],h:it.height||10,page:pn};
              }).filter(function(it){return it.str.length>0;});
              pageItems.push({page:pn,items:items});
              done++;
              if(done===total){
                /* Combine all pages sorted by page then Y desc */
                var allItems=[];
                pageItems.sort(function(a,b){return a.page-b.page;});
                pageItems.forEach(function(p){allItems=allItems.concat(p.items);});
                setProcStep(2,'done');
                parsePDFItems(allItems);
              }
            }).catch(function(){done++;if(done===total)parsePDFItems([]);});
          })(pg);
        }
      }).catch(function(err){
        console.error('PDF error:',err);
        showProc(false);
        var msg=String((err&&err.message)||err||'').toLowerCase();
        if(msg.indexOf('password')>=0||msg.indexOf('encrypted')>=0){
          showPDFPasswordModal();
        }else{
          notify('Could not open this PDF. Please export as CSV or Excel from your bank portal.','err');
        }
      });
    };
    r.readAsArrayBuffer(file);
  }
  doPDF();
}

function showPDFPasswordModal(){
  var ex=document.getElementById("pdf-pw-modal");if(ex)ex.remove();
  var overlay=document.createElement("div");
  overlay.id="pdf-pw-modal";
  overlay.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;animation:fadeIn .2s ease";
  overlay.innerHTML=
    '<div style="background:#fff;border-radius:20px;padding:2rem;max-width:420px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,.25);text-align:center">'+
    '<div style="font-size:2.5rem;margin-bottom:.75rem">&#128274;</div>'+
    '<div style="font-family:var(--f2);font-size:1.2rem;font-weight:800;margin-bottom:.5rem">Password-Protected PDF</div>'+
    '<p style="color:var(--t2);font-size:.88rem;margin-bottom:1.2rem;line-height:1.6">This PDF is password-protected. Remove the password first, then upload again.</p>'+
    '<div style="background:var(--gbg);border:1.5px solid var(--gbd);border-radius:var(--r);padding:1rem;margin-bottom:1.2rem;text-align:left">'+
    '<div style="font-size:.78rem;font-weight:700;color:var(--g3);margin-bottom:.5rem">How to remove the password:</div>'+
    '<div style="font-size:.78rem;color:var(--t2);line-height:1.9">'+
    '<b>ilovepdf.com (easiest)</b><br>Visit ilovepdf.com &rarr; Unlock PDF &rarr; Upload &rarr; Download<br><br>'+
    '<b>Google Chrome</b><br>Open PDF in Chrome &rarr; Enter password &rarr; Print &rarr; Save as PDF<br><br>'+
    '<b>Best option:</b> Download as CSV or Excel from your bank portal instead</div></div>'+
    '<div style="display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap">'+
    '<a href="https://www.ilovepdf.com/unlock_pdf" target="_blank" style="background:var(--green);color:#fff;padding:.6rem 1.3rem;border-radius:10px;font-size:.84rem;font-weight:700;text-decoration:none">Remove Password &rarr;</a>'+
    '<button onclick="document.getElementById(\'pdf-pw-modal\').remove()" style="background:var(--gbg);border:1.5px solid var(--gbd);color:var(--g3);padding:.6rem 1.3rem;border-radius:10px;font-size:.84rem;font-weight:700;cursor:pointer">Close</button></div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener("click",function(e){if(e.target===overlay)overlay.remove();});
}

function showPDFFailModal(rawCount,txnCount){
  var ex=document.getElementById("pdf-fail-modal");if(ex)ex.remove();
  var diag="";
  if(rawCount===0)diag="The PDF appears to be a <b>scanned image</b> (no text found). IncomeWave reads text-based PDFs only.";
  else if(txnCount===0)diag="Text found ("+rawCount+" lines) but <b>no transaction dates detected</b>. This format may not be supported yet.";
  else diag="Found "+txnCount+" date lines but could not parse amounts correctly.";
  var overlay=document.createElement("div");
  overlay.id="pdf-fail-modal";
  overlay.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;animation:fadeIn .2s ease";
  overlay.innerHTML=
    '<div style="background:#fff;border-radius:20px;padding:2rem;max-width:460px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,.25)">'+
    '<div style="display:flex;align-items:center;gap:.7rem;margin-bottom:1rem">'+
    '<div style="font-size:2rem">&#128196;</div>'+
    '<div style="font-family:var(--f2);font-size:1.1rem;font-weight:800">Could Not Read This PDF</div></div>'+
    '<div style="background:var(--rbg);border-radius:var(--r);padding:.9rem;font-size:.84rem;color:#991b1b;margin-bottom:1.1rem">'+diag+'</div>'+
    '<div style="background:var(--gbg);border:1.5px solid var(--gbd);border-radius:var(--r);padding:1rem;margin-bottom:1.1rem">'+
    '<div style="font-size:.78rem;font-weight:700;color:var(--g3);margin-bottom:.5rem">Recommended: Export as CSV or Excel from your bank</div>'+
    '<div style="font-size:.78rem;color:var(--t2);line-height:1.9">'+
    '<b>HDFC:</b> Net Banking &rarr; My Accounts &rarr; Statement &rarr; Download Excel<br>'+
    '<b>ICICI:</b> iMobile &rarr; Accounts &rarr; Statement &rarr; Export CSV<br>'+
    '<b>SBI:</b> YONO &rarr; Account Statement &rarr; Download Excel<br>'+
    '<b>Axis:</b> Net Banking &rarr; Accounts &rarr; Statement &rarr; Excel Download<br>'+
    '<b>Any bank:</b> Look for Download / Export &rarr; choose CSV or Excel</div></div>'+
    '<div style="display:flex;gap:.7rem;justify-content:flex-end;flex-wrap:wrap">'+
    '<button onclick="document.getElementById(\'pdf-fail-modal\').remove();showDV(\'upload\',document.getElementById(\'sb-upload\'))" '+
    'style="background:var(--green);color:#fff;padding:.6rem 1.3rem;border-radius:10px;font-size:.84rem;font-weight:700;cursor:pointer;border:none">Upload Again</button>'+
    '<button onclick="document.getElementById(\'pdf-fail-modal\').remove()" style="background:var(--gbg);border:1.5px solid var(--gbd);color:var(--g3);padding:.6rem 1.3rem;border-radius:10px;font-size:.84rem;font-weight:700;cursor:pointer">Close</button></div></div>';
  document.body.appendChild(overlay);
  overlay.addEventListener("click",function(e){if(e.target===overlay)overlay.remove();});
}

function parsePDFItems(allItems){
  setProcStep(2,'done');setProcStep(3,'active');
  setProcText('Converting PDF to table…','Reading every line');

  if(!allItems.length){
    showProc(false);
    notify('PDF appears empty or scanned. Please export as CSV/Excel from your bank portal.','warn');
    return;
  }

  /* === STEP 1: Group PDF text items into visual rows (8px Y tolerance) === */
  var sorted=allItems.slice().sort(function(a,b){
    return a.page!==b.page?a.page-b.page:b.y-a.y;
  });
  var rowGroups=[],cur=null;
  sorted.forEach(function(item){
    var s=item.str.trim();if(!s)return;
    if(!cur||item.page!==cur.page||Math.abs(item.y-cur.y)>8){
      if(cur)rowGroups.push(cur);
      cur={y:item.y,page:item.page,items:[item]};
    }else{cur.items.push(item);}
  });
  if(cur)rowGroups.push(cur);
  rowGroups.forEach(function(row){row.items.sort(function(a,b){return a.x-b.x;});});

  /* === STEP 2: Each visual row -> one clean text string === */
  var rawLines=rowGroups.map(function(row){
    return row.items.map(function(it){return it.str.trim();}).join(' ').replace(/\s{2,}/g,' ').trim();
  }).filter(function(t){return t.length>1;});

  console.log('PDF: '+rawLines.length+' raw lines');
  rawLines.slice(0,20).forEach(function(l,i){console.log('  '+i+': '+l.substring(0,90));});

  /* === STEP 3: Merge continuation rows into single transaction lines ===
     A transaction STARTS with DD/MM/YY.
     All following non-date rows belong to that transaction (wrapped text, split amounts). */
  var DATE_RE=/^(?:\d{4}[-\/\.]\d{2}[-\/\.]\d{2}\b|\d{1,2}[-\/\.]\d{2}[-\/\.]\d{2,4}\b)/;
  var txnLines=[],curr=null;
  rawLines.forEach(function(line){
    if(DATE_RE.test(line)){if(curr!==null)txnLines.push(curr);curr=line;}
    else{if(curr!==null)curr=curr+' '+line;}
  });
  if(curr!==null)txnLines.push(curr);
  console.log('PDF: '+txnLines.length+' merged transaction lines');
  txnLines.slice(0,5).forEach(function(l,i){console.log('  T'+i+': '+l.substring(0,90));});

  if(!txnLines.length){
    showProc(false);
    notify('No transactions found in this PDF. Please export as CSV/Excel from your bank portal.','warn');
    return;
  }

  /* === STEP 4: Split each line into structured columns ===
     Output: [Date, Narration, Ref, Value Dt, Withdrawal, Deposit, Balance]
     Uses balance-change to determine withdrawal vs deposit (100% accurate). */
  function extractTrailingNums(line){
    var toks=line.trim().split(/\s+/),nums=[];
    for(var i=toks.length-1;i>=0;i--){
      if(/^\d{1,10}(?:\.\d{1,2})?$/.test(toks[i]))nums.unshift(toks[i]);
      else break;
    }
    return nums;
  }

  var grid=[['Date','Narration','Chq./Ref.No.','Value Dt','Withdrawal Amt.','Deposit Amt.','Closing Balance']];
  var prevBal=null;

  txnLines.forEach(function(line){
    var trailing=extractTrailingNums(line);
    if(trailing.length<2)return; /* need amount + balance minimum */

    var balance=parseFloat(trailing[trailing.length-1]);
    if(isNaN(balance))return;

    /* Remove trailing numbers from body */
    var body=line.trim();
    for(var ti=trailing.length-1;ti>=0;ti--){
      var li2=body.lastIndexOf(trailing[ti]);
      if(li2>0)body=body.slice(0,li2).trim();
    }

    /* Extract leading date */
    var dm=body.match(/^(\d{1,2}[\/\-\.]\d{2}[\/\-\.]\d{2,4})\s*/);
    if(!dm)return;
    var txnDate=dm[1];
    body=body.slice(dm[0].length).trim();

    /* Remove value date (second date occurrence) */
    var valueDate='';
    var vd=body.match(/\b(\d{1,2}[\/\-\.]\d{2}[\/\-\.]\d{2,4})\b/);
    if(vd){valueDate=vd[1];body=(body.slice(0,vd.index)+body.slice(vd.index+vd[0].length)).trim();}

    /* Remove standalone ref number (12-16 consecutive digits not embedded in UPI string) */
    var refNo='';
    var rd=body.match(/(?<![\-\/\w])(\d{12,16})(?![\-\/\w])/);
    if(rd){refNo=rd[1];body=(body.slice(0,rd.index)+body.slice(rd.index+rd[0].length)).trim();}

    var narration=body.replace(/\s{2,}/g,' ').trim()||'Transaction';

    /* Determine withdrawal vs deposit using BALANCE CHANGE (most reliable method) */
    var amtNums=trailing.slice(0,-1); /* all trailing except balance */
    var amtVal=parseFloat(amtNums[0])||0;
    if(amtVal<=0)return;

    var withdrawal='',deposit='';
    if(prevBal!==null){
      var diff=balance-prevBal;
      var tol=Math.max(0.05,amtVal*0.005);
      if(Math.abs(diff-amtVal)<tol)       deposit=amtNums[0];    /* balance went up = credit */
      else if(Math.abs(diff+amtVal)<tol)  withdrawal=amtNums[0]; /* balance went down = debit */
      else{
        /* Balance doesn't reconcile exactly (rounding or multi-step) — use keywords */
        var lu=line.toUpperCase();
        if(/\b(NEFT CR|IMPS CR|UPI CR|RTGS CR|UPIRET|SALARY|INTEREST PAID|CASHBACK|REFUND|REVERSAL|CREDIT BY|INWARD)\b/.test(lu))
          deposit=amtNums[0];
        else
          withdrawal=amtNums[0];
      }
    }else{
      /* First row: use keywords */
      var lu2=line.toUpperCase();
      if(/\b(NEFT CR|IMPS CR|UPI CR|RTGS CR|UPIRET|SALARY|INTEREST PAID|CASHBACK|REFUND|REVERSAL|CREDIT BY|INWARD)\b/.test(lu2))
        deposit=amtNums[0];
      else
        withdrawal=amtNums[0];
    }
    prevBal=balance;

    if(!withdrawal&&!deposit)return;
    grid.push([txnDate,narration,refNo,valueDate,withdrawal,deposit,balance.toString()]);
  });

  console.log('PDF grid: '+grid.length+' rows (including header)');
  if(grid[1])console.log('First data row: '+grid[1].join(' | '));
  if(grid[2])console.log('Second data row: '+grid[2].join(' | '));

  if(grid.length<2){
    showProc(false);
    showPDFFailModal(rawLines.length,txnLines.length);
    return;
  }

  setProcStep(3,'done');

  /* === STEP 5: Feed the grid to processRawRows ===
     This is EXACTLY what readExcel does with its rows.
     detectHeaderRow -> finds row 0 (our explicit header)
     detectCols -> maps Date/Narration/Withdrawal Amt./Deposit Amt./Closing Balance
     buildMapperUI -> shows mapper with all columns pre-selected correctly
     User verifies -> clicks Import -> processWithMapping runs accurately */
  processRawRows(grid);
}


function readOFX(file){
  var r=new FileReader();
  r.onload=function(e){
    var text=e.target.result,txns=[];
    var re=/<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi,m;
    while((m=re.exec(text))!==null){
      var b=m[1];
      var dt=(b.match(/<DTPOSTED>([\d]+)/)||[])[1]||'';
      var amt=(b.match(/<TRNAMT>([-\d.]+)/)||[])[1]||'0';
      var memo=(b.match(/<MEMO>([^<\n]+)/)||[])[1]||'';
      var nm=(b.match(/<n>([^<\n]+)/)||[])[1]||'';
      var date=null;
      if(dt.length>=8)date=new Date(parseInt(dt.slice(0,4)),parseInt(dt.slice(4,6))-1,parseInt(dt.slice(6,8)));
      if(date){var a=parseFloat(amt)||0;txns.push({id:gid(),date:date,amount:a,desc:memo||nm||'Transaction',cat:classify(memo||nm,a),cur:'INR',conf:3});}
    }
    if(txns.length){G.txns=txns;G.loaded=true;finishProcessing();}
    else{showProc(false);notify('Could not read OFX. Try CSV instead.','warn');}
  };
  r.readAsText(file);
}
function parseCSVText(text){
  setProcStep(1,'done');setProcStep(2,'active');
  var lines=text.split('\n').map(function(l){return l.trim();}).filter(function(l){return l.length>0;});
  if(lines.length<2){showProc(false);notify('File appears to be empty.','warn');return;}
  var sep=detectSep(lines[0]);
  var rows=lines.map(function(l){return splitLine(l,sep);});
  processRawRows(rows);
}
function detectSep(line){
  var counts={',':0,'\t':0,'|':0,';':0};
  Object.keys(counts).forEach(function(k){counts[k]=(line.match(new RegExp('\\'+k,'g'))||[]).length;});
  return Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];})[0];
}
function splitLine(line,sep){
  var r=[],cur='',q=false;
  for(var i=0;i<line.length;i++){
    var ch=line[i];
    if(ch==='"')q=!q;
    else if(ch===sep&&!q){r.push(cur.trim());cur='';}
    else cur+=ch;
  }
  r.push(cur.trim());
  return r.map(function(s){return s.replace(/^"|"$/g,'').trim();});
}
function processRawRows(rows){
  rows=rows.filter(function(r){return r.some(function(c){return String(c||'').trim().length>0;});});
  G.rowData=rows;
  var hr=detectHeaderRow(rows);G.skipRows=hr;
  var hdrs=rows[hr]||[];G.hdrs=hdrs;
  var cols=detectCols(hdrs);
  G.mapDate=cols.date;G.mapCredit=cols.credit;G.mapDebit=cols.debit;
  G.mapDesc=cols.desc;G.mapBal=cols.balance;G.mapCur=cols.currency;
  setProcStep(2,'done');showProc(false);
  buildMapperUI(hdrs,rows,hr);
  showDV('mapper',null);
}
function buildMapperUI(hdrs,rows,hr){
  function mkOpts(sel,selected){
    sel.innerHTML='';
    hdrs.forEach(function(h,i){
      var o=document.createElement('option');o.value=i;
      o.textContent=h||('Column '+(i+1));
      if(i===selected)o.selected=true;
      sel.appendChild(o);
    });
  }
  var sd=document.getElementById('map-date'),sc=document.getElementById('map-credit');
  var sdb=document.getElementById('map-debit'),sdsc=document.getElementById('map-desc');
  var sb=document.getElementById('map-balance'),scu=document.getElementById('map-currency');
  if(sd)mkOpts(sd,G.mapDate);if(sc)mkOpts(sc,G.mapCredit);
  if(sdb){
    sdb.innerHTML='<option value="-1">— Same column as credit —</option>';
    hdrs.forEach(function(h,i){var o=document.createElement('option');o.value=i;o.textContent=h||('Col '+(i+1));if(i===G.mapDebit)o.selected=true;sdb.appendChild(o);});
  }
  if(sdsc)mkOpts(sdsc,G.mapDesc);
  if(sb){sb.innerHTML='<option value="-1">— Skip —</option>';hdrs.forEach(function(h,i){var o=document.createElement('option');o.value=i;o.textContent=h||('Col '+(i+1));if(i===G.mapBal)o.selected=true;sb.appendChild(o);});}
  if(scu){scu.innerHTML='<option value="-1">— All same currency —</option>';hdrs.forEach(function(h,i){var o=document.createElement('option');o.value=i;o.textContent=h||('Col '+(i+1));if(i===G.mapCur)o.selected=true;scu.appendChild(o);});}
  var dr=rows.length-hr-1;
  var ma=document.getElementById('mapper-msg');
  if(ma)ma.innerHTML='File loaded! <strong>'+dr+' data rows</strong>'+(hr>0?' (skipped '+hr+' bank header row'+(hr>1?'s':'')+')':'')+'.';
  refreshMapperPreview();
}
function refreshMapperPreview(){
  G.mapDate=parseInt((document.getElementById('map-date')||{}).value||'-1');
  G.mapCredit=parseInt((document.getElementById('map-credit')||{}).value||'-1');
  G.mapDebit=parseInt((document.getElementById('map-debit')||{}).value||'-1');
  G.mapDesc=parseInt((document.getElementById('map-desc')||{}).value||'-1');
  G.mapBal=parseInt((document.getElementById('map-balance')||{}).value||'-1');
  G.mapCur=parseInt((document.getElementById('map-currency')||{}).value||'-1');
  var tb=document.getElementById('mapper-tbody');if(!tb)return;
  var start=G.skipRows+1;
  var preview=G.rowData.slice(start,start+6);
  tb.innerHTML=preview.map(function(row){
    var rd=G.mapDate>=0?(row[G.mapDate]||''):'';
    var rc=G.mapCredit>=0?(row[G.mapCredit]||''):'';
    var rdb=G.mapDebit>=0?(row[G.mapDebit]||''):'';
    var rdesc=G.mapDesc>=0?(row[G.mapDesc]||''):'';
    var d=parseDate(rd);
    var cAmt=parseAmt(rc),dAmt=parseAmt(rdb);
    var amount=null,type='';
    if(G.mapDebit>=0&&G.mapDebit!==G.mapCredit){
      if(dAmt&&Math.abs(dAmt)>0){amount=-Math.abs(dAmt);type='<span style="color:var(--red)">💸 Out</span>';}
      else if(cAmt&&Math.abs(cAmt)>0){amount=Math.abs(cAmt);type='<span style="color:var(--g3)">💰 In</span>';}
    }else{if(cAmt!==null){amount=cAmt;type=cAmt>=0?'<span style="color:var(--g3)">💰 In</span>':'<span style="color:var(--red)">💸 Out</span>';}}
    var dateStr=d?d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'<span style="color:var(--red)">⚠ '+rd+'</span>';
    var amtStr=amount!==null?'<strong style="color:'+(amount>=0?'var(--g3)':'var(--red)')+';">'+(amount>=0?'+':'–')+'₹'+Math.abs(amount).toLocaleString('en-IN')+'</strong>':'—';
    return '<tr><td>'+dateStr+'</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(rdesc||'—')+'</td><td>'+amtStr+'</td><td>'+type+'</td></tr>';
  }).join('');
}
function processWithMapping(){
  refreshMapperPreview();
  G._prevBalance=null; /* reset balance tracking for direction detection */
  showProc(true);setProcText('Processing transactions…','Reading every row');setProcStep(3,'active');
  setTimeout(function(){
    var txns=[],start=G.skipRows+1;
    for(var i=start;i<G.rowData.length;i++){
      var row=G.rowData[i];
      if(!row||row.every(function(c){return !String(c||'').trim();}))continue;
      var rawDate=G.mapDate>=0?row[G.mapDate]:'';
      var rawCredit=G.mapCredit>=0?row[G.mapCredit]:'';
      var rawDebit=G.mapDebit>=0?row[G.mapDebit]:'';
      var rawDesc=G.mapDesc>=0?row[G.mapDesc]:(row[1]||row[0]||'');
      var rawCur=G.mapCur>=0?row[G.mapCur]:G.baseCur;
      var date=parseDate(rawDate);
      if(!date||isNaN(date.getTime())||date.getFullYear()<1990||date.getFullYear()>2050)continue;
      var amount=null;
      var cAmt=parseAmt(rawCredit),dAmt=parseAmt(rawDebit);
      if(G.mapDebit>=0&&G.mapDebit!==G.mapCredit){
        /* Separate debit and credit columns */
        var hasD=dAmt!==null&&Math.abs(dAmt)>0;
        var hasC=cAmt!==null&&Math.abs(cAmt)>0;
        if(hasD&&!hasC)       amount=-Math.abs(dAmt);   /* withdrawal only */
        else if(hasC&&!hasD)  amount=Math.abs(cAmt);    /* deposit only */
        else if(hasD&&hasC)   amount=Math.abs(cAmt)-Math.abs(dAmt); /* both (rare) */
        else continue; /* both empty - skip row */
      }else{
        /* Single amount column - use sign or balance change */
        if(cAmt===null||cAmt===0)continue;
        /* Use balance column to determine direction if available */
        var rawBal=G.mapBal>=0?row[G.mapBal]:'';
        var balAmt=parseAmt(rawBal);
        if(balAmt!==null&&G._prevBalance!==undefined&&G._prevBalance!==null){
          var diff=balAmt-G._prevBalance;
          var tol=Math.max(0.1,Math.abs(cAmt)*0.01);
          if(Math.abs(diff-Math.abs(cAmt))<tol)       amount=Math.abs(cAmt);
          else if(Math.abs(diff+Math.abs(cAmt))<tol)  amount=-Math.abs(cAmt);
          else                                          amount=cAmt; /* fallback: use sign */
        }else{
          amount=cAmt; /* use as-is (positive=in, negative=out) */
        }
        if(balAmt!==null)G._prevBalance=balAmt;
      }
      var desc=String(rawDesc||'').trim()||'Transaction';
      var cur=String(rawCur||G.baseCur).replace(/"/g,'').trim().toUpperCase();
      if(!cur||cur.length>4)cur=G.baseCur||'INR';
      var cat=classify(desc,amount);
      txns.push({id:gid(),date:date,amount:amount,desc:desc,cat:cat,cur:cur,conf:cScore(desc,cat)});
    }
    setProcStep(3,'done');setProcStep(4,'active');
    setTimeout(function(){
      G.txns=txns.sort(function(a,b){return b.date-a.date;});
      setProcStep(4,'done');setProcStep(5,'active');
      setTimeout(function(){
        setProcStep(5,'done');showProc(false);
        if(!txns.length){notify('No valid transactions found. Please check the column mapping.','warn');showDV('mapper',null);return;}
        G.loaded=true;renderAll();showDV('overview',document.getElementById('sb-overview'));
        notify(txns.length+' transactions imported successfully!');
      },600);
    },600);
  },200);
}
function finishProcessing(){
  G.loaded=true;
  for(var i=1;i<=5;i++)setProcStep(i,'done');
  showProc(false);renderAll();
  showDV('overview',document.getElementById('sb-overview'));
  notify(G.txns.length+' transactions loaded!');
}
function gid(){return 'tx_'+Math.random().toString(36).substr(2,9);}
function doDrag(e,o){e.preventDefault();var z=document.getElementById('upload-zone');if(z)z.classList[o?'add':'remove']('over');}
function doDrop(e){
  e.preventDefault();doDrag(e,false);
  var f=e.dataTransfer.files[0];
  if(f){var inp=document.getElementById('file-input');var dt=new DataTransfer();dt.items.add(f);inp.files=dt.files;handleFile({target:inp});}
}

/* ── SAMPLE DATA ── */
function loadSamples(){
  showProc(true);setProcText('Loading sample data…','6 months of example transactions');
  var pool=[
    {d:'Upwork Payment — React Dashboard Project',a:85000,c:'Income'},
    {d:'Toptal Project Milestone — API Integration',a:120000,c:'Income'},
    {d:'Freelance Consulting Fee',a:45000,c:'Income'},
    {d:'Fiverr Logo Design Package',a:15000,c:'Income'},
    {d:'Client Invoice — Website Redesign',a:95000,c:'Income'},
    {d:'Payoneer Transfer from US Client',a:72000,c:'Income'},
    {d:'Wise Transfer GBP',a:38000,c:'Income'},
    {d:'Uber Ride — Client Meeting',a:-320,c:'Travel'},
    {d:'IndiGo Airlines BLR to BOM',a:-4800,c:'Travel'},
    {d:'Adobe Creative Cloud Subscription',a:-4600,c:'Software'},
    {d:'GitHub Pro Monthly',a:-700,c:'Software'},
    {d:'AWS EC2 Instance',a:-2300,c:'Software'},
    {d:'Figma Professional Subscription',a:-1200,c:'Software'},
    {d:'Amazon — Monitor Stand',a:-2800,c:'Shopping'},
    {d:'Zomato Order — Working Lunch',a:-450,c:'Food'},
    {d:'Starbucks — Client Coffee',a:-680,c:'Food'},
    {d:'Airtel Broadband Monthly',a:-899,c:'Utilities'},
    {d:'Jio Mobile Recharge',a:-599,c:'Utilities'},
  ];
  var txns=[],now=new Date();
  for(var mo=5;mo>=0;mo--){
    var mDate=new Date(now.getFullYear(),now.getMonth()-mo,1);
    var sub=pool.slice().sort(function(){return Math.random()-.5;}).slice(0,10+Math.floor(Math.random()*7));
    sub.forEach(function(s){
      txns.push({id:gid(),date:new Date(mDate.getFullYear(),mDate.getMonth(),1+Math.floor(Math.random()*27)),amount:Math.round(s.a*(0.78+Math.random()*.44)),desc:s.d,cat:s.c,cur:'INR',conf:5});
    });
  }
  G.txns=txns.sort(function(a,b){return b.date-a.date;});G.loaded=true;
  for(var i=1;i<=5;i++)setProcStep(i,'done');
  setProcText('Ready!',G.txns.length+' sample transactions loaded');
  setTimeout(function(){showProc(false);renderAll();showDV('overview',document.getElementById('sb-overview'));goPage('dashboard');notify('Sample data loaded!');},700);
}

/* ── CLASSIFIER ── */
var CATS=[
  {c:'Income',k:['upwork','toptal','fiverr','freelancer.com','payoneer','wise','transferwise','neft cr','imps cr','upi cr','rtgs cr','credited','deposit','trf cr','inward','incoming','received','payment from','amount credited','salary','payroll','wages','stipend','invoice','retainer','consulting fee','project payment','milestone','interest cr','dividend','maturity','bonus','refund','cashback','reversal','credit']},
  {c:'Food',k:['zomato','swiggy','dunzo','blinkit','zepto','bigbasket','grofers','dominos','pizza hut','kfc','mcdonalds','burger king','subway','starbucks','cafe coffee','ccd','barista','haldiram','barbeque','restaurant','dining','canteen','cafeteria','food court','dhaba','bakery','sweet shop','instamart','fresh to home','licious','milkbasket','box8','faasos']},
  {c:'Travel',k:['uber','ola','rapido','namma yatri','meru','indigo','air india','spicejet','vistara','akasa','irctc','indian railways','train ticket','ksrtc','msrtc','redbus','abhibus','makemytrip','goibibo','yatra','cleartrip','ixigo','hotel','oyo','treebo','airbnb','booking.com','airport','fastag','petrol','diesel','hp petrol','bharat petroleum','iocl','metro','dmrc']},
  {c:'Software',k:['adobe','figma','sketch','notion','obsidian','evernote','slack','discord','zoom','loom','github','gitlab','jira','linear','asana','trello','monday','aws','amazon web services','azure','google cloud','digitalocean','linode','cloudflare','netlify','vercel','heroku','namecheap','godaddy','hostinger','openai','anthropic','claude','canva','photoshop','illustrator','dropbox','google one','icloud','spotify','youtube premium','hotstar','netflix','amazon prime','grammarly','stripe','paddle','sendgrid','mailchimp','webflow']},
  {c:'Shopping',k:['amazon','flipkart','myntra','ajio','nykaa','meesho','snapdeal','tata cliq','reliance digital','croma','vijay sales','decathlon','nike','adidas','puma','zara','uniqlo','westside','pantaloons','max fashion','ikea','urban ladder','pepperfry']},
  {c:'Groceries',k:['dmart','d-mart','big bazaar','reliance fresh','more supermarket','nature basket','mother dairy','amul','kirana','grocery','supermarket','hypermarket']},
  {c:'Housing',k:['rent','landlord','lease','flat rent','house rent','pg rent','maintenance charges','society maintenance','property tax','home loan','housing loan']},
  {c:'Utilities',k:['airtel','jio','vi ','vodafone','bsnl','idea','act fibernet','hathway','excitel','tata sky','dish tv','sun direct','d2h','gas bill','indane','hp gas','bharatgas','recharge','mobile recharge','postpaid','broadband','wifi','electricity','bescom','msedcl','lpg','cylinder']},
  {c:'Health',k:['apollo pharmacy','medplus','1mg','netmeds','pharmeasy','hospital','clinic','doctor','lab test','diagnostics','apollo hospital','fortis','max hospital','manipal','gym','cult.fit','yoga','fitness','health insurance','star health','medicine','dental','physiotherapy']},
  {c:'Education',k:['udemy','coursera','skillshare','linkedin learning','byjus','byju','vedantu','unacademy','physicswallah','toppr','school fee','college fee','tuition','coaching','exam fee','textbook','workshop','bootcamp']},
  {c:'Investment',k:['mutual fund','mf purchase','sip','zerodha','groww','kuvera','paytm money','nse','bse','stock','equity','ipo','ppf','nps','elss','fixed deposit','recurring deposit','digital gold','sovereign gold bond']},
  {c:'Transfer',k:['neft dr','imps dr','upi dr','rtgs dr','transfer to','trf to','sent to','debit','debited','withdrawal','withdrawn','atm withdrawal','cash withdrawal','credit card payment','loan emi','personal loan','insurance premium','lic premium']}
];
function classify(desc,amount){
  var d=String(desc||'').toLowerCase();
  for(var i=0;i<CATS.length;i++){
    var r=CATS[i];
    for(var j=0;j<r.k.length;j++)if(d.indexOf(r.k[j])!==-1)return r.c;
  }
  if(/\bsalar(y|ies)?\b|\bwages?\b|\bpayroll\b/i.test(desc))return 'Income';
  if(/upi.{0,10}cr\b|neft.{0,10}cr\b|imps.{0,10}cr\b/i.test(desc))return 'Income';
  if(/upi.{0,10}dr\b|neft.{0,10}dr\b|imps.{0,10}dr\b/i.test(desc))return 'Transfer';
  if(/\batm\b|cash\s*withdrawal/i.test(desc))return 'Transfer';
  if(/\bemi\b|credit\s*card\s*payment/i.test(desc))return 'Transfer';
  if(/interest|dividend|maturity/i.test(desc))return 'Income';
  if(/refund|reversal|cashback/i.test(desc))return 'Income';
  if(amount!==undefined&&amount>0)return 'Income';
  return 'Other';
}
function cScore(desc,cat){
  var r=CATS.find?CATS.find(function(x){return x.c===cat;}):null;
  if(!r)return 2;
  var d=desc.toLowerCase();
  return Math.min(5,r.k.filter(function(k){return d.indexOf(k)!==-1;}).length+2);
}
function catBadgeClass(c){
  var m={Income:'cat-income','Freelance Income':'cat-income',Salary:'cat-income','Other Income':'cat-income',
    Travel:'cat-travel',Software:'cat-software',Office:'cat-office',Shopping:'cat-office',
    Groceries:'cat-office',Housing:'cat-utilities',Health:'cat-software',Education:'cat-software',
    Food:'cat-food',Utilities:'cat-utilities',Transfer:'cat-other',Investment:'cat-software',Other:'cat-other'};
  return m[c]||'cat-other';
}
function reclassify(){
  if(!G.txns.length){notify('No transactions','warn');return;}
  G.txns=G.txns.map(function(t){var c=classify(t.desc,t.amount);return Object.assign({},t,{cat:c,conf:cScore(t.desc,c)});});
  renderTxTable();renderRecentTx();notify('Re-classified!');
}

/* ── METRICS ── */
function computeMetrics(){
  var txns=G.txns,byM={};
  txns.forEach(function(t){
    var k=t.date.getFullYear()+'-'+String(t.date.getMonth()+1).padStart(2,'0');
    if(!byM[k])byM[k]={inc:0,exp:0};
    if(t.amount>0)byM[k].inc+=t.amount;else byM[k].exp+=Math.abs(t.amount);
  });
  var months=Object.keys(byM).sort();
  var inc=months.map(function(m){return byM[m].inc;});
  var exp=months.map(function(m){return byM[m].exp;});
  var smooth=inc.map(function(_,i){var sl=inc.slice(Math.max(0,i-2),i+1);return sl.reduce(function(a,b){return a+b;},0)/sl.length;});
  var totalInc=txns.filter(function(t){return t.amount>0;}).reduce(function(s,t){return s+t.amount;},0);
  var totalExp=txns.filter(function(t){return t.amount<0;}).reduce(function(s,t){return s+Math.abs(t.amount);},0);
  var net=totalInc-totalExp;
  var now=new Date();
  var m0=new Date(now.getFullYear(),now.getMonth(),1);
  var m1=new Date(now.getFullYear(),now.getMonth()-1,1);
  var thisI=txns.filter(function(t){return t.date>=m0&&t.amount>0;}).reduce(function(s,t){return s+t.amount;},0);
  var lastI=txns.filter(function(t){return t.date>=m1&&t.date<m0&&t.amount>0;}).reduce(function(s,t){return s+t.amount;},0);
  var iPct=lastI?Math.round((thisI-lastI)/lastI*100):0;
  var catTot={};txns.filter(function(t){return t.amount<0;}).forEach(function(t){catTot[t.cat]=(catTot[t.cat]||0)+Math.abs(t.amount);});
  var annualI=totalInc*(12/Math.max(months.length,1));
  var qTax=Math.round(calcTax(annualI,G.country,G.regime)/4);
  var cum=0;var cumArr=months.map(function(m){cum+=byM[m].inc-byM[m].exp;return cum;});
  var last3=inc.slice(-3);var avgL3=last3.reduce(function(a,b){return a+b;},0)/(last3.length||1);
  var trend=last3.length>1?(last3[last3.length-1]-last3[0])/(last3.length-1)*0.3:0;
  var fcast=[1,2,3].map(function(_,i){return Math.max(0,Math.round(avgL3+trend*(i+1)));});
  var fcLbl=[1,2,3].map(function(i){var d=new Date(now.getFullYear(),now.getMonth()+i,1);return d.toLocaleString('default',{month:'short'});});
  var byCur={};txns.filter(function(t){return t.amount>0;}).forEach(function(t){byCur[t.cur]=(byCur[t.cur]||0)+t.amount;});
  var mLbls=months.map(function(mn){var p=mn.split('-');return new Date(+p[0],+p[1]-1).toLocaleString('default',{month:'short',year:'2-digit'});});
  return{byM:byM,months:months,inc:inc,exp:exp,smooth:smooth,totalInc:totalInc,totalExp:totalExp,net:net,
    thisI:thisI,lastI:lastI,iPct:iPct,catTot:catTot,annualI:annualI,qTax:qTax,
    cumArr:cumArr,fcast:fcast,fcLbl:fcLbl,mLbls:mLbls,byCur:byCur};
}
function daysToQ(){
  var n=new Date();
  var qs=[[3,15],[6,15],[9,15],[12,15]].map(function(p){return new Date(n.getFullYear(),p[0]-1,p[1]);});
  var nx=null;for(var i=0;i<qs.length;i++)if(qs[i]>n){nx=qs[i];break;}
  if(!nx)nx=new Date(n.getFullYear()+1,2,15);
  return Math.ceil((nx-n)/86400000);
}
function fmtINR(n){return'₹'+Math.abs(Math.round(n)).toLocaleString('en-IN');}

function renderAll(){
  var m=computeMetrics();
  renderKPIs(m);renderOvCharts(m);renderRecentTx();renderTxTable();renderDetailCharts(m);renderTaxView();renderFXView(m);renderProjects();updateInvPreview();
  var e=document.getElementById('ov-empty');if(e)e.style.display='none';
  var ec=document.getElementById('ov-content');if(ec)ec.style.display='block';
  var te=document.getElementById('tx-empty');if(te)te.style.display='none';
  var tc=document.getElementById('tx-content');if(tc)tc.style.display='block';
  var ce=document.getElementById('charts-empty');if(ce)ce.style.display='none';
  var cc=document.getElementById('charts-content');if(cc)cc.style.display='block';
  var s=document.getElementById('dash-sub');if(s)s.textContent=G.txns.length+' transactions · '+new Date().toLocaleString('en-IN');
}

/* ── RENDER KPIs ── */
function renderKPIs(m){
  var g=document.getElementById('kpi-grid');if(!g)return;
  var ph=m.iPct>=0?'<span class="kbadge kb-up">↑ '+Math.abs(m.iPct)+'% vs last month</span>':'<span class="kbadge kb-dn">↓ '+Math.abs(m.iPct)+'% vs last month</span>';
  g.innerHTML=[
    {cls:'income',l:'Total Income',v:fmtINR(m.totalInc),s:ph},
    {cls:'expense',l:'Total Expenses',v:fmtINR(m.totalExp),s:'<span style="color:var(--t3)">'+Object.keys(m.catTot).length+' categories</span>'},
    {cls:'profit',l:'Net Profit',v:fmtINR(m.net),s:'<span class="kbadge '+(m.net>=0?'kb-up':'kb-dn')+'">'+(m.net>=0?'Profitable':'Deficit')+'</span>'},
    {cls:'tax',l:'Quarterly Tax',v:fmtINR(m.qTax),s:'<span class="kbadge kb-warn">Due in '+daysToQ()+'d</span>'},
  ].map(function(k){return'<div class="kpi '+k.cls+'"><div class="kpi-lbl">'+k.l+'</div><div class="kpi-val">'+k.v+'</div><div class="kpi-sub">'+k.s+'</div></div>';}).join('');
}

/* ── CHARTS ── */
var CC={g:'rgba(0,200,150,',r:'rgba(239,68,68,',b:'rgba(59,130,246,',a:'rgba(245,158,11,',p:'rgba(139,92,246,'};
var GRID='rgba(0,0,0,.06)',TICK='#8aaa8a',FNT='Plus Jakarta Sans';
var BO={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:TICK,font:{family:FNT,size:11}}}}};
var SC={x:{ticks:{color:TICK,font:{family:FNT,size:10}},grid:{color:GRID}},y:{ticks:{color:TICK,font:{family:FNT,size:10},callback:function(v){return'₹'+v.toLocaleString('en-IN');}},grid:{color:GRID}}};
function mkC(id,cfg){if(G.charts[id])G.charts[id].destroy();var e=document.getElementById(id);if(e)G.charts[id]=new Chart(e,cfg);}
function renderOvCharts(m){
  var opts=Object.assign({},BO,{scales:SC});
  mkC('c-smooth',{type:'bar',data:{labels:m.mLbls,datasets:[{label:'Actual Income',data:m.inc,backgroundColor:CC.b+'0.18)',borderColor:CC.b+'0.4)',borderWidth:1,borderRadius:5},{label:'3-Month Avg',data:m.smooth,type:'line',fill:true,backgroundColor:CC.g+'0.08)',borderColor:CC.g+'0.9)',borderWidth:2.5,pointRadius:4,tension:0.4}]},options:opts});
  var cK=Object.keys(m.catTot),cC=[CC.r+'0.8)',CC.b+'0.8)',CC.a+'0.8)',CC.p+'0.8)','rgba(236,72,153,.8)','rgba(20,184,166,.8)','rgba(156,163,175,.7)'];
  mkC('c-donut',{type:'doughnut',data:{labels:cK,datasets:[{data:cK.map(function(k){return m.catTot[k];}),backgroundColor:cC,borderWidth:2,borderColor:'#fff',hoverOffset:8}]},options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'right',labels:{color:TICK,font:{family:FNT,size:11},boxWidth:10,padding:8}}}}});
  mkC('c-profit',{type:'bar',data:{labels:m.mLbls,datasets:[{label:'Net Profit',data:m.inc.map(function(v,i){return v-m.exp[i];}),backgroundColor:m.inc.map(function(v,i){return v-m.exp[i]>=0?CC.g+'0.7)':CC.r+'0.7)';}),borderRadius:6}]},options:Object.assign({},BO,{scales:SC,plugins:{legend:{display:false}}})});
  mkC('c-forecast',{type:'line',data:{labels:['Now'].concat(m.fcLbl),datasets:[{label:'Projected',data:[m.inc[m.inc.length-1]||0].concat(m.fcast),fill:true,backgroundColor:CC.a+'0.08)',borderColor:CC.a+'0.8)',borderWidth:2.5,borderDash:[6,4],pointRadius:5,tension:0.4}]},options:opts});
  mkC('c-cumul',{type:'line',data:{labels:m.mLbls,datasets:[{label:'Running Total',data:m.cumArr,fill:true,backgroundColor:CC.b+'0.07)',borderColor:CC.b+'0.8)',borderWidth:2.5,pointRadius:3,tension:0.4}]},options:Object.assign({},BO,{scales:SC,plugins:{legend:{display:false}}})});
}
function renderDetailCharts(m){
  mkC('c-big-smooth',{type:'bar',data:{labels:m.mLbls,datasets:[{label:'Actual Income',data:m.inc,backgroundColor:CC.b+'0.18)',borderColor:CC.b+'0.4)',borderWidth:1,borderRadius:6},{label:'Rolling Avg',data:m.smooth,type:'line',fill:true,backgroundColor:CC.g+'0.07)',borderColor:CC.g+'0.9)',borderWidth:3,pointRadius:5,tension:0.5}]},options:Object.assign({},BO,{scales:SC})});
  var cK=Object.keys(m.catTot),cC=[CC.r+'0.8)',CC.b+'0.8)',CC.a+'0.8)',CC.p+'0.8)','rgba(236,72,153,.8)','rgba(20,184,166,.8)','rgba(156,163,175,.7)'];
  mkC('c-cats2',{type:'doughnut',data:{labels:cK,datasets:[{data:cK.map(function(k){return m.catTot[k];}),backgroundColor:cC,borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,cutout:'60%',plugins:{legend:{position:'bottom',labels:{color:TICK,font:{family:FNT,size:10},boxWidth:9,padding:6}}}}});
  mkC('c-ive',{type:'bar',data:{labels:m.mLbls,datasets:[{label:'Income',data:m.inc,backgroundColor:CC.g+'0.6)',borderRadius:4},{label:'Expenses',data:m.exp,backgroundColor:CC.r+'0.6)',borderRadius:4}]},options:Object.assign({},BO,{scales:SC})});
  if(Object.keys(m.byCur).length)mkC('c-ccy',{type:'pie',data:{labels:Object.keys(m.byCur),datasets:[{data:Object.values(m.byCur),backgroundColor:[CC.g+'0.8)',CC.b+'0.8)',CC.a+'0.8)',CC.p+'0.8)'],borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:TICK,font:{family:FNT,size:10},boxWidth:9}}}}});
}
function renderFXView(m){
  var keys=Object.keys(m?m.byCur:{});
  if(keys.length)mkC('c-fx-pie',{type:'pie',data:{labels:keys,datasets:[{data:keys.map(function(k){return m.byCur[k];}),backgroundColor:[CC.g+'0.8)',CC.b+'0.8)',CC.a+'0.8)',CC.p+'0.8)'],borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:TICK,font:{family:FNT,size:10},boxWidth:9}}}}});
}

/* ── TRANSACTION TABLE ── */
function txHTML(txns){
  if(!txns.length)return'<div class="empty-state" style="padding:2.5rem"><div class="empty-icon">🔍</div><div class="empty-title">No results</div><p class="empty-desc">Try adjusting filters.</p></div>';
  return'<table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th></tr></thead><tbody>'+
  txns.map(function(t){
    var isIn=t.amount>=0;
    return'<tr><td style="white-space:nowrap;font-size:.78rem;color:var(--t3)">'+t.date.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+'</td>'+
    '<td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+t.desc+'</td>'+
    '<td><span class="cat-b '+catBadgeClass(t.cat)+'">'+t.cat+'</span></td>'+
    '<td style="font-size:.8rem;font-weight:600;color:'+(isIn?'var(--g3)':'var(--red)')+';">'+(isIn?'💰 In':'💸 Out')+'</td>'+
    '<td class="'+(isIn?'amt-in':'amt-out')+'">'+(isIn?'+':'–')+fmtINR(t.amount)+'</td></tr>';
  }).join('')+'</tbody></table>';
}
function renderRecentTx(){var e=document.getElementById('recent-tbl');if(!e)return;e.innerHTML=txHTML(G.txns.slice(0,10));var c=document.getElementById('recent-cnt');if(c)c.textContent='Showing 10 of '+G.txns.length;}
function renderTxTable(){
  var e=document.getElementById('tx-tbl');if(!e)return;
  var search=((document.getElementById('tx-search')||{}).value||'').toLowerCase();
  var cat=(document.getElementById('tx-cat')||{}).value||'';
  var type=(document.getElementById('tx-type')||{}).value||'';
  var txns=G.txns.filter(function(t){
    if(cat&&t.cat!==cat)return false;
    if(type==='in'&&t.amount<0)return false;
    if(type==='out'&&t.amount>=0)return false;
    if(search&&t.desc.toLowerCase().indexOf(search)===-1)return false;
    return true;
  });
  e.innerHTML=txHTML(txns);
  var c=document.getElementById('tx-count');if(c)c.textContent=txns.length+' transactions';
  var s=document.getElementById('tx-sub');if(s)s.textContent=txns.length+' transactions';
}

/* ── TAX ENGINE ── */
var TAX={
  IN:{name:'India',sym:'₹',fy:'FY 2025-26',
    new:{label:'New Regime (Budget 2025)',std:75000,rebate:1200000,cess:4,
      slabs:[{min:0,max:400000,r:0,l:'₹0–4L'},{min:400001,max:800000,r:5,l:'₹4L–8L'},{min:800001,max:1200000,r:10,l:'₹8L–12L'},{min:1200001,max:1600000,r:15,l:'₹12L–16L'},{min:1600001,max:2000000,r:20,l:'₹16L–20L'},{min:2000001,max:2400000,r:25,l:'₹20L–24L'},{min:2400001,max:Infinity,r:30,l:'Above 24L'}]},
    old:{label:'Old Regime',std:50000,rebate:500000,cess:4,
      slabs:[{min:0,max:250000,r:0,l:'₹0–2.5L'},{min:250001,max:500000,r:5,l:'₹2.5L–5L'},{min:500001,max:1000000,r:20,l:'₹5L–10L'},{min:1000001,max:Infinity,r:30,l:'Above 10L'}]},
    deadlines:[{n:'Q1 Advance Tax',d:'Jun 15, 2025'},{n:'Q2 Advance Tax',d:'Sep 15, 2025'},{n:'Q3 Advance Tax',d:'Dec 15, 2025'},{n:'Q4 Advance Tax',d:'Mar 15, 2026'},{n:'ITR Filing',d:'Jul 31, 2026'}],
    hints:'New Regime: Zero tax up to ₹12L via Sec 87A rebate\nSoftware/tools for work: 100% deductible\nHome office: proportional rent deductible\nLaptop/phone: 40% depreciation/year\n80C: ELSS, PPF, LIC up to ₹1.5L (Old Regime)'},
  US:{name:'USA',sym:'$',cur:'USD',fy:'2025',new:{label:'Self-Employed',std:15000,cess:0,seTax:15.3,slabs:[{min:0,max:11925,r:10,l:'$0–11,925'},{min:11926,max:48475,r:12,l:'up to $48,475'},{min:48476,max:Infinity,r:22,l:'above $48,475'}]},old:{label:'W-2',std:15000,cess:0,slabs:[{min:0,max:11925,r:10,l:'up to $11,925'},{min:11926,max:Infinity,r:12,l:'above'}]},deadlines:[{n:'Q1 Estimated',d:'Apr 15, 2025'},{n:'Annual Filing',d:'Apr 15, 2026'}],hints:'Home office deduction (Form 8829)\nHealth insurance 100% deductible\nSEP-IRA: up to 25% of net income'},
  UK:{name:'UK',sym:'£',cur:'GBP',fy:'2025-26',new:{label:'Self-Assessment',std:12570,cess:0,ni4:9,slabs:[{min:0,max:12570,r:0,l:'£0–12,570'},{min:12571,max:50270,r:20,l:'up to £50,270'},{min:50271,max:Infinity,r:40,l:'above £50,270'}]},old:{label:'PAYE',std:12570,cess:0,slabs:[{min:0,max:12570,r:0,l:'Personal Allowance'},{min:12571,max:Infinity,r:20,l:'Basic Rate'}]},deadlines:[{n:'Online Return',d:'Jan 31, 2026'},{n:'Tax Payment',d:'Jan 31, 2026'}],hints:'Personal Allowance £12,570 tax-free\nHome office: £6/week flat rate'},
  CA:{name:'Canada',sym:'CA$',cur:'CAD',fy:'2025',new:{label:'Self-Employed',std:16129,cess:0,slabs:[{min:0,max:57375,r:15,l:'$0–57,375'},{min:57376,max:Infinity,r:20.5,l:'above'}]},old:{label:'Employee',std:16129,cess:0,slabs:[{min:0,max:57375,r:15,l:'$0–57,375'},{min:57376,max:Infinity,r:20.5,l:'above'}]},deadlines:[{n:'T1 Filing',d:'Jun 15, 2026'}],hints:'RRSP contributions reduce taxable income'},
  AU:{name:'Australia',sym:'A$',cur:'AUD',fy:'2024-25',new:{label:'Sole Trader',std:0,cess:2,slabs:[{min:0,max:18200,r:0,l:'$0–18,200'},{min:18201,max:45000,r:19,l:'up to $45K'},{min:45001,max:120000,r:32.5,l:'up to $120K'},{min:120001,max:Infinity,r:37,l:'above $120K'}]},old:{label:'Same',std:0,cess:2,slabs:[{min:0,max:18200,r:0,l:'$0–18,200'},{min:18201,max:Infinity,r:19,l:'above'}]},deadlines:[{n:'Tax Return',d:'Oct 31, 2025'}],hints:'Home office: 67c/hour fixed rate'},
  DE:{name:'Germany',sym:'€',cur:'EUR',fy:'2025',new:{label:'Selbstständig',std:1230,cess:5.5,slabs:[{min:0,max:12084,r:0,l:'€0–12,084'},{min:12085,max:68430,r:14,l:'up to €68,430'},{min:68431,max:Infinity,r:42,l:'above'}]},old:{label:'Angestellt',std:1230,cess:5.5,slabs:[{min:0,max:12084,r:0,l:'Grundfreibetrag'},{min:12085,max:Infinity,r:14,l:'Progressiv'}]},deadlines:[{n:'Steuererklarung',d:'Sep 30, 2025'}],hints:'All business expenses deductible'},
  SG:{name:'Singapore',sym:'S$',cur:'SGD',fy:'YA 2025',new:{label:'Self-Employed',std:1000,cess:0,slabs:[{min:0,max:20000,r:0,l:'$0–20K'},{min:20001,max:30000,r:2,l:'up to $30K'},{min:30001,max:80000,r:7,l:'up to $80K'},{min:80001,max:Infinity,r:11.5,l:'above $80K'}]},old:{label:'Same',std:1000,cess:0,slabs:[{min:0,max:20000,r:0,l:'$0–20K'},{min:20001,max:Infinity,r:2,l:'above'}]},deadlines:[{n:'Tax Return',d:'Apr 15, 2025'}],hints:'Earned Income Relief up to S$8,000'}
};
function calcTax(gross,country,regime){
  var rule=TAX[country];if(!rule)return 0;
  var rs=regime==='new'?rule.new:rule.old;
  var taxable=Math.max(0,gross-(rs.std||0));
  if(country==='IN'&&regime==='new'&&rs.rebate&&gross<=rs.rebate)return 0;
  var tax=0,prev=0;
  (rs.slabs||[]).forEach(function(s){
    if(taxable<=prev)return;
    var portion=s.max===Infinity?taxable-prev:Math.min(taxable-prev,s.max-prev);
    tax+=portion*s.r/100;prev=s.max;
  });
  if(rs.cess)tax+=tax*rs.cess/100;
  if(rs.seTax)tax+=taxable*rs.seTax/100;
  if(rs.ni4)tax+=Math.max(0,Math.min(taxable,50270)-12570)*rs.ni4/100;
  return Math.round(tax);
}
function renderTaxView(){
  var rule=TAX[G.country]||TAX.IN;
  var m=G.loaded?computeMetrics():null;
  /* Convert annual income to selected country's currency using live FX rates */
  var annualINR=m?m.annualI:1200000;
  var annual=annualINR;
  if(G.country!=='IN'&&G.fxRates&&G.fxRates['INR']&&G.fxRates[rule.cur||'USD']){
    /* Convert INR -> USD -> target currency */
    var inrToUsd=1/G.fxRates['INR'];
    var usdToTarget=G.fxRates[rule.cur||'USD']||1;
    annual=Math.round(annualINR*inrToUsd*usdToTarget);
  }
  var cp=document.getElementById('country-pills');
  if(cp)cp.innerHTML=Object.keys(TAX).map(function(k){
    return'<button class="cpill'+(G.country===k?' on':'')+'" onclick="G.country=\''+k+'\';renderTaxView();document.querySelectorAll(\'.cpill\').forEach(function(b){b.classList.remove(\'on\');});this.classList.add(\'on\')">'+TAX[k].name+'</button>';
  }).join('');
  var rt=document.getElementById('regime-tabs');
  if(rt)rt.innerHTML='<button class="rt'+(G.regime==='new'?' on':'')+'" onclick="G.regime=\'new\';renderTaxView()">New Regime</button><button class="rt'+(G.regime==='old'?' on':'')+'" onclick="G.regime=\'old\';renderTaxView()">Old Regime</button>';
  var rs=G.regime==='new'?rule.new:rule.old;
  var taxable=Math.max(0,annual-(rs.std||0));
  var totalTax=calcTax(annual,G.country,G.regime);
  var qTax=Math.round(totalTax/4),mSet=Math.round(totalTax/12);
  var bd=document.getElementById('tax-bd');
  if(bd)bd.innerHTML=[
    {l:'Projected Annual Income',v:rule.sym+Math.round(annual).toLocaleString('en-IN')},
    {l:'Standard Deduction',v:'– '+rule.sym+(rs.std||0).toLocaleString('en-IN')},
    {l:'Taxable Income',v:rule.sym+Math.round(taxable).toLocaleString('en-IN')},
    {l:'Estimated Annual Tax',v:rule.sym+totalTax.toLocaleString('en-IN'),warn:true},
    {l:'Effective Rate',v:annual>0?((totalTax/annual)*100).toFixed(1)+'%':'0%'},
    {l:'Monthly Set-Aside',v:'<span style="color:var(--blue);font-weight:800">'+rule.sym+mSet.toLocaleString('en-IN')+'</span>'},
    {l:'Quarterly Advance Tax',v:'<span style="color:var(--g3);font-size:1.05rem;font-weight:800">'+rule.sym+qTax.toLocaleString('en-IN')+'</span>'}
  ].map(function(r){return'<div class="tx-row"><span class="tx-lbl">'+r.l+'</span><span class="tx-val'+(r.warn?' warn':'')+'">'+(r.v)+'</span></div>';}).join('');
  var st=document.getElementById('slab-tbl');
  if(st)st.innerHTML='<table><thead><tr><th>Slab</th><th>Rate</th><th>Tax</th></tr></thead><tbody>'+(rs.slabs||[]).map(function(s){
    var lo=s.min,hi=s.max===Infinity?taxable:s.max;
    var p=Math.max(0,Math.min(taxable,hi)-Math.max(0,lo-1));
    var t=Math.round(p*s.r/100);
    return'<tr><td style="font-size:.8rem">'+s.l+'</td><td style="color:var(--amber);font-weight:700">'+s.r+'%</td><td class="amt-in">'+(t>0?rule.sym+t.toLocaleString('en-IN'):'—')+'</td></tr>';
  }).join('')+'</tbody></table>';
  var dl=document.getElementById('tax-dl');
  if(dl)dl.innerHTML=(rule.deadlines||[]).map(function(d){
    var due=new Date(d.d),now=new Date();
    var past=due<now,soon=!past&&(due-now)<30*86400000;
    return'<div class="dl-item"><span class="dl-name">'+d.n+'</span><div class="dl-r"><span class="dl-date">'+d.d+'</span><span class="dl-st '+(past?'dl-past':soon?'dl-soon':'dl-ok')+'">'+(past?'Past':soon?'Soon':'OK')+'</span></div></div>';
  }).join('');
  var dh=document.getElementById('ded-hints');
  if(dh)dh.innerHTML=(rule.hints||'').split('\n').map(function(l){return l?'<div style="margin-bottom:.35rem">• '+l+'</div>':'';}).join('');
  var fy=document.getElementById('tax-fy-lbl');if(fy)fy.textContent=rule.fy+' · '+rs.label;
}

/* ── FX ── */
var FX_FB={USD:1,INR:84.2,GBP:0.788,EUR:0.921,CAD:1.382,AUD:1.546,SGD:1.342,JPY:149.3,AED:3.672,CHF:0.882,HKD:7.825,CNY:7.24};
function fetchFX(){
  fetch('https://open.er-api.com/v6/latest/USD')
  .then(function(r){return r.json();})
  .then(function(d){G.fxRates=d.rates||FX_FB;var t=document.getElementById('fx-time');if(t)t.textContent='Live rates · '+new Date().toLocaleTimeString('en-IN');renderFXRates();buildConvSelects();})
  .catch(function(){G.fxRates=FX_FB;renderFXRates();buildConvSelects();});
}
function cvt(a,f,t){if(f===t||!G.fxRates[f]||!G.fxRates[t])return a;return a/G.fxRates[f]*G.fxRates[t];}
function renderFXRates(){
  var pairs=['EUR','GBP','INR','CAD','AUD','SGD','JPY','AED','CHF','HKD','CNY','ZAR'];
  var g=document.getElementById('rate-grid');if(!g)return;
  g.innerHTML=pairs.map(function(c){
    var r=G.fxRates[c]?(+G.fxRates[c]).toFixed(['JPY','INR'].indexOf(c)>=0?1:4):'—';
    var chg=(Math.random()-.48)*.5;
    return'<div class="rc"><div class="rc-pair">USD/'+c+'</div><div class="rc-val">'+r+'</div><div class="rc-chg '+(chg>=0?'rc-up':'rc-dn')+'">'+(chg>=0?'↑':'↓')+Math.abs(chg).toFixed(2)+'%</div></div>';
  }).join('');
}
function buildConvSelects(){
  var curs=Object.keys(G.fxRates).sort();
  ['cv-from','cv-to'].forEach(function(id,i){
    var sel=document.getElementById(id);if(!sel)return;
    sel.innerHTML=curs.map(function(c){return'<option value="'+c+'"'+(c===(i===0?'USD':'INR')?' selected':'')+'>'+c+'</option>';}).join('');
  });
  doConvert();
}
function doConvert(){
  var a=parseFloat((document.getElementById('cv-amt')||{}).value)||0;
  var f=(document.getElementById('cv-from')||{}).value;
  var t=(document.getElementById('cv-to')||{}).value;
  if(!f||!t)return;
  var res=cvt(a,f,t);
  var el=document.getElementById('cv-res');var rl=document.getElementById('cv-rate');
  if(el)el.textContent=t+' '+res.toLocaleString(undefined,{maximumFractionDigits:2});
  if(rl)rl.textContent='1 '+f+' = '+cvt(1,f,t).toFixed(4)+' '+t;
}

/* ── PROJECTS ── */
var projects=[{name:'React Dashboard',client:'Acme Corp',rev:95000,exp:8000},{name:'Brand Identity',client:'Studio Z',rev:45000,exp:2000},{name:'API Integration',client:'Tech Ltd',rev:72000,exp:5500}];
function addProject(){
  var name=(document.getElementById('pj-name')||{}).value.trim();
  var client=(document.getElementById('pj-client')||{}).value.trim();
  var rev=parseFloat((document.getElementById('pj-rev')||{}).value)||0;
  var exp=parseFloat((document.getElementById('pj-exp')||{}).value)||0;
  if(!name){notify('Enter project name','warn');return;}
  projects.push({name:name,client:client,rev:rev,exp:exp});
  ['pj-name','pj-client','pj-rev','pj-exp'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
  renderProjects();notify('Project added!');
}
function removeProject(idx){
  projects.splice(idx,1);
  renderProjects();
  notify('Project removed');
}

function renderProjects(){
  /* Summary bar */
  var sb=document.getElementById('proj-summary');
  if(sb){
    var totRev=projects.reduce(function(s,p){return s+p.rev;},0);
    var totExp=projects.reduce(function(s,p){return s+p.exp;},0);
    var totProfit=totRev-totExp;
    var avgMargin=projects.length?Math.round(totProfit/totRev*100)||0:0;
    sb.innerHTML=[
      {l:'Total Revenue',v:'₹'+totRev.toLocaleString('en-IN'),c:'var(--g3)'},
      {l:'Total Expenses',v:'₹'+totExp.toLocaleString('en-IN'),c:'var(--red)'},
      {l:'Net Profit',v:'₹'+totProfit.toLocaleString('en-IN'),c:totProfit>=0?'var(--g3)':'var(--red)'},
    ].map(function(k){
      return'<div style="background:#fff;border:1.5px solid var(--brd);border-radius:14px;padding:1rem 1.2rem;animation:popIn .4s ease both">'
        +'<div style="font-size:.68rem;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.25rem">'+k.l+'</div>'
        +'<div style="font-size:1.35rem;font-weight:900;color:'+k.c+';font-family:var(--f2)">'+k.v+'</div>'
        +'</div>';
    }).join('');
  }

  /* Project cards */
  var g=document.getElementById('proj-grid');if(!g)return;
  if(!projects.length){
    g.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--t3)">'
      +'<div style="font-size:3rem;margin-bottom:.75rem">📂</div>'
      +'<div style="font-weight:700;font-size:1rem;margin-bottom:.3rem">No projects yet</div>'
      +'<div style="font-size:.85rem">Add your first project below</div></div>';
    return;
  }
  g.innerHTML=projects.map(function(p,idx){
    var profit=p.rev-p.exp;
    var margin=p.rev?Math.round(profit/p.rev*100):0;
    var marginColor=margin>=60?'var(--g3)':margin>=30?'var(--amber)':'var(--red)';
    var fillPct=Math.min(100,Math.max(0,margin));
    var delay=(idx*0.08).toFixed(2)+'s';
    return'<div class="proj-card" style="animation-delay:'+delay+'">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.9rem">'
        +'<div>'
          +'<div style="font-family:var(--f2);font-size:.97rem;font-weight:800;color:var(--t1);margin-bottom:.2rem">'+p.name+'</div>'
          +'<div style="font-size:.75rem;color:var(--t3);display:flex;align-items:center;gap:.3rem">'
            +'<span style="width:6px;height:6px;border-radius:50%;background:var(--g3);display:inline-block"></span>'+p.client
          +'</div>'
        +'</div>'
        +'<div style="background:'+(margin>=50?'rgba(0,200,150,.1)':margin>=20?'rgba(245,158,11,.1)':'rgba(239,68,68,.1)')+';color:'+marginColor+';border-radius:8px;padding:.25rem .65rem;font-size:.75rem;font-weight:800">'+margin+'%</div>'
      +'</div>'
      +'<div class="proj-stat-bar"><div class="fill '+(margin>=0?'green':'red')+'" style="width:'+fillPct+'%"></div></div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-top:.9rem">'
        +'<div style="background:rgba(0,200,150,.06);border-radius:10px;padding:.7rem .85rem">'
          +'<div style="font-size:.65rem;font-weight:700;color:var(--g3);text-transform:uppercase;letter-spacing:.07em">Revenue</div>'
          +'<div style="font-size:.97rem;font-weight:800;color:var(--t1)">₹'+p.rev.toLocaleString('en-IN')+'</div>'
        +'</div>'
        +'<div style="background:rgba(239,68,68,.06);border-radius:10px;padding:.7rem .85rem">'
          +'<div style="font-size:.65rem;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:.07em">Expenses</div>'
          +'<div style="font-size:.97rem;font-weight:800;color:var(--t1)">₹'+p.exp.toLocaleString('en-IN')+'</div>'
        +'</div>'
      +'</div>'
      +'<div style="margin-top:.9rem;padding-top:.9rem;border-top:1px solid var(--brd);display:flex;justify-content:space-between;align-items:center">'
        +'<div>'
          +'<div style="font-size:.67rem;color:var(--t3);margin-bottom:1px">Net Profit</div>'
          +'<div style="font-size:1.05rem;font-weight:900;color:'+marginColor+'">'+(profit>=0?'+':'')+'₹'+Math.abs(profit).toLocaleString('en-IN')+'</div>'
        +'</div>'
        +'<button onclick="removeProject('+idx+')" style="background:rgba(239,68,68,.08);color:var(--red);border:none;border-radius:8px;padding:.35rem .75rem;font-size:.75rem;font-weight:700;cursor:pointer;transition:all .2s" onmouseover="this.style.background='rgba(239,68,68,.15)'" onmouseout="this.style.background='rgba(239,68,68,.08)'">Remove</button>'
      +'</div>'
    +'</div>';
  }).join('');
}
function clearInvoice(){
  ['inv-from','inv-from-email','inv-from-phone','inv-gstin','inv-to','inv-to-email',
   'inv-num','inv-desc','inv-amt','inv-gst','inv-terms','inv-due'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.value='';
  });
  var n=document.getElementById('inv-num');if(n)n.value='INV-001';
  updateInvPreview();notify('Invoice cleared');
}
function updateInvPreview(){
  var get=function(id){return(document.getElementById(id)||{}).value||'';};
  var from=get('inv-from')||'Your Name';
  var fromEmail=get('inv-from-email');
  var fromPhone=get('inv-from-phone');
  var gstin=get('inv-gstin');
  var to=get('inv-to')||'Client';
  var toEmail=get('inv-to-email');
  var num=get('inv-num')||'INV-001';
  var date=get('inv-date')?new Date(get('inv-date')).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  var due=get('inv-due')?new Date(get('inv-due')).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'';
  var desc=get('inv-desc')||'Services rendered';
  var amt=parseFloat(get('inv-amt'))||0;
  var gst=parseFloat(get('inv-gst'))||0;
  var cur=get('inv-cur')||'INR';
  var terms=get('inv-terms')||'Payment due within 15 days.';
  var gstAmt=Math.round(amt*gst/100);
  var total=amt+gstAmt;
  var sym={'INR':'₹','USD':'$','GBP':'£','EUR':'€','SGD':'S$','AED':'AED '}[cur]||cur+' ';
  function fmt(n){return sym+(Math.round(n)).toLocaleString('en-IN');}

  var e=document.getElementById('inv-preview');if(!e)return;
  e.innerHTML=
    '<div class="inv-doc">'
    +'<div class="inv-doc-top">'
      +'<div class="inv-brand">'+from+'</div>'
      +(fromEmail||fromPhone?'<div class="inv-brand-sub">'+(fromEmail||'')+(fromPhone?' &middot; '+fromPhone:'')+'</div>':'')
      +(gstin?'<div style="font-size:.65rem;opacity:.7;margin-top:2px;position:relative">GSTIN: '+gstin+'</div>':'')
      +'<div class="inv-label-badge">INVOICE</div>'
    +'</div>'
    +'<div class="inv-doc-body">'
      +'<div class="inv-meta-row">'
        +'<div class="inv-meta-item"><label>Invoice No.</label><span>'+num+'</span></div>'
        +'<div class="inv-meta-item"><label>Date</label><span>'+date+'</span></div>'
        +(due?'<div class="inv-meta-item"><label>Due Date</label><span style="color:var(--red)">'+due+'</span></div>':'')
        +'<div class="inv-meta-item"><label>Currency</label><span>'+cur+'</span></div>'
      +'</div>'
      +'<div class="inv-bill-to"><label>Bill To</label><div class="bill-name">'+to+'</div>'+(toEmail?'<div style="font-size:.78rem;color:var(--t3);margin-top:2px">'+toEmail+'</div>':'')+'</div>'
      +'<table class="inv-items"><thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>'
      +'<tbody><tr><td>'+desc+'</td><td style="text-align:right;font-weight:700">'+fmt(amt)+'</td></tr>'
      +(gst>0?'<tr><td style="color:var(--t3)">GST ('+gst+'%)</td><td style="text-align:right;color:var(--t3)">'+fmt(gstAmt)+'</td></tr>':'')
      +'</tbody></table>'
      +'<div class="inv-total-section">'
        +(gst>0?'<div class="inv-total-row"><span>Subtotal</span><span>'+fmt(amt)+'</span></div>'
            +'<div class="inv-total-row"><span>GST ('+gst+'%)</span><span>'+fmt(gstAmt)+'</span></div>':'')
        +'<div class="inv-total-row grand"><span>Total</span><span>'+fmt(total)+'</span></div>'
      +'</div>'
      +'<div class="inv-footer-note">'+terms+'</div>'
    +'</div>'
    +'</div>';
}

function printInvoice(){
  updateInvPreview();
  var content=(document.getElementById('inv-preview')||{}).innerHTML||'';
  var w=window.open('','_blank');if(!w){notify('Allow popups to print','warn');return;}
  w.document.write('<!DOCTYPE html><html><head><title>Invoice</title><style>'
    +'*{margin:0;padding:0;box-sizing:border-box;}'
    +'body{font-family:Georgia,serif;background:#f5f5f5;padding:30px;}'
    +'.inv-doc{background:#fff;border-radius:14px;box-shadow:0 8px 40px rgba(0,0,0,.15);overflow:hidden;max-width:600px;margin:0 auto;}'
    +'.inv-doc-top{background:linear-gradient(135deg,#0a3d2b,#1a6644,#00c896);padding:1.8rem 2rem 1.4rem;color:#fff;position:relative;}'
    +'.inv-brand{font-size:1.5rem;font-weight:900;letter-spacing:-.02em;}'
    +'.inv-brand-sub{font-size:.7rem;opacity:.7;letter-spacing:.1em;text-transform:uppercase;margin-top:2px;}'
    +'.inv-label-badge{position:absolute;top:1.6rem;right:1.8rem;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:.35rem .85rem;font-size:.7rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;}'
    +'.inv-doc-body{padding:1.6rem 2rem 2rem;}'
    +'.inv-meta-row{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-bottom:1.4rem;padding-bottom:1rem;border-bottom:1px solid #f0f0f0;}'
    +'.inv-meta-item label{font-size:.62rem;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:2px;}'
    +'.inv-meta-item span{font-size:.84rem;font-weight:600;color:#333;}'
    +'.inv-bill-to{margin-bottom:1.2rem;}'
    +'.inv-bill-to label{font-size:.62rem;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.08em;}'
    +'.bill-name{font-size:1rem;font-weight:800;color:#1a1a1a;margin-top:3px;}'
    +'.inv-items{width:100%;border-collapse:collapse;margin-bottom:1.2rem;font-size:.84rem;}'
    +'.inv-items th{background:#f8f9fa;padding:.6rem .9rem;text-align:left;font-size:.68rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.06em;}'
    +'.inv-items td{padding:.7rem .9rem;border-bottom:1px solid #f4f4f4;color:#333;}'
    +'.inv-total-section{background:linear-gradient(135deg,#f0fdf7,#e8fdf4);border-radius:12px;padding:1rem 1.2rem;border:1.5px solid rgba(0,200,150,.2);}'
    +'.inv-total-row{display:flex;justify-content:space-between;font-size:.84rem;padding:.2rem 0;}'
    +'.inv-total-row.grand{font-size:1.05rem;font-weight:900;color:#0a8a5c;border-top:1.5px solid rgba(0,200,150,.2);padding-top:.6rem;margin-top:.4rem;}'
    +'.inv-footer-note{font-size:.7rem;color:#999;text-align:center;margin-top:1.2rem;padding-top:.8rem;border-top:1px solid #f0f0f0;}'
    +'</style></head><body>'+content+'</body></html>');
  w.document.close();setTimeout(function(){w.print();},500);
}
function exportCSV(){
  if(!G.txns.length){notify('No data','warn');return;}
  var rows=[['Date','Description','Category','Type','Amount','Currency']];
  G.txns.forEach(function(t){rows.push([t.date.toLocaleDateString('en-IN'),'"'+t.desc+'"',t.cat,t.amount>=0?'In':'Out',t.amount,t.cur]);});
  var a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(function(r){return r.join(',');}).join('\n'));
  a.download='incomewave_transactions.csv';a.click();notify('CSV exported!');
}
function exportJSONGated(){
  if(G.plan!=='business'){notify('JSON export is a Business plan feature','warn');return;}
  if(!G.txns.length){notify('No data','warn');return;}
  var m=computeMetrics();
  var data={transactions:G.txns.map(function(t){return Object.assign({},t,{date:t.date.toISOString()});}),
    metrics:{totalIncome:m.totalInc,totalExpenses:m.totalExp,netProfit:m.net,quarterlyTax:m.qTax},
    exportedAt:new Date().toISOString()};
  var a=document.createElement('a');
  a.href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(data,null,2));
  a.download='incomewave_data.json';a.click();
}
function exportPDF(){
  if(!G.txns.length){notify('No data','warn');return;}
  var m=computeMetrics();var rule=TAX[G.country]||TAX.IN;
  var w=window.open('','_blank');if(!w){notify('Allow popups','warn');return;}
  w.document.write('<!DOCTYPE html><html><head><title>IncomeWave Report</title><style>body{font-family:Georgia,serif;padding:45px;max-width:800px;margin:0 auto;font-size:13px;}h1{color:#1a5c1a;}h2{color:#2a7a2a;border-bottom:2px solid #d0f0d0;padding-bottom:6px;margin-top:1.8rem;}table{width:100%;border-collapse:collapse;margin:.8rem 0;}th{background:#1a5c1a;color:white;padding:7px 11px;text-align:left;font-size:11px;}td{padding:7px 11px;border-bottom:1px solid #e8e8e8;font-size:11px;}.pos{color:green;font-weight:700;}.neg{color:#c00;font-weight:700;}.note{margin-top:2rem;padding:.9rem;background:#fffbcc;border:1px solid #e6c700;font-size:10px;color:#6b5900;border-radius:5px;}</style></head><body>'
    +'<h1>IncomeWave Financial Report</h1>'
    +'<p>Generated: '+new Date().toLocaleString('en-IN')+' | Country: '+rule.name+' | Transactions: '+G.txns.length+'</p>'
    +'<h2>Summary</h2><table><tr><th>Metric</th><th>Value</th></tr>'
    +'<tr><td>Total Income</td><td class="pos">'+fmtINR(m.totalInc)+'</td></tr>'
    +'<tr><td>Total Expenses</td><td class="neg">'+fmtINR(m.totalExp)+'</td></tr>'
    +'<tr><td>Net Profit</td><td class="'+(m.net>=0?'pos':'neg')+'">'+fmtINR(m.net)+'</td></tr>'
    +'<tr><td>Quarterly Tax</td><td>'+fmtINR(m.qTax)+'</td></tr>'
    +'</table><h2>Expenses by Category</h2><table><tr><th>Category</th><th>Amount</th></tr>'
    +Object.entries(m.catTot).map(function(e){return'<tr><td>'+e[0]+'</td><td>'+fmtINR(e[1])+'</td></tr>';}).join('')
    +'</table><div class="note">Tax estimates are for planning only. Consult a CA before filing. | IncomeWave | gurucharan.k@zohomail.in</div></body></html>');
  w.document.close();setTimeout(function(){w.print();},400);
}
function clearAll(){
  if(!confirm('Clear all data?'))return;
  G.txns=[];G.loaded=false;
  ['ov-empty','tx-empty','charts-empty'].forEach(function(id){var e=document.getElementById(id);if(e)e.style.display='block';});
  ['ov-content','tx-content','charts-content'].forEach(function(id){var e=document.getElementById(id);if(e)e.style.display='none';});
  notify('Cleared','warn');
}
function saveSettings(){
  G.baseCur=(document.getElementById('s-curr')||{}).value||'INR';
  G.country=(document.getElementById('s-country')||{}).value||'IN';
  if(G.loaded){renderKPIs(computeMetrics());renderTaxView();}
  notify('Settings saved!');
}
function updatePlanUI(plan){
  G.plan=plan;
  var isPaid=plan==='pro'||plan==='business';
  var lb=plan==='pro'?'Pro Plan':plan==='business'?'Business Plan':'Free Plan';
  var sb=document.getElementById('sb-plan-name');if(sb)sb.textContent=lb;
  var pb=document.getElementById('plan-badge');if(pb)pb.textContent='✓ '+lb;
  var jb=document.getElementById('json-btn-wrap');if(jb)jb.style.display=plan==='business'?'block':'none';
}
function activateCode(){
  var code=(document.getElementById('act-code')||{}).value.trim().toUpperCase();
  if(code.startsWith('IW-PRO-')&&code.length===14){updatePlanUI('pro');notify('Pro Plan activated!');}
  else if(code.startsWith('IW-BIZ-')&&code.length===14){updatePlanUI('business');notify('Business Plan activated!');}
  else notify('Invalid code','warn');
}
function openPayModal(plan){
  G.payPlan=plan;
  document.getElementById('pay-step1').style.display='block';
  document.getElementById('pay-step2').style.display='none';
  document.getElementById('ppn').textContent=plan==='pro'?'Pro Plan':'Business Plan';
  document.getElementById('ppp').textContent=plan==='pro'?'₹1,599/mo':'₹3,299/mo';
  document.getElementById('pay-modal-title').textContent=plan==='pro'?'Upgrade to Pro':'Upgrade to Business';
  openM('m-pay');
}
function doPayment(){
  var name=(document.getElementById('pay-name')||{}).value.trim();
  var email=(document.getElementById('pay-email')||{}).value.trim();
  var wa=(document.getElementById('pay-wa')||{}).value.trim();
  if(!name||!email||!wa){notify('Please fill in all fields','warn');return;}
  if(!email.includes('@')){notify('Enter a valid email','warn');return;}
  if(wa.replace(/\D/g,'').length<10){notify('Enter a valid WhatsApp number','warn');return;}
  var RZP={pro:'https://rzp.io/rzp/WIlR7IA8',business:'https://rzp.io/rzp/VoTVJ6lo'};
  window.open(RZP[G.payPlan],'_blank');
  setTimeout(function(){
    var code=genActivCode(G.payPlan);G.latestCode=code;
    G.payments.push({id:'PAY-'+Date.now(),name:name,email:email,wa:wa,plan:G.payPlan,amount:G.payPlan==='pro'?'₹1,599':'₹3,299',date:new Date().toLocaleString('en-IN'),code:code});
    G.users.push({name:name,email:email,wa:wa,plan:G.payPlan,since:new Date().toLocaleDateString('en-IN'),code:code});
    G.codes.push({code:code,plan:G.payPlan,name:name,wa:wa,email:email,date:new Date().toLocaleString('en-IN'),used:false});
    document.getElementById('pay-step1').style.display='none';
    document.getElementById('pay-step2').style.display='block';
    document.getElementById('succ-code').textContent=code;
    document.getElementById('succ-plan').textContent=G.payPlan==='pro'?'Pro':'Business';
    document.getElementById('succ-wa').textContent=wa;
    var msg=encodeURIComponent('Hi '+name+'! Your IncomeWave '+(G.payPlan==='pro'?'Pro':'Business')+' code: *'+code+'*\nDashboard > Settings > Activate Plan.\nHelp: gurucharan.k@zohomail.in');
    document.getElementById('succ-wa-btn').onclick=function(){window.open('https://wa.me/'+wa.replace(/\D/g,'')+'?text='+msg,'_blank');};
  },1500);
}
function activateFromPurchase(){updatePlanUI(G.payPlan);closeM('m-pay');goPage('dashboard');notify((G.payPlan==='pro'?'Pro':'Business')+' Plan activated!');}
function genActivCode(plan){
  var px=plan==='pro'?'IW-PRO-':'IW-BIZ-';
  var ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',s='';
  for(var i=0;i<6;i++)s+=ch[Math.floor(Math.random()*ch.length)];
  return px+s;
}
function doAdminLogin(){
  if(!G._adminUnlocked){notify('Access denied','err');return;}
  var pw=(document.getElementById('admin-pw')||{}).value;
  if(pw===G.adminPw){
    document.getElementById('admin-login-screen').style.display='none';
    document.getElementById('admin-dash').style.display='block';
    refreshAdmin();
  }else{notify('Incorrect password','err');var p=document.getElementById('admin-pw');if(p)p.value='';}
}
function adminLogout(){document.getElementById('admin-login-screen').style.display='flex';document.getElementById('admin-dash').style.display='none';goPage('landing');}
function changeAdminPw(){var np=(document.getElementById('new-admin-pw')||{}).value;if(np&&np.length>=6){G.adminPw=np;notify('Password updated');}else notify('Minimum 6 characters','warn');}
function refreshAdmin(){
  var ts=document.getElementById('admin-ts');if(ts)ts.textContent='Last refreshed: '+new Date().toLocaleString('en-IN');
  renderAdminKPIs();
  renderPaysTbl(document.getElementById('admin-recent-tbl'),G.payments.slice(-10).reverse());
  var rpm=document.getElementById('rp-meta');if(rpm)rpm.textContent=G.payments.length+' total';
  renderAllPays();renderAllCodes();renderAllUsers();
}
function renderAdminKPIs(){
  var e=document.getElementById('admin-krow');if(!e)return;
  var total=G.payments.length;
  var rev=G.payments.reduce(function(s,p){return s+(parseFloat(String(p.amount||'').replace(/[^\d.]/g,''))||0);},0);
  var pro=G.payments.filter(function(p){return p.plan==='pro';}).length;
  var biz=G.payments.filter(function(p){return p.plan==='business';}).length;
  e.innerHTML='<div class="akpi"><div class="akpi-l">Total Payments</div><div class="akpi-v">'+total+'</div></div><div class="akpi"><div class="akpi-l">Revenue</div><div class="akpi-v">₹'+Math.round(rev).toLocaleString('en-IN')+'</div></div><div class="akpi"><div class="akpi-l">Pro Users</div><div class="akpi-v">'+pro+'</div></div><div class="akpi"><div class="akpi-l">Business</div><div class="akpi-v">'+biz+'</div></div>';
}
function renderPaysTbl(el,pays){
  if(!el)return;
  if(!pays.length){el.innerHTML='<div class="empty-state" style="padding:2rem"><div class="empty-icon">💳</div><div class="empty-title">No payments yet</div></div>';return;}
  el.innerHTML='<table><thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Amount</th><th>Date</th><th>Code</th><th>Send</th></tr></thead><tbody>'+
  pays.map(function(p){return'<tr><td>'+p.name+'</td><td style="font-size:.72rem">'+p.email+'</td><td><span class="stb '+(p.plan==='pro'?'st-pro':'st-biz')+'">'+p.plan+'</span></td><td class="amt-in">'+p.amount+'</td><td style="font-size:.68rem;color:var(--t3)">'+p.date+'</td><td style="color:var(--g3);font-weight:700;font-size:.74rem">'+p.code+'</td><td><button class="btn btn-ghost btn-sm" onclick="sendWA(\''+p.wa+'\',\''+p.name+'\',\''+p.code+'\',\''+p.plan+'\')">📲</button></td></tr>';}).join('')+'</tbody></table>';
}
function sendWA(wa,name,code,plan){
  var msg=encodeURIComponent('Hi '+name+'! IncomeWave '+plan+' activation code: *'+code+'*\nGo to Dashboard > Settings > Activate Plan.\nHelp: gurucharan.k@zohomail.in');
  window.open('https://wa.me/'+wa.replace(/\D/g,'')+'?text='+msg,'_blank');
}
function renderAllPays(){renderPaysTbl(document.getElementById('all-pays-tbl'),G.payments.slice().reverse());var m=document.getElementById('ap-meta');if(m)m.textContent=G.payments.length+' payments';}
function generateCode(){
  var name=(document.getElementById('gc-name')||{}).value.trim();
  var wa=(document.getElementById('gc-wa')||{}).value.trim();
  var plan=(document.getElementById('gc-plan')||{}).value;
  if(!name||!wa){notify('Enter name and WhatsApp','warn');return;}
  var code=genActivCode(plan);G.latestCode=code;
  G.codes.push({code:code,plan:plan,name:name,wa:wa,email:'manual',date:new Date().toLocaleString('en-IN'),used:false});
  document.getElementById('gc-result').style.display='block';
  document.getElementById('gc-code-display').textContent=code;
  document.getElementById('gc-wa-btn').onclick=function(){sendWA(wa,name,code,plan);};
  renderAllCodes();notify('Code generated!');
}
function copyLatestCode(){if(G.latestCode&&navigator.clipboard)navigator.clipboard.writeText(G.latestCode);notify('Copied!');}
function renderAllCodes(){
  var el=document.getElementById('codes-tbl');
  var m=document.getElementById('codes-meta');if(m)m.textContent=G.codes.length+' codes';
  if(!el)return;
  if(!G.codes.length){el.innerHTML='<div class="empty-state" style="padding:2rem"><div class="empty-icon">🔑</div><div class="empty-title">No codes yet</div></div>';return;}
  el.innerHTML='<table><thead><tr><th>Code</th><th>Plan</th><th>Name</th><th>WhatsApp</th><th>Date</th><th>Send</th></tr></thead><tbody>'+
  G.codes.slice().reverse().map(function(co){return'<tr><td style="color:var(--g3);font-weight:700;font-size:.78rem">'+co.code+'</td><td><span class="stb '+(co.plan==='pro'?'st-pro':'st-biz')+'">'+co.plan+'</span></td><td>'+co.name+'</td><td style="font-size:.74rem">'+co.wa+'</td><td style="font-size:.68rem;color:var(--t3)">'+co.date+'</td><td><button class="btn btn-ghost btn-sm" onclick="sendWA(\''+co.wa+'\',\''+co.name+'\',\''+co.code+'\',\''+co.plan+'\')">📲</button></td></tr>';}).join('')+'</tbody></table>';
}
function renderAllUsers(){
  var el=document.getElementById('users-tbl');
  var m=document.getElementById('users-meta');if(m)m.textContent=G.users.length+' users';
  if(!el)return;
  if(!G.users.length){el.innerHTML='<div class="empty-state" style="padding:2rem"><div class="empty-icon">👤</div><div class="empty-title">No users yet</div></div>';return;}
  el.innerHTML='<table><thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Since</th><th>Code</th></tr></thead><tbody>'+
  G.users.map(function(u){return'<tr><td>'+u.name+'</td><td style="font-size:.74rem">'+u.email+'</td><td><span class="stb '+(u.plan==='pro'?'st-pro':'st-biz')+'">'+u.plan+'</span></td><td style="font-size:.68rem;color:var(--t3)">'+u.since+'</td><td style="color:var(--g3);font-size:.74rem;font-weight:700">'+u.code+'</td></tr>';}).join('')+'</tbody></table>';
}
function exportAdminCSV(){
  if(!G.payments.length){notify('No payments','warn');return;}
  var rows=[['Name','Email','WhatsApp','Plan','Amount','Date','Code']];
  G.payments.forEach(function(p){rows.push([p.name,p.email,p.wa,p.plan,p.amount,p.date,p.code]);});
  var a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(function(r){return r.join(',');}).join('\n'));
  a.download='incomewave_payments.csv';a.click();
}
function submitContact(){
  var name=(document.getElementById('c-name')||{}).value;
  var email=(document.getElementById('c-email')||{}).value;
  if(!name||!email){notify('Fill in all fields','warn');return;}
  notify("Message sent! We'll reply to "+email);closeM('m-contact');
}
function sendAI(){var inp=document.getElementById('ai-input');var q=inp?inp.value.trim():'';if(!q)return;if(inp)inp.value='';askAI(q);}
function askAI(q){
  var msgs=document.getElementById('ai-msgs');if(!msgs)return;
  if(G.plan!=='pro'&&G.plan!=='business'){
    msgs.innerHTML+='<div class="ai-msg ai-user">'+q+'</div><div class="ai-msg ai-bot">🔒 AI Analyst is a Pro feature.<br><button class="btn btn-green btn-sm" onclick="openM(\'m-pricing\')" style="margin-top:.5rem">Upgrade →</button></div>';
    msgs.scrollTop=msgs.scrollHeight;return;
  }
  msgs.innerHTML+='<div class="ai-msg ai-user">'+q+'</div>';
  var lid='al'+Date.now();
  msgs.innerHTML+='<div class="ai-msg ai-bot" id="'+lid+'" style="color:var(--t3)">Analyzing…</div>';
  msgs.scrollTop=msgs.scrollHeight;
  var summary=G.loaded?buildSummary():'No data loaded.';
  fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,
      system:'You are IncomeWave AI, a financial analyst for Indian freelancers. Give specific actionable insights with INR amounts. Use short bullet points.',
      messages:[{role:'user',content:'Financial summary:\n'+summary+'\n\nQuestion: '+q}]})})
  .then(function(r){return r.json();})
  .then(function(data){
    var reply=(data.content||[]).map(function(b){return b.text||'';}).join('')||'Could not analyze.';
    var le=document.getElementById(lid);if(le)le.remove();
    msgs.innerHTML+='<div class="ai-msg ai-bot">'+reply.replace(/\n/g,'<br>')+'</div>';
    msgs.scrollTop=msgs.scrollHeight;
  })
  .catch(function(){
    var le=document.getElementById(lid);if(le)le.remove();
    msgs.innerHTML+='<div class="ai-msg ai-bot">'+localAI(q)+'</div>';
    msgs.scrollTop=msgs.scrollHeight;
  });
}
function buildSummary(){var m=computeMetrics();return'Income:'+fmtINR(m.totalInc)+' Expenses:'+fmtINR(m.totalExp)+' Net:'+fmtINR(m.net)+' Txns:'+G.txns.length+' AnnualProjected:'+fmtINR(m.annualI)+' Q-Tax:'+fmtINR(m.qTax)+' Categories:'+Object.entries(m.catTot).map(function(e){return e[0]+':'+fmtINR(e[1]);}).join(',');}
function localAI(q){if(!G.loaded)return'Please upload your bank statement first!';var m=computeMetrics();if(/deduct|tax/i.test(q))return'Based on your data:<br>Software '+fmtINR(m.catTot.Software||0)+' 100% deductible<br>Set aside '+fmtINR(m.qTax/3)+'/month for advance tax';return'Profit margin: '+(m.totalInc>0?Math.round(m.net/m.totalInc*100):0)+'%';}
(function(){
  if(!window.IntersectionObserver)return;
  var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
  function obs(){document.querySelectorAll('.reveal:not(.visible)').forEach(function(el){io.observe(el);});}obs();setInterval(obs,1000);
})();
(function(){var t=0;function s(){if(typeof pdfjsLib!=='undefined'){pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}else if(t++<30)setTimeout(s,300);}s();})();
(function(){
  fetchFX();renderTaxView();renderProjects();
  var d=document.getElementById('inv-date');if(d)d.value=new Date().toISOString().split('T')[0];
  updateInvPreview();
  function chk(){if(window.location.hash==='#iw-admin-secret'){G._adminUnlocked=true;goPage('admin');history.replaceState(null,'',window.location.pathname);}}
  window.addEventListener('hashchange',chk);chk();
})();
