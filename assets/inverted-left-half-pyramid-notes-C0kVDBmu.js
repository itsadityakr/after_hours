var e=`The left half pyramid upside down: the straight edge stays on the right, the
widest row comes first, and the spaces grow as the stars shrink.

## The shape

\`\`\`text
n = 5
*****
 ****
  ***
   **
    *
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
****      row 1: 0 spaces, 4 stars
 ***      row 2: 1 space,  3 stars
  **      row 3: 2 spaces, 2 stars
   *      row 4: 3 spaces, 1 star
\`\`\`

Spaces on row \`r\` is \`r - 1\` and stars is \`n - r + 1\`, and the two still sum to
\`n\`. Both counts moved compared with the upright version, which is why this one
is worth drawing before writing rather than guessing at.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};