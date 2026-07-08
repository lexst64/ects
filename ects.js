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

  const TITLE_COL_OFFSET = 7
  const GRADE_COL_OFFSET = 6
  const ECTS_COL_OFFSET = 3
  const BADGE_Z_INDEX = 9999
  const DROPDOWN_Z_INDEX = 10000
  const DROPDOWN_MIN_WIDTH = '320px'
  const DROPDOWN_MAX_HEIGHT = '400px'

  window.addEventListener('load', () => {
    let totalEcts = 0
    const items = []
    const seenCourses = new Set()
    const contentCell = document.querySelector('div.contentcell')

    if (!contentCell) return

    Array.from(contentCell.querySelectorAll('tr')).forEach((row) => {
      const titleElement = row.querySelector(`td:nth-last-child(${TITLE_COL_OFFSET})`)
      const gradeElement = row.querySelector(`td:nth-last-child(${GRADE_COL_OFFSET}) strong`)
      const ectsCell = row.querySelector(`td:nth-last-child(${ECTS_COL_OFFSET})`)

      if (gradeElement && ectsCell) {
        const grade = gradeElement.innerText.trim()
        if (grade !== '' && grade !== 'nicht genügend') {
          const courseName = titleElement ? titleElement.innerText.trim() : '—'
          if (seenCourses.has(courseName)) return
          seenCourses.add(courseName)
          const ects = parseFloat(ectsCell.innerText.trim().replace(',', '.'))
          if (!isNaN(ects) && ects > 0) {
            totalEcts += ects
            items.push({
              name: courseName,
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

    const resultBox = document.createElement('div')
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
      z-index: ${BADGE_Z_INDEX};
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ${items.length > 0 ? 'cursor: pointer;' : ''}
      user-select: none;
    `

    const dropdown = document.createElement('div')
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
      min-width: ${DROPDOWN_MIN_WIDTH};
      max-height: ${DROPDOWN_MAX_HEIGHT};
      overflow-y: auto;
      z-index: ${DROPDOWN_Z_INDEX};
      font-family: sans-serif;
      font-size: 13px;
      cursor: auto;
      user-select: text;
    `

    const header = document.createElement('div')
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

    items.forEach((item, i) => {
      const row = document.createElement('div')
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
      let isOpen = false
      resultBox.addEventListener('click', (e) => {
        e.stopPropagation()
        isOpen = !isOpen
        dropdown.style.display = isOpen ? 'block' : 'none'
      })

      document.addEventListener('click', () => {
        if (isOpen) {
          isOpen = false
          dropdown.style.display = 'none'
        }
      })

      dropdown.addEventListener('click', (e) => e.stopPropagation())

      resultBox.appendChild(dropdown)
    }

    contentCell.appendChild(resultBox)
  })
})()
