// ==UserScript==
// @name         ECTS Calculator
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Calculates total ECTS of positively evaluated courses and injects it into the page
// @author       You
// @match        https://kusss.jku.at/kusss/gradeinfo.action*
// @grant        none
// ==/UserScript==

; (function () {
  'use strict'

  // run after the page is fully loaded
  window.addEventListener('load', () => {
    let totalEcts = 0
    let items = []
    let contentCell = document.querySelector('div.contentcell')

    if (!contentCell) return

    Array.from(contentCell.querySelectorAll('tr')).forEach((row) => {
      let titleElement = row.querySelector('td:nth-last-child(7)')
      let gradeElement = row.querySelector('td:nth-last-child(6) strong')
      let ectsCell = row.querySelector('td:nth-last-child(3)')

      if (gradeElement && ectsCell) {
        let grade = gradeElement.innerText.trim()
        if (grade !== '' && grade !== 'nicht genügend') {
          let ects = parseFloat(ectsCell.innerText.trim().replace(',', '.'))
          if (!isNaN(ects) && ects > 0) {
            totalEcts += ects
            items.push({
              name: titleElement ? titleElement.innerText.trim() : '—',
              grade,
              ects,
            })
          }
        }
      }
    })

    // fix floating point math errors
    totalEcts = Math.round(totalEcts * 10) / 10

    contentCell.style.position = 'relative'

    let resultBox = document.createElement('div')
    resultBox.innerHTML = `<strong>Total ECTS: ${totalEcts}</strong>`

    resultBox.style.cssText = `
      position: absolute;
      top: 15px;
      right: 15px;
      background: #eef;
      border: 1px solid #336;
      padding: 8px 12px;
      border-radius: 4px;
      color: #336;
      font-family: sans-serif;
      z-index: 9999;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ${items.length > 0 ? 'cursor: pointer;' : ''}
      user-select: none;
    `

    // --- Dropdown list ---
    let dropdown = document.createElement('div')
    dropdown.style.cssText = `
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 4px;
      background: #fff;
      border: 1px solid #336;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 320px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 10000;
      font-family: sans-serif;
      font-size: 13px;
    `

    // Header row
    let header = document.createElement('div')
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      padding: 6px 10px;
      background: #336;
      color: #fff;
      font-weight: bold;
      border-radius: 3px 3px 0 0;
      position: sticky;
      top: 0;
    `
    header.innerHTML = `
      <span style="flex:1;">Course</span>
      <span style="width:80px;text-align:center;">Grade</span>
      <span style="width:60px;text-align:right;">ECTS</span>
    `
    dropdown.appendChild(header)

    // Item rows
    items.forEach((item, i) => {
      let row = document.createElement('div')
      row.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 10px;
        border-bottom: 1px solid #e0e0f0;
        background: ${i % 2 === 0 ? '#f8f8ff' : '#fff'};
      `
      row.innerHTML = `
        <span style="flex:1;padding-right:8px;">${item.name}</span>
        <span style="width:80px;text-align:center;color:#336;">${item.grade}</span>
        <span style="width:60px;text-align:right;font-weight:bold;">${item.ects}</span>
      `
      dropdown.appendChild(row)
    })

    if (items.length > 0) {
      // Toggle dropdown on click
      let isOpen = false
      resultBox.addEventListener('click', (e) => {
        e.stopPropagation()
        isOpen = !isOpen
        dropdown.style.display = isOpen ? 'block' : 'none'
      })

      // Close when clicking outside
      document.addEventListener('click', () => {
        if (isOpen) {
          isOpen = false
          dropdown.style.display = 'none'
        }
      })

      resultBox.appendChild(dropdown)
    }

    contentCell.appendChild(resultBox)
  })
})()
