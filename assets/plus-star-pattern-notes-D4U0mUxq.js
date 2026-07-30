var e=`One full row and one full column, crossing in the middle of an \`n\` by \`n\` grid.
Like the cross, the rule is about position rather than about counting — and this
one wants an odd \`n\`, because an even grid has no middle to put the bar on.

## The shape

\`\`\`text
n = 5
  *
  *
*****
  *
  *
\`\`\`

## Reading it row by row

\`\`\`text
n = 7
   *      row 1: the middle column only
   *      row 2:
   *      row 3:
*******   row 4: the middle row — every column
   *      row 5:
   *      row 6:
   *      row 7:
\`\`\`

The middle is row \`(n + 1) / 2\` and the same column, so a cell is a star when it
is on either. Every other cell is a space, and the leading ones still have to be
printed for the vertical bar to stay under the middle of the horizontal one.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};