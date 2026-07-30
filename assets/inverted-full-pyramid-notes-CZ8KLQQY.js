var e=`The full pyramid standing on its point: widest row at the top, single star at
the bottom. Same two counts as the upright one, read in the other direction.

## The shape

\`\`\`text
n = 5
*********
 *******
  *****
   ***
    *
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
*******   row 1: 0 spaces, 7 stars
 *****    row 2: 1 space,  5 stars
  ***     row 3: 2 spaces, 3 stars
   *      row 4: 3 spaces, 1 star
\`\`\`

Spaces on row \`r\` is \`r - 1\` and stars is \`2(n - r) + 1\` — still odd, still
centred over the same middle column. This shape and the upright one printed one
after the other are the hourglass and the diamond, so it is worth being sure of
before those.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};