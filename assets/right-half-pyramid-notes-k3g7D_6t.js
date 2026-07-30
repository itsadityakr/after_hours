var e=`The right half of a pyramid, which is why it is left-aligned: the straight edge
is on the left and the slope is on the right. One star on the first row, two on
the second, and so on down to \`n\`.

## The shape

\`\`\`text
n = 5
*
**
***
****
*****
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
*         row 1: 1 star
**        row 2: 2 stars
***       row 3: 3 stars
****      row 4: 4 stars
\`\`\`

The star count *is* the row number, so a cell holds a star when its column is at
most its row. No leading spaces anywhere — the straight edge is the left one,
and that is what makes this the cheapest pattern to get right.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};