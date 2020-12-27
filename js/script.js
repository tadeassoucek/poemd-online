/* Load with `defer`! */

const poemd = require("poemd-parser")

function $(q) {
  return document.querySelector(q)
}

let lastCompilation

function compile() {
  lastCompilation = Date.now()
  const code = $('#input').value
  const res = poemd.parse(code)
  $('#html-output-raw').value = $('#html-output').innerHTML = res.document.toHTML()
  $('#latex-output-raw').value = res.document.toLatex()
}

$('#compile-button').onclick = compile

$('#input').onkeyup = function() {
  if (!lastCompilation || Date.now() - lastCompilation > 500)
    compile()
}

$('#input').onchange = function() {
  compile()
}

const panel = $('.resizable-w')

panel.addEventListener('mousedown', function(e) {
  if (Math.abs(e.offsetX - parseInt(getComputedStyle(panel).width)) < 5) {
    function resize(e) {
      panel.style.width = e.x + 'px'
    }

    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', function(_) {
      document.removeEventListener('mousemove', resize)
    })
  }
})

$('#show-html-button').onclick = function() {
  $('#html-output-section').classList.toggle('hidden', false)
  $('#latex-output-section').classList.toggle('hidden', true)

  $('#show-html-button').classList.toggle('toggled', true)
  $('#show-latex-button').classList.toggle('toggled', false)
}

$('#show-latex-button').onclick = function() {
  $('#latex-output-section').classList.toggle('hidden', false)
  $('#html-output-section').classList.toggle('hidden', true)

  $('#show-latex-button').classList.toggle('toggled', true)
  $('#show-html-button').classList.toggle('toggled', false)
}

$('#show-normal-button').onclick = function() {
  $('#html-output').classList.toggle('hidden', false)
  $('#html-output-raw-section').classList.toggle('hidden', true)

  $('#show-normal-button').classList.toggle('toggled', true)
  $('#show-raw-button').classList.toggle('toggled', false)
}

$('#show-raw-button').onclick = function() {
  $('#html-output-raw-section').classList.toggle('hidden', false)
  $('#html-output').classList.toggle('hidden', true)

  $('#show-raw-button').classList.toggle('toggled', true)
  $('#show-normal-button').classList.toggle('toggled', false)
}
