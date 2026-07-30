var e=`The square with its middle taken out — the first hollow shape, and the easiest
place to learn the trick behind all of them: keep the full loop over every cell
and change only the decision about what that cell prints.

## The shape

\`\`\`text
n = 5
*****
*   *
*   *
*   *
*****
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
****      row 1: full — the top edge
*  *      row 2: two edges, 2 spaces between
*  *      row 3: two edges, 2 spaces between
****      row 4: full — the bottom edge
\`\`\`

A cell is a star when it is on the border: first row, last row, first column or
last column. Everything else is a space — a space that still has to be printed,
because the stars after it have to land in the right column.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};