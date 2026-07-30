var e=`The right half pyramid with its inverted twin under it — an arrow head pointing
right, with the straight edge on the left and no leading spaces anywhere.

## The shape

\`\`\`text
n = 5
*
**
***
****
*****
****
***
**
*
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
*         row 1: 1 star
**        row 2: 2 stars
***       row 3: 3 stars
****      row 4: 4 stars — the widest row
***       row 5: and back down
**        row 6:
*         row 7:
\`\`\`

\`2n - 1\` rows, the widest one printed once. It is the diamond's construction
without the centring: two triangles you can already draw, stacked — which is
worth noticing, because the shape looks new and the arithmetic is not.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};