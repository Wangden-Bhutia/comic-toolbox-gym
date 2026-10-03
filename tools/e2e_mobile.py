import json
from playwright.sync_api import sync_playwright
BASE='http://127.0.0.1:8765/comic-toolbox-gym/'
FILE='file:///workspace/comic-toolbox-gym/index.html'
SS='/workspace/comic-toolbox-gym/screenshots/mobile-'
errs=[]; hs=[]
def hcheck(pg,name):
    w=pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
    if w[0]>w[1]: hs.append((name,w))
def small(pg,name):
    r=pg.evaluate("""()=>{const out=[];document.querySelectorAll('a,button,input:not([type=hidden]),select,textarea,summary').forEach(e=>{const b=e.getBoundingClientRect();if(b.width===0||b.height===0)return;const cs=getComputedStyle(e);if(cs.visibility==='hidden')return;if(e.closest('[hidden]'))return;if(b.height<43.5||b.width<43.5){out.push((e.textContent||e.getAttribute('aria-label')||e.tagName).trim().slice(0,24)+' '+Math.round(b.width)+'x'+Math.round(b.height))}});return out}""")
    return r
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',headless=True)
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True,user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')
    pg=ctx.new_page()
    pg.on('console',lambda m: errs.append(('console',m.type,m.text)) if m.type in('error','warning') else None)
    pg.on('pageerror',lambda e: errs.append(('pageerror',str(e))))
    pg.goto(BASE+'index.html'); pg.wait_for_selector('.hero')
    # SW
    pg.evaluate("navigator.serviceWorker.ready.then(()=>1)"); pg.wait_for_timeout(1500)
    pg.reload(); pg.wait_for_selector('.hero'); pg.wait_for_timeout(500)
    print('SW controller:',pg.evaluate("!!navigator.serviceWorker.controller"), 'caches:',pg.evaluate("caches.keys()"))
    print('cached entries:',pg.evaluate("caches.keys().then(k=>caches.open(k[0]).then(c=>c.keys()).then(r=>r.length))"))
    print('manifest:',pg.evaluate("fetch(document.querySelector('link[rel=manifest]').href).then(r=>r.json()).then(j=>j.name+' '+j.display+' '+j.icons.length)"))
    pg.screenshot(path=SS+'01-dashboard.png')
    # go offline
    ctx.set_offline(True)
    pg.reload(); pg.wait_for_selector('.hero'); print('offline reload OK; title',pg.title())
    # tab bar navigation (touch taps)
    for label,sel in [('Skills','.skillgrid, .chapter'),('Practice','.tiles'),('Journal','#jsearch'),('More','.morelist'),('Home','.hero')]:
        pg.locator('.nav ul a',has_text=label).first.tap(); pg.wait_for_selector(sel); pg.wait_for_timeout(250)
        hcheck(pg,'tab-'+label)
        if label=='Skills': pg.screenshot(path=SS+'02-skills.png')
        if label=='Practice': pg.screenshot(path=SS+'03-practice.png')
        if label=='Journal': pg.screenshot(path=SS+'06-journal-empty.png')
        if label=='More': pg.screenshot(path=SS+'07-more.png')
    nb=pg.evaluate("(()=>{const r=document.querySelector('.nav').getBoundingClientRect();return [Math.round(r.top),Math.round(r.bottom),innerHeight]})()")
    print('tab bar rect',nb)
    # lesson + quiz offline
    pg.goto(BASE+'index.html#/tool/premise'); pg.wait_for_selector('.lesson'); pg.wait_for_timeout(300); pg.screenshot(path=SS+'04-tool-lesson.png',full_page=False)
    print('small targets (tool):',small(pg,'tool'))
    pg.get_by_text('Mark as read and start practising').tap(); pg.wait_for_selector('.tabs'); pg.wait_for_timeout(300)
    pg.get_by_role('tab',name='Quiz').tap(); pg.get_by_text('Start quiz (all)').tap(); pg.wait_for_selector('.choice'); pg.wait_for_timeout(300)
    pg.screenshot(path=SS+'05-quiz.png')
    print('small targets (quiz):',small(pg,'quiz'))
    pg.locator('.choice').first.tap(); pg.wait_for_selector('#quiz-next'); pg.wait_for_timeout(200); pg.screenshot(path=SS+'05b-quiz-feedback.png'); hcheck(pg,'quiz-fb')
    # cards + swipe
    pg.goto(BASE+'index.html#/tool/premise/cards'); pg.get_by_text('Study due and new').tap(); pg.wait_for_selector('.flip'); pg.wait_for_timeout(300)
    pg.screenshot(path=SS+'08-card-front.png')
    pg.locator('.flip').first.tap(); pg.wait_for_selector('.rates'); pg.screenshot(path=SS+'09-card-back.png'); pg.locator('.rate.r2').tap(); pg.wait_for_timeout(300); print('tap flip+rate ok')
    cdp=ctx.new_cdp_session(pg)
    pg.locator('.flip').scroll_into_view_if_needed(); pg.evaluate('window.scrollBy(0,-120)'); pg.wait_for_timeout(300); box=pg.locator('.flip').bounding_box(); y=box['y']+box['height']/2; x0=box['x']+box['width']*0.3
    def swipe(dx,dy=0):
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x0,'y':y}]})
        for i in range(1,9): cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x0+dx*i/8,'y':y+dy*i/8}]})
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        pg.wait_for_timeout(250)
    swipe(150); print('swipe flipped:',pg.locator('.flip.on').count()==1)
    pg.screenshot(path=SS+'09b-card-swiped.png'); hcheck(pg,'card')
    n0=pg.evaluate("G.S.stats.cards"); swipe(150); print('swipe-right rated:',pg.evaluate("G.S.stats.cards")==n0+1)
    # writing: sticky timer
    pg.goto(BASE+'index.html#/write/e8'); pg.wait_for_selector('.write textarea'); pg.wait_for_timeout(300)
    pg.screenshot(path=SS+'10-write.png')
    ta=pg.locator('.write textarea').first; ta.tap(); pg.keyboard.type('\n'.join('idea number %d is silly'%i for i in range(25)))
    pg.wait_for_timeout(300); pg.evaluate("window.scrollTo(0,document.body.scrollHeight)"); pg.wait_for_timeout(300)
    tp=pg.evaluate("(()=>{const r=document.querySelector('.wtop').getBoundingClientRect();const t=document.querySelector('.timer').getBoundingClientRect();return [Math.round(r.top),Math.round(t.top),Math.round(t.bottom),scrollY>0]})()")
    print('sticky wtop/timer after scroll:',tp, 'kb class:',pg.evaluate("document.body.classList.contains('kb')"))
    pg.screenshot(path=SS+'11-write-sticky-timer.png'); hcheck(pg,'write')
    pg.evaluate("document.activeElement.blur()"); pg.wait_for_timeout(300)
    pg.get_by_text('Finish and review').tap(); pg.wait_for_selector('.rubric'); pg.wait_for_timeout(300)
    for r in pg.locator('.rater').all()[:4]: r.locator('.seg').nth(2).tap()
    pg.screenshot(path=SS+'12-review.png',full_page=False); hcheck(pg,'review')
    print('small targets (review):',small(pg,'review'))
    pg.evaluate("document.querySelector('#save-ex').scrollIntoView()"); pg.locator('#save-ex').tap(); pg.wait_for_selector('text=Saved to your journal'); pg.screenshot(path=SS+'13-saved.png')
    # offline journal persists
    pg.goto(BASE+'index.html#/journal'); pg.wait_for_selector('.jcard'); pg.screenshot(path=SS+'14-journal.png'); hcheck(pg,'journal')
    # builder, workout, progress, map
    for name,route,sel in [('lab','#/lab/premise','.labmain'),('workout','#/workout','.wsteps'),('progress','#/progress','.heat'),('settings','#/settings','.kbtable'),('fix','#/fix','.exlist'),('write-list','#/write','.exlist'),('map','#/map','.grid'),('vocab','#/vocab','.vprog'),('tool-journal','#/tool/premise/journal','.tabs')]:
        pg.goto(BASE+'index.html'+route); pg.wait_for_selector(sel); pg.wait_for_timeout(250); hcheck(pg,name)
        if name in('lab','workout','progress'): pg.screenshot(path=SS+'15-'+name+'.png')
    # dark
    pg.goto(BASE+'index.html#/'); pg.wait_for_selector('.hero'); pg.locator('#theme-btn').tap(); pg.wait_for_timeout(300); pg.screenshot(path=SS+'16-dark-dashboard.png'); print('theme-color:',pg.evaluate("document.querySelector('#theme-color').content"))
    ctx.set_offline(False)
    print('HSCROLL issues:',hs)
    # file:// check
    ctx2=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True); p2=ctx2.new_page(); fe=[]
    p2.on('console',lambda m: fe.append(m.text) if m.type in('error','warning') else None); p2.on('pageerror',lambda e: fe.append(str(e)))
    p2.goto(FILE); p2.wait_for_selector('.hero'); p2.goto(FILE+'#/map'); p2.wait_for_selector('.grid'); p2.wait_for_timeout(500)
    print('file:// errors:',fe, 'sw supported & skipped:',p2.evaluate("!navigator.serviceWorker||!navigator.serviceWorker.controller"))
    print('errors (http):',errs)
    b.close()
