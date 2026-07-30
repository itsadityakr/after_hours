var e=`The diamond reduced to its outline: four slopes and no base at all, so this one
has no solid row anywhere. It is the hollow rule applied to both halves of the
diamond at once.

## The shape

\`\`\`text
n = 5
    *
   * *
  *   *
 *     *
*       *
 *     *
  *   *
   * *
    *
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
   *      row 1: the top point
  * *     row 2: 1 space between the edges
 *   *    row 3: 3 spaces
*     *   row 4: 5 spaces — the widest row
 *   *    row 5: and back in again
  * *     row 6:
   *      row 7: the bottom point
\`\`\`

Only the first and last star of each row survive, top row and bottom row
included — unlike the hollow pyramid, nothing here stays solid. The two points
are single stars because on those rows the first and the last star are the same
cell.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};