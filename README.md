# ects.js

A ligth-weight userscript that displays your total ECTS and weighted GPA on the "Results on my exams" page.

<img width="1658" height="437" alt="image" src="https://github.com/user-attachments/assets/fc76a211-8b13-4f5b-a5e0-b9a7fca636f1" />

The script also logs to the console:
- the total ECTS and weighted GPA
- a table with the courses selected for calculation (e.g. to check what courses the script managed to find)

<details>
  <summary>See the example console output</summary> 
  <img width="770" height="707" alt="image" src="https://github.com/user-attachments/assets/0bf864fe-3648-4751-8cc0-a040e021842e" />
</details>

## Course Ignore List

If there are any courses you wish to exclude from the calculation, you can add them to the `courseIgnoreList` array at the top of the script. The script also displays the ignored courses in a tooltip when you hover over the result box.
