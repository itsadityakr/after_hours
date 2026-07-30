var e=`The full pyramid with only its outline kept: the two slopes and the base. The
spaces are now of two kinds — the leading ones that centre the row, and the ones
inside the shape between the two edges.

## The shape

\`\`\`text
n = 5
    *
   * *
  *   *
 *     *
*********
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
   *      row 1: the apex — one star
  * *     row 2: two edges, 1 space between
 *   *    row 3: two edges, 3 spaces between
*******   row 4: full — the base
\`\`\`

Within a row's \`2r - 1\` stars, only the first and the last survive; the last row
is the exception and stays solid. The gap between the edges grows by two each
row, which is the same \`2r - 1\` seen from the inside.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};