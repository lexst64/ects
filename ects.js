// ==UserScript==
// @name         ECTS & GPA Calculator for KUSSS
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Calculates total ECTS and GPA of positively evaluated courses and injects it into the page
// @author       lexst64
// @match        https://kusss.jku.at/kusss/gradeinfo.action*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jku.at
// @grant        none
// ==/UserScript==

; (function () {
  'use strict'

  const TITLE_COL_OFFSET = 7
  const GRADE_COL_OFFSET = 6
  const ECTS_COL_OFFSET = 3
  const BADGE_Z_INDEX = 9999

  const parseNumericGrade = (gradeStr) => {
    const g = gradeStr.toLowerCase().trim()
    if (g === '1' || g === 'sehr gut') return 1
    if (g === '2' || g === 'gut') return 2
    if (g === '3' || g === 'befriedigend') return 3
    if (g === '4' || g === 'genügend') return 4
    return null
  }

  window.addEventListener('load', () => {
    let totalEcts = 0
    let gradedEctsSum = 0
    let weightedGradeSum = 0
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
            const numGrade = parseNumericGrade(grade)
            if (numGrade !== null) {
              gradedEctsSum += ects
              weightedGradeSum += numGrade * ects
            }
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

    const gpa = gradedEctsSum > 0
      ? Math.round((weightedGradeSum / gradedEctsSum) * 100) / 100
      : null

    contentCell.style.position = 'relative'

    const resultBox = document.createElement('div')
    const gpaText = gpa !== null ? ` | GPA: ${gpa.toFixed(2)}` : ''
    const text = `ECTS: ${totalEcts}${gpaText}`
    resultBox.innerHTML = `<strong>${text}</strong>`

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
      user-select: text;
    `

    console.log(text)
    console.table(items)

    contentCell.appendChild(resultBox)
  })
})()
