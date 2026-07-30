var e=`The butterfly with the inside of each wing removed. Only the outer edge of a
wing survives, except on the two rows in the middle where the wings are solid
and the shape folds.

## The shape

\`\`\`text
n = 5
*        *
**      **
* *    * *
*  *  *  *
**********
**********
*  *  *  *
* *    * *
**      **
*        *
\`\`\`

## Reading it row by row

\`\`\`text
n = 4
*      *   row 1: 1 star, 6 spaces, 1 star
**    **   row 2: the wing is 2 wide — both cells are edges
* *  * *   row 3: only the two edges of a 3-wide wing
********   row 4: the fold — a solid row
********   row 5: and the same rows back down
* *  * *   row 6:
**    **   row 7:
*      *   row 8:
\`\`\`

Within a wing of \`r\` stars only the first and the last are kept, so the gap
inside a wing grows as the gap between the wings shrinks. Rows \`n\` and \`n + 1\`
stay solid; rows 1 and 2 look solid but are not — they are two edges with
nothing, or nothing but themselves, in between.

*Only the shape for now — the loop that prints it comes later.*
`;export{e as default};