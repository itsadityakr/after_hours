var e=`The diamond turned inside out: the inverted pyramid first, then the upright one
under it. Widest at the top and the bottom, a single star at the waist.

## The shape

\`\`\`text
n = 5
*********
 *******
  *****
   ***
    *
   ***
  *****
 *******
*********
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
*******   row 1: 0 spaces, 7 stars
 *****    row 2: 1 space,  5 stars
  ***     row 3: 2 spaces, 3 stars
   *      row 4: the waist — one star
  ***     row 5: and back out again
 *****    row 6:
*******   row 7:
\`\`\`

\`2n - 1\` rows, with the single star shared by both halves. Same two counts as
the pyramid — \`r - 1\` spaces and an odd star count — run down and then back up,
which is why the two pyramids being right is most of this one being right.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};