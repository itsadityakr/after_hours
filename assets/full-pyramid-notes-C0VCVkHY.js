var e=`The centred one, and the first shape where both halves have to line up. Each row
is a block of leading spaces followed by an odd number of stars, and the odd
count is what puts the apex over the middle of the base.

## The shape

\`\`\`text
n = 5
    *
   ***
  *****
 *******
*********
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
   *      row 1: 3 spaces, 1 star
  ***     row 2: 2 spaces, 3 stars
 *****    row 3: 1 space,  5 stars
*******   row 4: 0 spaces, 7 stars
\`\`\`

Spaces on row \`r\` is \`n - r\`; stars is \`2r - 1\`, always odd. The base is
\`2n - 1\` wide, so the picture is wider than it is tall — a common first bug is
stopping the stars at \`n\` and getting a shape with a flat left edge.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};