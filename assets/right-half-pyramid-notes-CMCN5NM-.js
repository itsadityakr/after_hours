var e=`The right half of a pyramid, left-aligned: the straight edge on the left and the
slope on the right. One star on the first row, two on the second, down to \`n\`.
The cheapest pattern on the sheet, and the one every other pattern is built out
of.

## 1. The problem

Given an integer \`n\`, print a left-aligned triangle of stars with \`n\` rows.

- **In** — \`n\`, the number of rows.
- **Out** — printed to the console, nothing returned.
- **The shape** — row \`r\` holds \`r\` stars, and there are no spaces anywhere.

\`\`\`text
n = 5
*
**
***
****
*****
\`\`\`

The whole specification is one sentence: **the star count is the row number.**
Everything else on this page follows from it.

## 2. The brute force

Two loops. The outer one walks the rows, the inner one walks the stars in that
row, and the line ends when the inner loop does.

\`\`\`java RightHalfPyramid.java @run-right-half-pyramid-right-half-pyramid
static void pattern(int n) {

    for (int row = 1; row <= n; row++) {

        for (int col = 1; col <= row; col++) {
            System.out.print("*");
        }

        System.out.println();
    }
}
\`\`\`

\`\`\`output @run-right-half-pyramid-right-half-pyramid
*
*
**
***
****
\`\`\`

\`\`\`demo RightHalfPyramid.java
pattern(1);
pattern(4);
\`\`\`

### The code, line by line

- \`for (int row = 1; row <= n; row++)\` — the rows, counted from 1 rather than 0.
  Both work; counting from 1 means the inner bound is \`row\` rather than
  \`row + 1\`, which is the version that reads like the sentence above.
- \`for (int col = 1; col <= row; col++)\` — **the inner bound is the outer
  variable.** That one dependency is what makes the shape a triangle instead of a
  rectangle. Put \`n\` there instead of \`row\` and you have the square pattern.
- \`System.out.print("*")\` — **\`print\`, not \`println\`.** A newline here gives one
  star per line and a very tall, very thin triangle.
- \`System.out.println()\` — **outside the inner loop, inside the outer one.** This
  is the line that ends the row, and its position is the single most common
  mistake on every pattern problem. One row, one newline.

## 3. Dry run of the brute force

\`n = 4\`. One row per turn of the *outer* loop, with what the inner loop does
spelled out.

| row | inner loop runs for | stars printed | line before println |
|---|---|---|---|
| 1 | \`col = 1\` | 1 | \`*\` |
| 2 | \`col = 1, 2\` | 2 | \`**\` |
| 3 | \`col = 1, 2, 3\` | 3 | \`***\` |
| 4 | \`col = 1, 2, 3, 4\` | 4 | \`****\` |

Total stars printed: 1 + 2 + 3 + 4 = **10**, and four newlines.

The grid the two loops are walking. Green cells are printed; black cells are
never reached, because the inner loop stops at \`col = row\`:

![3. Dry run of the brute force — diagram](diagrams/right-half-pyramid-notes-mm-1.jpg)

**The line between green and black is the inner loop's bound.** \`col <= row\` is
that staircase, written as code. Every other pattern on the sheet is this same
picture with a different line drawn through it — which is why this one is worth
getting exactly right before moving on.

Now \`n = 1\`, the smallest input:

| row | inner loop runs for | output |
|---|---|---|
| 1 | \`col = 1\` | \`*\` and a newline |

The outer loop runs once, the inner once. **No guard needed** — the bounds
already say it.

## 4. Why it is not enough

It is enough, and there is nothing faster to find. The output contains
\`1 + 2 + … + n\` = \`n(n + 1) / 2\` stars, so any solution has to print that many
characters. **O(n²) is the size of the answer, not a cost to reduce.** Space is
O(1) — nothing is stored, everything goes straight out.

What can be improved is the number of \`print\` calls. Every star is its own call
here, and a console write is not free. Building each row in a \`StringBuilder\` and
printing it once per row turns \`n(n+1)/2\` writes into \`n\`. Same shape, same
complexity, noticeably less work — and it is the answer to "can you make this
faster" when the shape itself cannot get smaller.

What this problem is really testing is whether the two loops are the right way
round and whether the \`println\` is in the right place. Get that wrong and nothing
else on the pattern sheet comes out right, because all of them are this loop with
a different inner bound.

## 5. Key takeaways

- **Outer loop is rows, inner loop is columns within a row.** Always, on every
  pattern.
- **The inner bound draws the shape.** \`col <= row\` gives a triangle; \`col <= n\`
  gives a square. Nothing else changes.
- **\`print\` inside, \`println\` outside.** One row, one newline, and the newline
  belongs to the outer loop.
- **Count rows from 1** and the bound reads like the sentence: row \`r\` has \`r\`
  stars.
- **O(n²) is the output size**, so it cannot be beaten — but one \`print\` per row
  beats one per star.
`;export{e as default};