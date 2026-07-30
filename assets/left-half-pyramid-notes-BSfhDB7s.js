var e=`The same triangle as the right half pyramid, pushed over so the straight edge is
on the right. That push is the whole difference, and it is the first pattern
where something has to be printed that is not a star: the leading spaces.

## The shape

\`\`\`text
n = 5
    *
   **
  ***
 ****
*****
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
   *      row 1: 3 spaces, 1 star
  **      row 2: 2 spaces, 2 stars
 ***      row 3: 1 space,  3 stars
****      row 4: 0 spaces, 4 stars
\`\`\`

Two counts per row and they add up to \`n\`: the spaces run down as \`n - row\` and
the stars run up as \`row\`. Every row is exactly \`n\` characters wide, which is
the check to make when the shape comes out ragged.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};