var e=`Nobody is asked to print a diamond in an interview. This topic is here for a
different reason: it is the cheapest way to become fluent with a nested loop,
and a nested loop is what a matrix problem, a dynamic programming table and a
brute-force pass are all made of. The output being a picture is what makes it
useful — you can *see* the bug, which you cannot do when the same off-by-one
happens inside a grid of numbers.

Every pattern on the list is one loop inside another. What changes between them
is not the loops. It is the single condition that decides whether a given cell
holds a star or a space.

## Rows and columns, and nothing else

Think of the output as a grid. The outer loop walks the rows, the inner loop
walks the columns of that row, and \`println\` at the end of the outer body ends
the line.

\`\`\`java
for (int row = 1; row <= n; row++) {
    for (int col = 1; col <= n; col++)
        System.out.print(cond(row, col) ? "*" : " ");
    System.out.println();
}
\`\`\`

Three things about that skeleton, and they are the whole topic:

- **\`print\` does not end the line and \`println\` does.** A star printed with
  \`println\` makes a vertical line, which is the first pattern everybody
  accidentally writes.
- **The inner loop runs to completion before the outer loop advances.** All of
  row 1, then all of row 2.
- **\`cond(row, col)\` is the only part that changes.** Every pattern below is
  that skeleton with a different condition. If you find yourself rewriting the
  loops, you are solving the wrong half.

Rows are numbered from 1 here rather than from 0. It is a deliberate departure
from the rest of the sheet: these conditions are almost all written in terms of
"the row number", and starting at 1 keeps them free of \`+ 1\` corrections that
have nothing to do with the shape.

## Work out one cell before you write a loop

This is the actual advice, and it is the difference between five minutes and an
hour. Draw the small case, label the axes, and write the condition for one cell.

Take the right half pyramid, at n = 4:

\`\`\`text
      col 1234
row 1     *
row 2     **
row 3     ***
row 4     ****
\`\`\`

Row 1 has one star, row 2 has two. So a cell is a star when \`col <= row\`. That
is the whole problem, and now the loop writes itself:

\`\`\`java
for (int row = 1; row <= n; row++) {
    for (int col = 1; col <= row; col++)
        System.out.print("*");
    System.out.println();
}
\`\`\`

Notice that the condition moved into the loop bound. That is an optimisation of
writing, not of running: \`col <= n\` with an \`if (col <= row)\` inside would print
exactly the same thing. When a pattern is symmetric or hollow, keeping the full
\`col <= n\` loop and putting the decision in an \`if\` is usually the clearer of
the two — you can then read the condition as a sentence about the picture.

## The full pyramid, and where the spaces come from

The centred shapes are the first ones that trip people up, because there is a
second thing on every line: the leading spaces.

\`\`\`text
n = 4
   *          row 1: 3 spaces, 1 star
  ***         row 2: 2 spaces, 3 stars
 *****        row 3: 1 space,  5 stars
*******       row 4: 0 spaces, 7 stars
\`\`\`

Read the two columns of that table off the picture rather than deriving them:

- spaces on row \`r\` is \`n - r\`
- stars on row \`r\` is \`2 * r - 1\` — always odd, which is what makes it centred

![Every centred row is n minus r spaces followed by 2r minus 1 stars](diagrams/basic-notes-pyramid-anatomy.jpg)

\`\`\`java Pyramid.java @run-basic-pyramid
public class Pyramid {

    static void pyramid(int n) {
        for (int row = 1; row <= n; row++) {
            for (int space = 1; space <= n - row; space++) System.out.print(" ");
            for (int star = 1; star <= 2 * row - 1; star++) System.out.print("*");
            System.out.println();
        }
    }

    static void invertedPyramid(int n) {
        for (int row = n; row >= 1; row--) {
            for (int space = 1; space <= n - row; space++) System.out.print(" ");
            for (int star = 1; star <= 2 * row - 1; star++) System.out.print("*");
            System.out.println();
        }
    }

    public static void main(String[] args) {
        pyramid(4);
        System.out.println();
        invertedPyramid(4);
    }
}
\`\`\`

\`\`\`output @run-basic-pyramid
   *
  ***
 *****
*******

*******
 *****
  ***
   *
\`\`\`

The inverted version is the same two formulas with the outer loop counting down.
That is worth noticing, because it is true of every inverted shape on the list:
you do not need new arithmetic, you need the rows in the other order.

## Hollow: draw the border, skip the middle

A hollow shape is the solid one with a condition that keeps only the edges. For
a hollow square the edges are the first and last row and the first and last
column:

\`\`\`java
for (int row = 1; row <= n; row++) {
    for (int col = 1; col <= n; col++) {
        boolean border = row == 1 || row == n || col == 1 || col == n;
        System.out.print(border ? "*" : " ");
    }
    System.out.println();
}
\`\`\`

Here the \`if\` form pays for itself: \`border\` reads as the sentence you would say
out loud. Try to express the same thing as loop bounds and you end up with three
loops and a special case for the first row.

For a hollow pyramid the border is the first star of the row, the last star of
the row, and the whole bottom row:

\`\`\`java
// inside the star loop, where \`star\` runs 1..2*row-1
boolean edge = star == 1 || star == 2 * row - 1 || row == n;
System.out.print(edge ? "*" : " ");
\`\`\`

The rule generalises: **a hollow shape prints a space where the solid one printed
a star, unless the cell is on the outline.** Get the solid version right first,
every time. A hollow shape debugged from scratch is two problems at once.

## The composite shapes

The rest of the medium and hard list are two shapes stacked or mirrored, and
none of them need a new idea.

| Shape | What it is |
|---|---|
| Diamond | a pyramid, then an inverted pyramid under it |
| Hourglass | an inverted pyramid, then a pyramid under it |
| Butterfly | left half pyramid and its mirror, with spaces between |
| Cross | the two diagonals of a square |
| Plus | the middle row and the middle column |
| Right Pascal's triangle | a right half pyramid, then an inverted one |

The two diagonals are the only ones with a condition worth writing down. In a
square with rows and columns numbered from 1, a cell is on the leading diagonal
when \`row == col\`, and on the other one when \`row + col == n + 1\`.

\`\`\`java Shapes.java @run-basic-shapes
public class Shapes {

    static void diamond(int n) {
        for (int row = 1; row <= n; row++) line(n - row, 2 * row - 1);
        for (int row = n - 1; row >= 1; row--) line(n - row, 2 * row - 1);
    }

    static void butterfly(int n) {
        for (int row = 1; row <= n; row++) wings(row, 2 * (n - row));
        for (int row = n; row >= 1; row--) wings(row, 2 * (n - row));
    }

    static void cross(int n) {
        for (int row = 1; row <= n; row++) {
            for (int col = 1; col <= n; col++)
                System.out.print(row == col || row + col == n + 1 ? "*" : " ");
            System.out.println();
        }
    }

    static void line(int spaces, int stars) {
        System.out.print(" ".repeat(spaces));
        System.out.println("*".repeat(stars));
    }

    static void wings(int stars, int gap) {
        System.out.print("*".repeat(stars));
        System.out.print(" ".repeat(gap));
        System.out.println("*".repeat(stars));
    }

    public static void main(String[] args) {
        diamond(4);
        System.out.println();
        butterfly(4);
        System.out.println();
        cross(5);
    }
}
\`\`\`

\`\`\`output @run-basic-shapes
   *
  ***
 *****
*******
 *****
  ***
   *

*      *
**    **
***  ***
********
********
***  ***
**    **
*      *

*   *
 * * 
  *  
 * * 
*   *
\`\`\`

\`String.repeat\` is Java 11 and later, and it is the honest way to write this
once you know the counts — the loops were never the point, the arithmetic was.
Write the loop version first if the loop is what you are practising; reach for
\`repeat\` when you are writing the shape as a step inside something larger.

The diamond's second loop starts at \`n - 1\` rather than \`n\`. Start it at \`n\` and
the widest row prints twice, which is the single most common bug in the whole
topic and the reason to always test with an odd and an even \`n\`.

![A diamond printing its widest row twice when the second loop starts at n](diagrams/basic-notes-shared-row.jpg)

## The mistakes, in the order people make them

![Where println goes decides whether the output has a shape at all](diagrams/basic-notes-newline-placement.jpg)

1. **\`println\` inside the inner loop.** One character per line. Look for this
   first when the output is a tall thin mess.
2. **Missing \`println\` after the inner loop.** Everything on one line.
3. **Guessing the bounds.** Two off-by-ones cancel out on n = 3 and both show
   up on n = 4. Draw the picture first.
4. **Testing only one value of n.** Every symmetric shape has a bug that only
   appears on an even n, or only on n = 1.
5. **Forgetting the spaces are printed too.** A centred shape needs the leading
   spaces printed, not implied. Trailing spaces are usually harmless, but a
   judge that compares exact text will disagree.
6. **Printing the shared row twice** in a diamond, hourglass or butterfly.
7. **Building the line with \`+=\` in a loop and then printing it.** It works, and
   for a large \`n\` it is quadratic — see the note on \`StringBuilder\` in
   [strings](#/dsa/strings/notes). Use \`StringBuilder\` or print directly.

## The Java you will reach for

| You want | Write |
|---|---|
| Print without a newline | \`System.out.print(x)\` |
| Print with a newline | \`System.out.println(x)\` |
| An empty line | \`System.out.println()\` |
| \`k\` copies of a string | \`" ".repeat(k)\` (Java 11+) |
| Build a line efficiently | \`StringBuilder sb = new StringBuilder(); sb.append(…)\` |
| Formatted output | \`System.out.printf("%3d", x)\` |

\`printf\` is worth knowing for the number patterns: \`%3d\` right-aligns an integer
in three columns, which lines up a multiplication table without any spacing
arithmetic at all.

## How to work through the topic

The list is already in the right order, and the order is the point — each shape
is the previous one with one thing changed.

1. [Square Star Pattern](problem:square-star-pattern) and the four half
   pyramids. Get to where you write these without pausing.
2. [Full Pyramid](problem:full-pyramid) and
   [Inverted Full Pyramid](problem:inverted-full-pyramid). The first shapes with
   spaces in them.
3. [Hollow Square Pattern](problem:hollow-square-pattern) and
   [Hollow Pyramid Pattern](problem:hollow-pyramid-pattern). The border
   condition, written as an \`if\`.
4. [Diamond Star Pattern](problem:diamond-star-pattern),
   [Butterfly Pattern](problem:butterfly-pattern),
   [Hourglass Pattern](problem:hourglass-pattern). Two shapes stacked, and the
   shared-row bug.
5. [Cross (X) Star Pattern](problem:cross-x-star-pattern),
   [Plus (+) Star Pattern](problem:plus-star-pattern),
   [Zigzag Star Pattern](problem:zigzag-star-pattern). Conditions on \`row\` and
   \`col\` together rather than on either alone.
6. The hollow versions of the composites. Nothing new — the solid shape plus the
   outline rule.

Then leave the topic. It is a warm-up, and its whole value is that when a
[matrix](#/dsa/matrix/notes) problem asks you to walk a grid in a spiral, the
loops will not be the part you are thinking about.
`;export{e as default};