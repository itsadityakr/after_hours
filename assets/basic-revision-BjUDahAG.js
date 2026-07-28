var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The skeleton

- Outer loop is rows, inner loop is columns, \`println()\` at the end of the outer
  body ends the line.
- \`print\` does not end a line. \`println\` does. That is the whole difference.
- Only the **condition for one cell** changes between patterns. If you are
  rewriting the loops, you are solving the wrong half.
- Number rows from 1. The formulas below are written that way and stay free of
  corrections.

## The formulas worth knowing by heart

![One centred row split into its spaces and its odd number of stars](diagrams/basic-revision-row-anatomy.jpg)

| Shape, row \`r\` of \`n\` | Spaces | Stars |
|---|---|---|
| Right half pyramid | 0 | \`r\` |
| Inverted right half pyramid | 0 | \`n - r + 1\` |
| Full pyramid | \`n - r\` | \`2r - 1\` |
| Inverted full pyramid | \`r - 1\` | \`2(n - r) + 1\` |
| Butterfly, per side | gap \`2(n - r)\` | \`r\` |

- Stars in a centred row are always **odd** — \`2r - 1\`. That is what centres it.
- An inverted shape is the same formulas with the outer loop counting down.

## Hollow

- A hollow shape is the solid one, printing a space unless the cell is on the
  outline. Get the solid one right first.
- Square border: \`row == 1 || row == n || col == 1 || col == n\`.
- Pyramid border: first star, last star, or the bottom row.
- Write it as an \`if\` inside a full \`col <= n\` loop, not as clever bounds. It
  reads as a sentence about the picture.

## Diagonals and composites

![The two diagonals of a square drawn as row equals col and row plus col equals n plus one](diagrams/basic-revision-diagonals.jpg)

- Leading diagonal: \`row == col\`. Anti-diagonal: \`row + col == n + 1\`.
- Cross is both diagonals. Plus is the middle row and the middle column.
- Diamond is a pyramid then an inverted one; hourglass is the other order.
- The second half starts at \`n - 1\`, not \`n\`, or the widest row prints twice.

## The bugs

- \`println\` inside the inner loop → one character per line.
- No \`println\` after the inner loop → everything on one line.
- Bounds guessed rather than drawn → two off-by-ones that cancel on n = 3.
- Only tested on one \`n\`. Always try 1, an even one, and an odd one.
- Shared row printed twice in every stacked shape.
- \`line += "*"\` in a loop is quadratic. Print directly, or use \`StringBuilder\`.

## Worth remembering

- \`" ".repeat(k)\` and \`"*".repeat(k)\` from Java 11 make these one line each,
  once you know the counts.
- \`System.out.printf("%3d", x)\` right-aligns in three columns — the neat answer
  to number grids.
- Cost is O(n²) for every one of them: each cell is printed once.
- Nobody asks these in an interview. They are here so that the nested loop is
  automatic by the time a grid problem needs one.
`;export{e as default};