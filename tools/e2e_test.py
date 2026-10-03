import json, os
from playwright.sync_api import sync_playwright
URL='file:///workspace/comic-toolbox-gym/index.html'
SS='/workspace/comic-toolbox-gym/screenshots/'
errs=[]
def S(pg): return pg.evaluate("(G.saveNow(),JSON.parse(localStorage.getItem('ctg.v1')||'{}'))")
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',headless=True)
    ctx=b.new_context(viewport={'width':1280,'height':900},accept_downloads=True)
    pg=ctx.new_page()
    pg.on('console',lambda m: errs.append(('console',m.text)) if m.type in('error','warning') else None)
    pg.on('pageerror',lambda e: errs.append(('pageerror',str(e))))
    pg.goto(URL+'#/tool/premise'); pg.wait_for_selector('.lesson')
    pg.click('text=Mark as read and start practising'); pg.wait_for_selector('.tabs')
    print('read', list(S(pg)['read'].keys()))
    # quiz via tool tab
    pg.click('text=Quick 5'); pg.wait_for_selector('.choice')
    for i in range(12):
        if pg.locator('#quiz-next').count()==0 and pg.locator('.choice').count()>0 and not pg.locator('.choice').first.is_disabled():
            pg.keyboard.press('1'); pg.wait_for_selector('#quiz-next')
        elif pg.locator('#quiz-next').count()>0:
            pg.keyboard.press('Enter'); pg.wait_for_timeout(80)
        else: break
    print('quiz results visible', pg.locator('.results').count(), S(pg)['stats']['quizN'])
    # cards
    pg.goto(URL+'#/tool/premise/cards'); pg.wait_for_selector('text=Study due and new'); pg.click('text=Study due and new')
    pg.wait_for_selector('.flip')
    for i in range(3):
        pg.keyboard.press('Space'); pg.wait_for_selector('.rates'); pg.keyboard.press('3'); pg.wait_for_timeout(80)
    print('cards reviewed',S(pg)['stats']['cards'])
    # write exercise list mode
    pg.goto(URL+'#/write/e11'); pg.wait_for_selector('.write textarea')
    ex_title=pg.locator('.whead h2').inner_text(); print('ex',ex_title)
    pg.fill('.write textarea','\n'.join('premise idea %d about something funny'%i for i in range(12)))
    pg.wait_for_timeout(300)
    print('timer', pg.locator('.timer').inner_text(), 'count', pg.locator('.count').inner_text())
    pg.screenshot(path=SS+'03-writing.png')
    pg.click('text=Finish and review'); pg.wait_for_selector('.rubric')
    for r in pg.locator('.rater').all(): r.locator('.seg').nth(2).click()
    pg.fill('.review textarea','Liked the energy'); pg.click('#save-ex'); pg.wait_for_selector('text=Saved to your journal')
    st=S(pg); print('journal',len(st['journal']),st['journal'][0]['meta']['selfScore'])
    pg.screenshot(path=SS+'04-review-saved.png')
    # rows exercise with no-edit
    pg.goto(URL+'#/write/e3'); pg.wait_for_selector('.rows-editor textarea')
    ta=pg.locator('.rows-editor textarea').first; ta.click(); pg.keyboard.type('abc'); pg.keyboard.press('Backspace')
    print('noedit default off; value', ta.input_value())
    # fix-it
    pg.goto(URL+'#/fix/f2'); pg.wait_for_selector('.write textarea'); pg.fill('.write textarea','A pacifist drafted into the army that is led by a bully')
    pg.click('text=Compare with a model and self-check'); pg.wait_for_selector('.rubric')
    for r in pg.locator('.rater').all(): r.locator('.seg').nth(1).click()
    pg.click('text=Save to journal'); pg.wait_for_selector('text=Saved. +')
    # builder
    pg.goto(URL+'#/lab/premise'); pg.wait_for_selector('.labmain')
    pg.click('text=Random seed')
    for i in range(9):
        pg.locator('.labmain textarea, .labmain input').first.fill('step %d content'%i); pg.click('.labmain >> text=Next')
    pg.click('.labmain >> text=Review'); pg.wait_for_selector('#save-proj'); pg.click('#save-proj'); pg.wait_for_selector('text=Saved.')
    # vocab
    pg.goto(URL+'#/vocab'); pg.fill('input[aria-label="New comic vocabulary entry"]','a jokoid about pigeons'); pg.keyboard.press('Enter'); pg.wait_for_selector('.vitem')
    # journal search, export, import
    pg.goto(URL+'#/journal'); pg.wait_for_selector('.jcard'); n=pg.locator('.jcard').count(); print('journal cards',n)
    pg.fill('#jsearch','pigeons'); pg.wait_for_timeout(100); print('search hits',pg.locator('.jcard').count())
    pg.fill('#jsearch','')
    with pg.expect_download() as d: pg.click('text=Export JSON')
    path='/tmp/j.json'; d.value.save_as(path); data=json.load(open(path)); print('exported',len(data['journal']))
    with pg.expect_download() as d2: pg.click('text=Export Markdown')
    d2.value.save_as('/tmp/j.md'); print('md bytes',os.path.getsize('/tmp/j.md'))
    # delete one then import back
    pg.once('dialog',lambda dlg: dlg.accept()); pg.locator('.jcard').first.locator('text=Delete').click(); pg.wait_for_timeout(100)
    pg.set_input_files('input[type=file]',path); pg.wait_for_timeout(300); pg.reload(); pg.wait_for_selector('.jcard')
    print('after import',len(S(pg)['journal']))
    pg.screenshot(path=SS+'05-journal.png')
    # workout
    pg.goto(URL+'#/workout'); pg.wait_for_selector('.wsteps')
    print('workout steps', pg.locator('.ws').count())
    pg.screenshot(path=SS+'06-workout.png')
    # progress, tool page, dark mode, mobile
    pg.goto(URL+'#/tool/premise'); pg.click('#theme-btn'); pg.wait_for_timeout(200)
    pg.screenshot(path=SS+'07-tool-dark.png')
    pg.set_viewport_size({'width':390,'height':800}); pg.goto(URL+'#/'); pg.wait_for_timeout(300)
    pg.screenshot(path=SS+'08-mobile.png')
    pg.goto(URL+'#/progress'); pg.wait_for_timeout(200); pg.set_viewport_size({'width':1280,'height':900}); pg.screenshot(path=SS+'09-progress.png')
    print('mastery premise', pg.evaluate("G.mastery('premise')"))
    print('errors',errs)
    b.close()
