var e=`Two wings facing each other, growing until they meet in the middle and then
shrinking again. Each row is three counts rather than two: stars, then the gap,
then the same stars mirrored.

## The shape

\`\`\`text
n = 5
*        *
**      **
***    ***
****  ****
**********
**********
****  ****
***    ***
**      **
*        *
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
*      *   row 1: 1 star, 6 spaces, 1 star
**    **   row 2: 2 stars, 4 spaces, 2 stars
***  ***   row 3: 3 stars, 2 spaces, 3 stars
********   row 4: 4 stars, 0 spaces, 4 stars
********   row 5: and the same rows back down
***  ***   row 6:
**    **   row 7:
*      *   row 8:
\`\`\`

Stars on row \`r\` is \`r\` on each side and the gap between them is \`2(n - r)\`, so
every row is exactly \`2n\` wide. \`2n\` rows too — the widest row is printed twice
here, which is what makes the fold in the middle flat rather than pointed.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};