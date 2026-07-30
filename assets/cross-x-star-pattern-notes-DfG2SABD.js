var e=`Two diagonals of an \`n\` by \`n\` grid and nothing else. The first pattern where
the rule is about the column *number* rather than about a count of stars, so it
is read cell by cell instead of run by run.

## The shape

\`\`\`text
n = 5
*   *
 * *
  *
 * *
*   *
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
*  *      row 1: col 1 and col 4
 **       row 2: col 2 and col 3
 **       row 3: col 2 and col 3
*  *      row 4: col 1 and col 4
\`\`\`

A cell is a star when \`col == row\` — the main diagonal — or when
\`col == n - row + 1\`, the other one. On an odd \`n\` those two agree once, in the
centre, and the X has a crossing point; on an even \`n\` they never meet and the
middle is two rows of touching pairs.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};