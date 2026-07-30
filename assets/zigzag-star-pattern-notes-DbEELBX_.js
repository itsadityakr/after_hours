var e=`The odd one out. It is always three rows tall, and \`n\` is the *width* rather
than the side of a grid — the shape is a wave running left to right, and what
changes with \`n\` is how many times it goes up and down.

## The shape

\`\`\`text
n = 5
  *
 * *
*   *
\`\`\`

## Reading it row by row

\`\`\`text
n = 9
  *   *      row 1: cols 3 and 7 — the peaks
 * * * *     row 2: cols 2, 4, 6 and 8 — the slopes
*   *   *    row 3: cols 1, 5 and 9 — the troughs
\`\`\`

Read down a column rather than along a row and the wave is obvious: the marked
columns step 1, 2, 3, 2, 1, 2, 3 … and repeat with a period of four. That
repeating four is why the rule for a cell here is written with a remainder
rather than with a count of stars.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};