

let answers; // 全局answers（应该不需要全局留着question吧）
let writingModal;

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
        const tooptipSpan = document.createElement('span')
        tooptipSpan.classList.add(`${sentenceCategory}-detail`)
        tooptipSpan.innerHTML = `Testing Tooltip Text<br>Second row<br>This sentence is a ${sentenceCategory}`
        el.appendChild(tooptipSpan)
        el.setAttribute('answer-idx', answerIndex)
        const highlightColor = sentenceCategory == "claim" ? "#c7ffdd" : "#f5c8ff"
        el.style.background = highlightColor
      }
    })
  })
}
function fetchClaimDetailList(claimIdx){
  return `claim-${claimIdx}`
}

function initWritingModal(){
  const writingModalEl = document.getElementById('writingModal')
  writingModal = new bootstrap.Modal(writingModalEl)
}

function initNavigationView(){
  // draw the donuts chart
  const chartContainer = document.getElementById('chart-container')
  const data = [
    {
        type: 'pie',
        values: [20, 30, 50],
        labels: ["Claim1", "Claim2", "Claim3"],
        text: ['', '', ''],
        hole: 0.3,
        // pull: [0, 0.2, 0]
        hoverinfo: 'click to see more'
    },
  ]
  const layout = {
    height: 300,
    width: 294,
    margin: {b: 30, t: 30, l:0, r:90, autoexpand: false},
    legend: {itemclick: false, itemdoubleclick: false}

  }

  Plotly.newPlot(chartContainer, data, layout, {displayModeBar: false})
  const lengendContainer = chartContainer.querySelector('.legend')

  const legendGroup = lengendContainer.querySelectorAll('.groups > .traces > rect')
  legendGroup.forEach(el => {
    el.style.cursor = 'auto'
  })

  const donutContainer = chartContainer.querySelector('.pielayer')
  const sliceEls = donutContainer.querySelectorAll('.slice > .surface')
  sliceEls.forEach(el => {
    el.style.cursor = 'pointer'
  })

  // add claim detail list next to the chart
  const detailListContainer = document.getElementById('claim-detail-list-container')
  chartContainer.on('plotly_click', function(data){

    // here we get the index of the clicked segment
    const claimIdx = data.points[0].pointNumber
    if(claimIdx != null){ // if clicking on the segment
      if (detailListContainer.style.display != 'none' && detailListContainer.getAttribute('display-claim-index') == claimIdx){
        detailListContainer.style.setProperty('display', 'none')
        detailListContainer.setAttribute('display-claim-index', -1)
      }
      else {
        const detailEls = detailListContainer.querySelectorAll('li')
        detailEls.forEach(p => {
          p.textContent = fetchClaimDetailList(claimIdx)
        })
        detailListContainer.style.setProperty('display', 'block')
        detailListContainer.setAttribute('display-claim-index', claimIdx)
      }
    }

    
    
  })
}



// 等价于jQuery的 $.ready(...) 即 $(...)
document.addEventListener('DOMContentLoaded', async () => {
  // 把和数据无关的UI init放到fetchPageData之前，防止用户看到尚未初始化的丑逼UI
  initToTopButton()
  initNavigationView()
  initWritingModal()
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
    markClaimAndPremise(answerNode, ans.premise, ansIdx, 'claim')
    markClaimAndPremise(answerNode, ans.claim, ansIdx, 'premise')
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
  if (e.target.matches('.writing-answer-button')) {
    if(true){
      writingModal.show()
    }
      
  }
})