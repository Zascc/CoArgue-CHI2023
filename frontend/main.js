const CLAIM_URL = 'http://35.227.185.62:6001/predictions/ClaimExtraction';
const PREMISE_URL = 'http://35.227.185.62:6001/predictions/PremiseExtraction';
const SENTIMENT_URL = 'http://35.227.185.62:6001/predictions/SentimentAnalysis';

let [premiseColor, positiveColor, neutralColor, negativeColor] = ['#b3d9aa', '#5185db', "#b7b7b7", '#dd6765']


let answers; // 全局answers（应该不需要全局留着question吧）
let writingModal;
let claimSentenceModal;
let userPost;

let CLAIM_CENTERS;
let percentage;

let operationLog = {'navigation-view': 0, 'chatbot': 0}

function fetchPageData() {
  // const queryParams = new URLSearchParams(window.location.search)
  // const control = queryParams.get('control') || 'exp'
  // const question = queryParams.get('question') || 'body'
  // const path = `${control}.${question}.js`
  // const path = "data.js"
  // return new Promise((resolve) => {
  //   const documentHead = document.getElementsByTagName('head')[0]
  //   const el = document.createElement('script')
  //   documentHead.appendChild(el)
  //   el.addEventListener('load', () => {
  //     answers = mock.answers
  //     CLAIM_CENTERS = mock.claim_centers
  //     percentage = mock.percentage
  //     resolve(mock)
  //   })
  //   el.type = 'text/javascript'
  //   el.src = path
  // })
  const queryParams = new URLSearchParams(window.location.search)
  const isBaseline = window.location.port == '8001'
  const question = queryParams.get('question')
  if (!question) {
    return new Promise((resolve) => {
      setTimeout(() => {
        answers = mock.answers
        collapsedAnswers = mock.collapsedAnswers
        resolve(mock)
      }, 1000)
    })
  }
  const url = `http://35.222.191.255:8000/${isBaseline ? 'bs' : 'exp'}/${question}.json`
  return fetch(url)
    .then(res => {
      if (res.ok) return res.json()
      else if (res.status == 404) throw new Error('Unknown question')
      throw new Error(`Unknown error: ${res.status} (${res.statusText}) while fetching page data`)
    })
    .then(j => {
      answers = j.answers
      collapsedAnswers = j.collapsedAnswers
      CLAIM_CENTERS = j.claim_centers
      percentage = j.percentage
      return j
    })
    .catch(e => {
      alert(e.message)
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
      each(el) {
        // append tooltip if premise (This design is abandoned)
        if (sentenceCategory == 'premise') {
          // const tooptipSpan = document.createElement('span')
          // tooptipSpan.classList.add(`${sentenceCategory}-detail`)
          // tooptipSpan.innerHTML = `Testing Tooltip Text<br>Second row<br>This sentence is a ${sentenceCategory}`
          // el.appendChild(tooptipSpan)

        }
        el.setAttribute('answer-idx', answerIndex)
        el.setAttribute(`${sentenceCategory}-idx`, sentenceIdx)
        let highlightColor = sentenceCategory == "claim" ? positiveColor : premiseColor
        if (sentenceCategory == 'claim') {
          if (sentence.claimSentiment == 'Neutral') {
            highlightColor = neutralColor
          }
          else if (sentence.claimSentiment == 'Negative') {
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
    el[0].scrollIntoView({ block: 'center' })
    el.forEach((e, i) => {
      if (e.classList.contains('blink')) return
      e.classList.add('blink')
      setTimeout(() => e.classList.remove('blink'), 2000)
    })
  } else {
    if (!el) return
    el.scrollIntoView({ block: 'center' })
    if (el.classList.contains('blink')) return
    el.classList.add('blink')
    setTimeout(() => el.classList.remove('blink'), 2000)
  }
}

function fetchClaimDetailList(claimIdx) {
  return `claim-${claimIdx}`
}

function initWritingModal() {
  const writingModalEl = document.getElementById('writingModal')
  writingModal = new bootstrap.Modal(writingModalEl)

  writingModalEl.addEventListener('show.bs.modal', e => {
    const textareaEl = writingModalEl.querySelector('#answerTextarea')
    if (!userPost) {
      const chatbotMessageEls = document.querySelector('.css-14otd4b').childNodes
      let informationTextList = [];
      chatbotMessageEls.forEach(p => {
        const textContentOfP = p.querySelector("[data-qa='markdown-text']").textContent
        if (p.querySelector("[data-qa='markdown-text']").textContent.includes("Note for you")) {
          informationTextList.push(textContentOfP)
        }
      })
      // console.log(chatbotMessageEls.children)
      // const chatbotMessageTexts = Array(chatbotMessageEls.childNodes).map(p => {
      //   console.log(p)
      //   return p.querySelector("[data-qa='markdown-text']").textContent
      // })
      let informationText;
      if (informationTextList.length > 1) {
        informationText = informationTextList[-1]
      }
      else {
        informationText = informationTextList[0]
      }
      const templateText = informationText
      textareaEl.value = templateText
      if (!templateText) {
        textareaEl.value = ''
      }

    }

    else {

      textareaEl.value = userPost
    }
  })
}




function initNavigationView() {
  // draw the percentage bar
  const pos = percentage.positive
  const neu = percentage.neutral
  const neg = percentage.negative
  const labelPercentageContainer = document.getElementById('label-percentage-container')
  const positiveLabel = labelPercentageContainer.querySelector('.positive')
  const negativeLabel = labelPercentageContainer.querySelector('.negative')
  const neutralLabel = labelPercentageContainer.querySelector('.neutral')

  positiveLabel.textContent = pos
  positiveLabel.style.flexBasis = pos

  negativeLabel.textContent = neg
  negativeLabel.style.flexBasis = neg

  neutralLabel.textContent = neu
  neutralLabel.style.flexBasis = neu

  const textPercentageContainer = document.getElementById('label-text-container')

  const positiveText = textPercentageContainer.querySelector('.positive')
  const negativeText = textPercentageContainer.querySelector('.negative')
  const neutralText = textPercentageContainer.querySelector('.neutral')

  positiveText.style.flexBasis = pos
  negativeText.style.flexBasis = neg
  neutralText.style.flexBasis = neu

  const positiveBar = document.querySelector("[data-pct-bar-bg='po2-bg-primary']")
  positiveBar.textContent = pos
  const negativeBar = document.querySelector("[data-pct-bar-bg='po2-bg-accent']")
  negativeBar.textContent = neg

  const neutralBar = document.querySelector("[data-pct-bar-bg='po2-bg-contrast-low']")
  neutralBar.textContent = neu

  class PercentageBar {
    constructor(element) {
      this.element = element;
      this.bar = this.element.getElementsByClassName('js-pct-bar__bg');
      this.percentages = this.element.getElementsByClassName('js-pct-bar__value');
      initPercentageBar(this);
    }
  }

  function initPercentageBar(bar) {
    if (bar.bar.length < 1) return;
    var content = '';
    for (var i = 0; i < bar.percentages.length; i++) {
      var customClass = bar.percentages[i].getAttribute('data-pct-bar-bg'),
        customStyle = bar.percentages[i].getAttribute('data-pct-bar-style'),
        percentage = bar.percentages[i].textContent;

      if (!customStyle) customStyle = '';
      if (!customClass) customClass = '';
      content = content + '<div class="pct-bar__fill js-pct-bar__fill ' + customClass + '" style="flex-basis: ' + percentage + ';' + customStyle + '"></div>';
    }
    bar.bar[0].innerHTML = content;
  }
  window.PercentageBar = PercentageBar;

  //initialize the PercentageBar objects

  var percentageBar = document.getElementsByClassName('js-pct-bar');
  if (percentageBar.length > 0) {
    for (var i = 0; i < percentageBar.length; i++) {
      (function (i) { new PercentageBar(percentageBar[i]); })(i);
    }
  }
  document.querySelector('.pct-bar__fill.po2-bg-primary').style.backgroundColor = positiveColor
  document.querySelector('.pct-bar__fill.po2-bg-contrast-low').style.backgroundColor = neutralColor
  document.querySelector('.pct-bar__fill.po2-bg-accent').style.backgroundColor = negativeColor

  // remove the labels below after loading the percentage bar
  document.querySelector('.po2-grid.po2-gap-xs').remove()
  // const verticalLine = document.createElement('div')
  // verticalLine.setAttribute('id', 'vertical-line')
  // verticalLine.classList.add('vertical-line')
  // document.querySelector('.pct-bar__bg').prepend(verticalLine)
}




function flipNavigationView(currentView, el) {
  operationLog["navigation-view"] += 1
  if (currentView == 'claim-center') {
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

        if (p.claimCenter == el.textContent.trim().slice(5)) { // remove the index label (PC1: )
          const claimEl = document.createElement('li')
          claimEl.innerHTML = `${p.content}`
          claimEl.classList.add("claim-detail", "list-group-item")
          claimEl.setAttribute('original-ans-idx', ansIdx)
          claimEl.setAttribute('title', 'click to jump to the original answer')
          return claimEl
        }

      }).filter(claimEl => !!claimEl)
    ], [])

    const claimDetailPage = document.getElementById('claim-detail-page')
    const claimDetailList = claimDetailPage.querySelector('.list-group')

    claimList.forEach(p => {
      claimDetailList.append(p)
    })

    claimDetailPage.style.setProperty('display', 'block')
  }
  else if (currentView == 'claim-detail') {
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

function displayClaimCenters(el) {

  document.querySelectorAll('.pct-bar__fill').forEach(p => {
    p.style.border = null
  })
  const elClassList = el.classList
  const stance = elClassList.contains("po2-bg-primary") ? "positive" : elClassList.contains("po2-bg-contrast-low") ? "neutral" : "negative"

  // calculate the percentage of each stance
  function claimCentersSelector(x) {
    return CLAIM_CENTERS[x].sort((c1, c2) => c2.supportiveness - c1.supportiveness)
  }

  const claimCenters = claimCentersSelector(stance)
  const stanceFirstLetter = stance[0].toUpperCase()
  const claimCenterEls = claimCenters.map((p, idx) => {
    const { text, supportiveness } = p
    const claimEl = document.createElement('li')
    claimEl.innerHTML = `<div class="stance-content">
      <span class='${stance}'>${stanceFirstLetter}C${idx + 1}:</span> ${text}
    </div>
    <div class="stance-supportiveness">
      ${supportiveness.toFixed(2)}
    </div>` // need to adjust the color to be in line with the stance color
    claimEl.classList.add("claim-center", "list-group-item")
    claimEl.setAttribute('claim-center-sentiment', stance)

    // <div class="progress"><div class="progress-bar" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div></div>

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

  if (detailListContainer.style.getPropertyValue('display') == 'block' && detailListContainer.getAttribute('display-claim-stance') == stance) {
    detailListContainer.style.setProperty('display', 'none')
    el.style.border = null
  }
  else {
    detailListContainer.style.setProperty('display', 'block')
    detailListContainer.setAttribute("display-claim-stance", stance)
    el.style.border = '2px solid rgb(215, 215, 14)'
  }
}

function initChatbot() {
  const chatWidgetContainer = document.getElementById('rasa-chat-widget-container')


  const chatbotButton = chatWidgetContainer.querySelector('button.large.css-qmypsf')  // init展示 click button收起来 然后调数值展开
  const chatbotBox = chatWidgetContainer.querySelector('div')
  chatbotButton.click()
  chatbotButton.style.display = 'none'

}

function initRightSideSplit() {
  window.Split(['#note-pane-card', '#chatbot-pane-card'], {
    sizes: [40, 60],
    gutterSize: 24,
    direction: 'vertical',
    cursor: 'row-resize',
  })
}

function addChatBubbleElement(el) {
  const chatbotMessageEls = document.querySelector('.css-14otd4b') // all dialogue bubbles
  const newMessage = document.createElement('div')

  const chosenPremiseIdx = el.getAttribute('premise-idx')
  const chosenAnsIdx = el.getAttribute('answer-idx')

  let supportedClaimCenter = answers[chosenAnsIdx].premise[chosenPremiseIdx].supportClaimCenter
  let similarPremise = []
  answers.forEach((ans, idx) => {
    ans.premise.forEach(pre => {
      if (pre.supportClaimCenter == supportedClaimCenter) {
        if (similarPremise.includes(idx) || idx == chosenAnsIdx) {
        }
        else {
          similarPremise.push(idx)
        }


      }
    })
  })

  const newMessagePrev = document.createElement('div')
  let textPrev = `It seems that you are interested in this premise. It is used to support the claim center '${supportedClaimCenter}'.`
  newMessagePrev.innerHTML = `<div role="button" tabindex="0" data-e2e="EventContainer-bot-1660411092.834" id="" class="css-6es4cf"><div class="css-hu563a"><div class="css-463jce"><div class="css-jgse21"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="meh-blank" class="svg-inline--fa fa-meh-blank fa-w-16 css-1y53wuf" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" style="width: 1em;"><path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm-80 232c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm160 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"></path></svg></div></div><div class="css-19h6xf9"><div class="css-l3rx45" aria-describedby="tooltip-4" style="max-width: 320px;"><div data-qa="conversation-message-bubbles_div" class="css-1di2tiy"><div><span data-qa="markdown-text" class="css-8f4u10">${textPrev}</span></div></div></div></div></div></div>`

  let text = `Here are some other premises supporting the same claim center`


  text += '. Click the buttons to jump to those answers.'

  let buttonsHTML = ''; // <div class="css-vurnku"><button data-btn="jump-button" class=" css-1aibqey">Jump to that answer</button></div>
  similarPremise.forEach(idx => {
    buttonsHTML += `<div class="css-vurnku"><button data-btn="jump-button" original-ans-idx="${idx}" class=" css-1aibqey">answer ${idx}</button></div>`
  })
  newMessage.innerHTML = `<div role="button" tabindex="0" data-e2e="EventContainer-bot-1660411092.834" id="" class="css-6es4cf"><div class="css-hu563a"><div class="css-463jce"><div class="css-jgse21"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="meh-blank" class="svg-inline--fa fa-meh-blank fa-w-16 css-1y53wuf" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" style="width: 1em;"><path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm-80 232c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm160 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"></path></svg></div></div><div class="css-19h6xf9"><div class="css-l3rx45" aria-describedby="tooltip-4" style="max-width: 320px;"><div data-qa="conversation-message-bubbles_div" class="css-1di2tiy"><div><span data-qa="markdown-text" class="css-8f4u10">${text}</span></div></div></div></div></div><div class="css-klsenx">${buttonsHTML}</div></div>`
  chatbotMessageEls.append(newMessagePrev)
  chatbotMessageEls.append(newMessage)
}

async function handlePostClicked() {
  const writingModalEl = document.getElementById('writingModal')
  const textareaEl = writingModalEl.querySelector('#answerTextarea')
  userPost = textareaEl.value
  writingModal.hide()

  toggleModal('loading')

  const sentiment = await fetchModelEndpoint(SENTIMENT_URL, userPost, 'Neutral')
  const finalTextEl = document.querySelector('#final-words-container .final-text')
  let text = `Thanks for your sharing! After reading your post, I feel more confident about the Bitcoin topic. <br> <br>Considering your stance, there is a 3% increase in the stance group. Your reasonable premise also increases the supportiveness of the stance group by 4%. <br> <br>I'm pretty sure more and more people will learn a lot from your novel and fascinating answer!`;
  finalTextEl.innerHTML = text

  toggleModal('final')
}

async function OnFinishClicked() {
  toggleModal('loading')

  const [claim, premise] = await Promise.all([
    fetchModelEndpoint(CLAIM_URL, userPost, []),
    fetchModelEndpoint(PREMISE_URL, userPost, []),
  ])

  renderExtraAnswer({
    "html": userPost.split('\n').map(p => "<p class=\"q-text qu-display--block qu-wordBreak--break-word qu-textAlign--start\" style=\"box-sizing: border-box; margin-bottom: 1em; overflow-wrap: anywhere; direction: ltr;\"><span style=\"font-weight: normal; font-style: normal; background: none;\">" + p + "</span></p>").join(''),
    "content": userPost,
    "paragraphs": [],
    "author": {
      "avatar": "avatar.png",
      "name": "Me",
      "description": "",
      "urlEncode": "Akash-Chetwani-1"
    },
    "date": Date.now(),
    claim,
    premise,
  })

  toggleModal()

  let downloadText = userPost

  const chatbotMessageEls = document.querySelector('.css-14otd4b').childNodes
  let informationTextList = [];
  chatbotMessageEls.forEach(p => {
    const textContentOfP = p.querySelector("[data-qa='markdown-text']").textContent
    informationTextList.push(textContentOfP)
    downloadText += '\n'
    downloadText += textContentOfP
  })

  downloadText += '\n'

  operationLog['chatbot'] = informationTextList.length
  
  downloadText += `nav-view: ${operationLog["navigation-view"]}, chatbot: ${operationLog["chatbot"]}`




  download(downloadText)

  userPost = ''
}

function OnUpdateAnswerClicked() {
  toggleModal()
  writingModal.show()
}


// 等价于jQuery的 $.ready(...) 即 $(...)
document.addEventListener('DOMContentLoaded', async () => {
  // 把和数据无关的UI init放到fetchPageData之前，防止用户看到尚未初始化的丑逼UI

  initToTopButton()

  initWritingModal()
  initChatbot()
  initRightSideSplit()
  const res = await fetchPageData();
  initNavigationView()
  const { question, description, relatedQuestions } = res; // answers 和 collapsedAnswers在await之后已经写入全局




  // 加载问题
  document.getElementById('question').textContent = question
  document.getElementById('question-description').textContent = description



  // 加载所有回答
  renderAllAnswers();
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
  else if (e.target.matches('.claim-center') || e.target.matches('.claim-center *')) {
    flipNavigationView('claim-center', e.target)
    
  }
  else if (e.target.matches('.pct-bar__fill')) {
    displayClaimCenters(e.target)
    operationLog["navigation-view"] += 1
  }
  else if (e.target.matches('.claim-detail')) {
    const ansIdx = e.target.getAttribute('original-ans-idx')
    scrollIntoView(`.answer-outer.answer-${ansIdx}`)
    operationLog["navigation-view"] += 1
  }
  else if (e.target.matches("[data-btn='jump-button']")) {
    // to do scrollInto that answer
    const ansIdx = e.target.getAttribute('original-ans-idx')
    scrollIntoView(`.answer-outer.answer-${ansIdx}`)
  }
  else if (e.target.matches('.premise')) {
    addChatBubbleElement(e.target)
  }
  else if (e.target.matches('#writing-modal-close-button')) {
    const writingModalEl = document.getElementById('writingModal')
    const textareaEl = writingModalEl.querySelector('#answerTextarea')
    userPost = textareaEl.value
    writingModal.hide()
  }
  else if (e.target.matches('#post-button')) {
    handlePostClicked()
  }
})

function toggleModal(mode) {
  const finalIsOpen = mode == 'final'
  const loadingIsOpen = mode == 'loading'
  const open = finalIsOpen || loadingIsOpen
  const grayoutEl = document.getElementById('grayout')
  const finalPopupContainer = document.getElementById('final-words-container')
  const loadingContainer = document.getElementById('loading-container')
  finalPopupContainer.style.display = finalIsOpen ? 'block' : 'none'
  loadingContainer.style.display = loadingIsOpen ? 'block' : 'none'
  grayoutEl.style.display = open ? 'block' : 'none'
}

function renderAllAnswers() {
  const answerContainer = document.getElementById('answer-container');
  const answerTemplate = document.getElementById('template-answer').content.firstElementChild;
  answers.forEach((ans, ansIdx) => {
    // 加载单个回答的内容
    const answerNode = createAnswerEl(answerTemplate, ansIdx, ans);
    answerContainer.append(answerNode);
  });
}

function renderExtraAnswer(ans) {
  const answerContainer = document.getElementById('answer-container');
  const answerTemplate = document.getElementById('template-answer').content.firstElementChild;
  const answerNode = createAnswerEl(answerTemplate, 9999, ans);
  answerContainer.prepend(answerNode);
}

function createAnswerEl(answerTemplate, ansIdx, ans) {
  const answerNode = answerTemplate.cloneNode(true);
  answerNode.classList.add(`answer-${ansIdx}`);
  answerNode.querySelector('.content').innerHTML = ans.html;
  answerNode.querySelector('.avatar').src = ans.author.avatar;
  answerNode.querySelector('.date').textContent = dayjs(ans.date).format('MMM D, YYYY');
  answerNode.querySelector('.author-name').textContent = ans.author?.name ?? 'Anonymous';
  answerNode.querySelector('.author-description').textContent = ans.author?.description;



  //加载单个回答的数据

  answerNode.querySelector('.upvotes').textContent = ans.upvotes;
  markClaimAndPremise(answerNode, ans.premise, ansIdx, 'premise')
  markClaimAndPremise(answerNode, ans.claim, ansIdx, 'claim')
  return answerNode;
}

function download(text) {
  const now = dayjs().format('YYYYMMDDHHmmss')
  const filename = `cqa-${now}.txt`
  const dataDownload = text
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataDownload));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function fetchModelEndpoint(url, textData, defaultData) {
  return fetch(url, {
    method: 'POST',
    body: textData,
  })
    .then(res => res.ok ? res.json() : defaultData)
    .catch(() => defaultData)
}