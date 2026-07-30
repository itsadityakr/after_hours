var e=`A full pyramid with the inverted one under it, sharing the widest row. Two
shapes you have already drawn, printed back to back — which is the whole idea,
and it holds for the hourglass and the butterfly too.

## The shape

\`\`\`text
n = 5
    *
   ***
  *****
 *******
*********
 *******
  *****
   ***
    *
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
   *      row 1: 3 spaces, 1 star
  ***     row 2: 2 spaces, 3 stars
 *****    row 3: 1 space,  5 stars
*******   row 4: 0 spaces, 7 stars — the widest row
 *****    row 5: and the same rows back up
  ***     row 6:
   *      row 7:
\`\`\`

\`2n - 1\` rows, not \`2n\`: the widest row belongs to both halves and is printed
once. Printing it twice gives the other common diamond — a legitimate shape, but
a different one, so decide which is wanted before counting rows.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};