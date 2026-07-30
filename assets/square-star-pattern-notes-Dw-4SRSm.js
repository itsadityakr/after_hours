var e=`The first one, and the only one on the list with no condition in it: an \`n\` by
\`n\` block where every cell holds a star. It is here to get the two loops the
right way round — the outer one walking the rows, the inner one walking the
columns of that row, and the line ending when the inner loop does.

## The shape

\`\`\`text
n = 5
*****
*****
*****
*****
*****
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
****      row 1: 4 stars
****      row 2: 4 stars
****      row 3: 4 stars
****      row 4: 4 stars
\`\`\`

Every row is the same row. Nothing in the picture depends on which row you are
standing on, so the cell rule is simply *always a star* — n rows of n stars, and
n² cells printed.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};