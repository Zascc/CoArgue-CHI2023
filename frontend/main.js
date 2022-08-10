let [premiseColor, positiveColor, neutralColor, negativeColor] = ['#b3d9aa', '#5185db', "#b7b7b7", '#dd6765']


let answers; // 全局answers（应该不需要全局留着question吧）
let writingModal;
let claimSentenceModal;

function fetchPageData() {
  // const queryParams = new URLSearchParams(window.location.search)
  // const control = queryParams.get('control') || 'exp'
  // const question = queryParams.get('question') || 'body'
  // const path = `${control}.${question}.js`
  const path = "data.js"
  return new Promise((resolve) => {
    const documentHead = document.getElementsByTagName('head')[0]
    const el = document.createElement('script')
    documentHead.appendChild(el)
    el.addEventListener('load', () => {
      answers = mock.answers
      resolve(mock)
    })
    el.type = 'text/javascript'
    el.src = path
  })
}


function initToTopButton() {
  const mybutton = document.getElementById("back-to-top");
  window.onscroll = function () {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
      mybutton.style.setProperty('display', 'block')
    } else {
      mybutton.style.setProperty('display', 'none')
    }
  }
}

function markClaimAndPremise(contextElement, sentencelist, answerIndex, sentenceCategory) {
  const markContext = new Mark(contextElement)
  sentencelist.forEach((sentence, sentenceIdx) => {
    // mark claim and premsie
    markContext.mark(sentence.content, {
      className: `${sentenceCategory} ${sentenceCategory}-${sentenceIdx} ${sentenceCategory}-Center-${sentence.center}`,
      separateWordSearch: false,
      acrossElements: true,
      each(el){
        // append tooltip if premise
        if(sentenceCategory == 'premise'){
          const tooptipSpan = document.createElement('span')
          tooptipSpan.classList.add(`${sentenceCategory}-detail`)
          tooptipSpan.innerHTML = `Testing Tooltip Text<br>Second row<br>This sentence is a ${sentenceCategory}`
          el.appendChild(tooptipSpan)
        }
        el.setAttribute('answer-idx', answerIndex)
        let highlightColor = sentenceCategory == "claim" ? positiveColor : premiseColor
        if (sentenceCategory == 'claim'){
          if(sentence.claimCenterPolarity == 'Neutral'){
            highlightColor = neutralColor
          }
          else if(sentence.claimCenterPolarity == 'Negative'){
            highlightColor = negativeColor
          }
        }
        
        el.style.background = highlightColor
      }
    })
  })
}

function scrollIntoView(el) {
  if (typeof el === 'string' || el instanceof String) {
    el = document.querySelectorAll(el)
  }
  if (el instanceof NodeList || Array.isArray(el)) {
    if (!el.length) return
    el[0].scrollIntoView({block: 'center'})
    el.forEach((e, i) => {
      if (e.classList.contains('blink')) return
      e.classList.add('blink')
      setTimeout(() => e.classList.remove('blink'), 2000)
    })
  } else {
    if (!el) return
    el.scrollIntoView({block: 'center'})
    if (el.classList.contains('blink')) return
    el.classList.add('blink')
    setTimeout(() => el.classList.remove('blink'), 2000)
  }
}

function fetchClaimDetailList(claimIdx){
  return `claim-${claimIdx}`
}

function initWritingModal(){
  const writingModalEl = document.getElementById('writingModal')
  writingModal = new bootstrap.Modal(writingModalEl)
  const textareaEl = writingModalEl.querySelector('#answerTextarea')
  textareaEl.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nEu facilisis sed odio morbi quis commodo odio.\nNunc scelerisque viverra mauris in."
}

function initClaimSentenceModal(){
  const claimSentenceModalEl = document.getElementById('claimSentenceModal')
  claimSentenceModal = new bootstrap.Modal(claimSentenceModalEl)


  claimSentenceModalEl.addEventListener('show.bs.modal', e => {
    const claim = e.relatedTarget.textContent
    console.log(claim)
    const claimElList = answers.reduce((acc, cur, ansIdx) => [
      ...acc,
      ...cur.claim.map((el, elIdx) => {})
    ], [])
  })

  
}



function initNavigationView(){
  // draw the percentage bar

  
  class PercentageBar {
    constructor(element) {
      this.element = element;
      this.bar = this.element.getElementsByClassName('js-pct-bar__bg');
      this.percentages = this.element.getElementsByClassName('js-pct-bar__value');
      initPercentageBar(this);
    }
  }

  function initPercentageBar(bar) {
    if(bar.bar.length < 1) return;
    var content = '';
    for(var i = 0; i < bar.percentages.length; i++) {
      var customClass = bar.percentages[i].getAttribute('data-pct-bar-bg'),
        customStyle = bar.percentages[i].getAttribute('data-pct-bar-style'),
        percentage = bar.percentages[i].textContent;
      
      if(!customStyle) customStyle = '';
      if(!customClass) customClass = '';
      content = content + '<div class="pct-bar__fill js-pct-bar__fill '+customClass+'" style="flex-basis: '+percentage+';'+customStyle+'"></div>';
    }
    bar.bar[0].innerHTML = content;
  }
  window.PercentageBar = PercentageBar;

  //initialize the PercentageBar objects
  
  var percentageBar = document.getElementsByClassName('js-pct-bar');
  if( percentageBar.length > 0 ) {
    for( var i = 0; i < percentageBar.length; i++) {
      (function(i){new PercentageBar(percentageBar[i]);})(i);
    }
  }
  document.querySelector('.pct-bar__fill.po2-bg-primary').style.backgroundColor = positiveColor
  document.querySelector('.pct-bar__fill.po2-bg-contrast-low').style.backgroundColor = neutralColor
  document.querySelector('.pct-bar__fill.po2-bg-accent').style.backgroundColor = negativeColor

  // remove the labels below after loading the percentage bar
  document.querySelector('.po2-grid.po2-gap-xs').remove()
}




function flipNavigationView(currentView, el){
  if (currentView == 'claim-center'){
    const goBackButton = document.getElementById('go-back-button')
    goBackButton.style.setProperty('display', 'inline')
    
    const notePaneHeader = document.querySelector('#note-pane-card > .card-header')
    notePaneHeader.textContent = "Navigation View > Claim Detail"
    notePaneHeader.append(goBackButton)

    const claimOverviewPage = document.getElementById('claim-center-overview-page')
    claimOverviewPage.style.setProperty('display', 'none')
    const claimDetailContainer = document.querySelector('#claim-detail-container')
    const chosenClaimCenter = document.createElement('div')
    chosenClaimCenter.innerHTML = el.innerHTML
    chosenClaimCenter.style.textAlign = 'center'
    chosenClaimCenter.style.backgroundColor = 'beige'
    chosenClaimCenter.style.margin = '10px 0px 10px 0px'
    claimDetailContainer.prepend(chosenClaimCenter)

    // extract all claims supporting the claim-center, click event will be listened in an event delegation form
    const claimList = answers.reduce((acc, cur, ansIdx) => [
      ...acc,
      ...cur.claim.map((p, claimIdx) => {
        // if the claim in the data has the same claim center with what the user clicked
        if(p.claimCenter == el.textContent.slice(5)){ // remove the index label (PC1: )
          const claimEl = document.createElement('li')
          claimEl.innerHTML = `${p.content}`
          claimEl.classList.add("claim-detail", "list-group-item")
          claimEl.setAttribute('original-ans-idx', ansIdx)
          claimEl.setAttribute('title', 'click to jump to the original answer')
          return claimEl
        }
        
      }).filter(claimEl => !!claimEl)
    ],[])
    
    const claimDetailPage = document.getElementById('claim-detail-page')
    const claimDetailList = claimDetailPage.querySelector('.list-group')

    claimList.forEach(p => {
      claimDetailList.append(p)
    })

    claimDetailPage.style.setProperty('display', 'block')
  }
  else if (currentView == 'claim-detail'){
    const goBackButton = document.getElementById('go-back-button')
    goBackButton.style.setProperty('display', 'none')
    
    const notePaneHeader = document.querySelector('#note-pane-card > .card-header')
    notePaneHeader.textContent = "Navigation View > Claim Center Overview"
    notePaneHeader.append(goBackButton)

    const claimOverviewPage = document.getElementById('claim-center-overview-page')
    claimOverviewPage.style.setProperty('display', 'block')

    const claimDetailPage = document.getElementById('claim-detail-page')
    claimDetailPage.style.setProperty('display', 'none')
    claimDetailPage.innerHTML = `
    <div id="claim-detail-container">
      <div id = "claim-list-container">
        <span id="claim-list-title">Related Claims:</span>
        <ul class = 'list-group'>
        </ul>
      </div>
    </div>`
  }
}

function displayClaimCenters(el){
  
  document.querySelectorAll('.pct-bar__fill').forEach(p => {
    p.style.border = null
  })
  const elClassList = el.classList
  const stance = elClassList.contains("po2-bg-primary") ? "positive" : elClassList.contains("po2-bg-contrast-low") ? "neutral" : "negative"

  // calculate the percentage of each stance
  function claimCentersSelector(x){
    return {
      "positive": ["I would say YES!", "Of course you should"],
      "neutral": ["It’s not too late to invest.", "That’s up to you.", "It depends what your level of disposable income is, how great your assets are, and what other assets you have invested in.", "The significant thing is to do your own research and comprehend the dangers.", "Invest in Bitcoin, only if you are okay to loss all.", "Investing in Bitcoin is viable option especially in a view of current decline of the power of Fiat currencies.", "If you are willing to take the risk, first make sure you understand what you are investing in and have a crypto investment strategy"],
      "negative": ["Bitcoin is pretty useless. But so is gold.", "Cryto currency is an extremely high-hazard venture, and CFDs bought on margin are significantly more hazardous.", "It is almost certainly in a bubble."]
    }[x]
  }

  const claimCenters = claimCentersSelector(stance)
  const stanceFirstLetter = stance[0].toUpperCase()
  const claimCenterEls = claimCenters.map((p, idx) => {
    const claimEl = document.createElement('li')
    claimEl.innerHTML = `<span class='${stance}'>${stanceFirstLetter}C${idx+1}:</span> ${p}` // need to adjust the color to be in line with the stance color
    claimEl.classList.add("claim-center", "list-group-item")
    claimEl.setAttribute('claim-center-polarity', stance)
    
    
  
    return claimEl
  })

  const detailListContainer = document.getElementById('claim-center-list-container')
  detailListContainer.innerHTML = "<span id='claim-center-list-title'></span><ul class='list-group'></ul>"
  claimCenterEls.forEach(p => {
    detailListContainer.querySelector('ul').append(p)
  })
  const claimCenterListTitle = detailListContainer.querySelector('#claim-center-list-title')

  claimCenterListTitle.textContent = `${stanceFirstLetter}${stance.slice(1)} claims` 
  claimCenterListTitle.removeAttribute('class')
  claimCenterListTitle.classList.add(`${stance}`)
  // TODO: set the color of the claimCenterListTitle
  if(detailListContainer.style.getPropertyValue('display') == 'block' && detailListContainer.getAttribute('display-claim-stance') == stance){
    detailListContainer.style.setProperty('display', 'none')
    el.style.border = null
  }
  else{
    detailListContainer.style.setProperty('display', 'block')
    detailListContainer.setAttribute("display-claim-stance", stance)
    el.style.border ='3px solid rgb(215, 215, 14)'
  }
}


// 等价于jQuery的 $.ready(...) 即 $(...)
document.addEventListener('DOMContentLoaded', async () => {
  // 把和数据无关的UI init放到fetchPageData之前，防止用户看到尚未初始化的丑逼UI
  // initToTopButton()
  initNavigationView()
  initWritingModal()
  initClaimSentenceModal()
  const res = await fetchPageData();
  const {question, description, relatedQuestions} = res; // answers 和 collapsedAnswers在await之后已经写入全局


  // 加载问题
  document.getElementById('question').textContent = question
  document.getElementById('question-description').textContent = description


    
  // 加载所有回答
  const answerContainer = document.getElementById('answer-container')
  const answerTemplate = document.getElementById('template-answer').content.firstElementChild
  answers.forEach((ans, ansIdx) => {
    // 加载单个回答的内容
    const answerNode = answerTemplate.cloneNode(true)
    answerNode.classList.add(`answer-${ansIdx}`)
    answerNode.querySelector('.content').innerHTML = ans.html
    answerNode.querySelector('.avatar').src = ans.author.avatar
    answerNode.querySelector('.date').textContent = dayjs(ans.date).format('MMM D, YYYY')
    answerNode.querySelector('.author-name').textContent = ans.author?.name ?? 'Anonymous'
    answerNode.querySelector('.author-description').textContent = ans.author?.description
    

    //加载单个回答的数据
    answerNode.querySelector('.views').textContent = ans.statisticsData?.views
    answerNode.querySelector('.upvotes').textContent = ans.statisticsData?.upvotes
    markClaimAndPremise(answerNode, ans.premise, ansIdx, 'premise')
    markClaimAndPremise(answerNode, ans.claim, ansIdx, 'claim')
    answerContainer.append(answerNode)
  })

  
})

// 监听所有点击事件
document.addEventListener('click', (e) => {
  if (!e.target) return
  if (e.target.matches('.content-collapse-button')) {
    const buttonEl = e.target
    const contentEl = buttonEl.parentElement.querySelector('.content')
    if (contentEl.classList.toggle('truncate')) { // returns true if now present
      buttonEl.innerHTML = '<i class="bi bi-caret-down-fill"></i> Expand'
    } else {
      buttonEl.innerHTML = '<i class="bi bi-caret-up-fill"></i> Collapse'
    }
  }
  else if (e.target.matches('.writing-answer-button')) {
    writingModal.show()
  }
  else if (e.target.matches('.claim-center')){
    flipNavigationView('claim-center', e.target)
  }
  else if (e.target.matches('.pct-bar__fill')){
    displayClaimCenters(e.target)
  }
  else if (e.target.matches('.claim-detail')){
    const ansIdx = e.target.getAttribute('original-ans-idx')
    scrollIntoView(`.answer-outer.answer-${ansIdx}`)
  }
})