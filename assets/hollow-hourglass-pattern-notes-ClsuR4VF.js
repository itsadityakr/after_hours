var e=`The hourglass reduced to its outline: the top edge, the bottom edge, and the
four slopes that run between them. The waist stays a single star, because there
the two slopes meet.

## The shape

\`\`\`text
n = 5
*********
 *     *
  *   *
   * *
    *
   * *
  *   *
 *     *
*********
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
*******   row 1: full — the top edge
 *   *    row 2: two edges, 3 spaces between
  * *     row 3: two edges, 1 space
   *      row 4: the waist — one star
  * *     row 5: and back out again
 *   *    row 6:
*******   row 7: full — the bottom edge
\`\`\`

Only the first and last star of each row survive; the first and last rows are
the exception and stay solid, the way the hollow pyramid keeps its base. The gap
between the slopes shrinks by two each row down to nothing at the waist, then
grows by two again.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};