var e=`The right half pyramid with its rows in the other order: the widest row first
and the single star last. No new arithmetic — the same counts, read from the
bottom up.

## The shape

\`\`\`text
n = 5
*****
****
***
**
*
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
****      row 1: 4 stars
***       row 2: 3 stars
**        row 3: 2 stars
*         row 4: 1 star
\`\`\`

Stars on row \`r\` is \`n - r + 1\`, still with no leading spaces. This is the one
to remember when an inverted shape turns up later: you do not need a new rule,
you need the rows counted down instead of up.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};