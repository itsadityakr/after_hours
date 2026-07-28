var e=`A grid is the first structure that asks you to hold two indices at once, and
that is most of the difficulty. Nothing here is deep. Transposing, rotating,
spiralling, marking rows — each is four lines of idea and twenty minutes of
arguing with yourself about whether the loop stops at \`n\` or at \`n - 1\`.

So do not memorise the loops. Draw the 3×3 case, work out where one cell has to
end up, and let the bounds fall out of that. Everyone who writes a spiral from
memory gets it wrong; everyone who draws the boundaries first gets it right.
Most of these problems also ask for it **in place**, with no second grid, and
that constraint is what makes them worth asking.

## A grid in Java is an array of arrays

There is no two-dimensional array type in Java. \`int[][]\` is an array whose
elements are themselves \`int[]\` references, and everything odd about grids here
follows from that.

\`\`\`java
int[][] m = new int[3][4];        // 3 rows, each a fresh int[4], all zero
int[][] g = { { 1, 2, 3 },
              { 4, 5, 6 } };      // 2 rows, 3 columns

int rows = g.length;              // 2  — how many row arrays there are
int cols = g[0].length;           // 3  — the length of row 0, and only row 0
int v    = g[1][2];               // 6  — row first, then column
\`\`\`

- **\`m.length\` is the number of rows**, a field and not a method.
- **\`m[0].length\` is the width of row 0.** Nothing guarantees row 1 is the same
  length. A grid whose rows differ is *jagged*, and Java allows it —
  \`new int[3][]\` gives three \`null\` rows, and \`{ {1, 2}, {3} }\` is a legal
  \`int[][]\`. So write \`m[r].length\` in the inner loop when you want to be
  exactly right, and reserve \`m[0].length\` for after you have said "assume it is
  rectangular" out loud. It also throws on a grid with zero rows, which is why
  every solution here starts \`if (m.length == 0 || m[0].length == 0) return\`.
- **Row 0 is the top and column 0 is the left**, printed the obvious way. Keep
  that picture; the rotations only mean anything against a fixed idea of up.
- **\`m.clone()\` is a shallow copy** — new outer array, *same* rows, so writing
  to \`copy[1][0]\` changes \`m[1][0]\`. A real copy is a loop of \`m[r].clone()\`.
- **Print with \`Arrays.deepToString(m)\`.** Plain \`println(m)\` gives a hash code,
  because it prints the outer array of references.

## Walking the grid

Row by row, left to right, is row-major order, and it is what a nested loop
written the natural way does. Swap the two loops and you walk column-major
instead, down each column in turn. That is the whole difference, and problems
like [Toeplitz Matrix](problem:toeplitz-matrix) and
[Matrix Diagonal Sum](problem:matrix-diagonal-sum) are one walk with a different
pair of bounds.

\`\`\`java
for (int r = 0; r < m.length; r++)
    for (int c = 0; c < m[r].length; c++)
        visit(m[r][c]);

// the main diagonal is r == c;  the anti-diagonal is r + c == n - 1
// row-major numbering:  i = r * cols + c,  back with r = i / cols, c = i % cols
\`\`\`

That last line is how [Search a 2D Matrix](problem:search-a-2d-matrix) lets you
binary search a grid as though it were one long sorted array — see
[binary search](#/dsa/binary-search/notes).

## The four directions, and the bounds check

A great many grid problems ask about a cell's neighbours: flood fill, islands,
[Word Search](problem:word-search), [Game of Life](problem:game-of-life),
[Shortest Path in Binary Matrix](problem:shortest-path-in-binary-matrix). Do not
write four copies of the same \`if\`. Put the offsets in an array, each entry a
\`{ rowChange, colChange }\` pair, and loop over it.

\`\`\`java
static final int[][] DIRS = { { 0, 1 }, { 1, 0 }, { 0, -1 }, { -1, 0 } };
static final int[][] DIRS8 = { { 0, 1 }, { 1, 1 }, { 1, 0 }, { 1, -1 },
                               { 0, -1 }, { -1, -1 }, { -1, 0 }, { -1, 1 } };

for (int[] d : DIRS) {
    int nr = r + d[0], nc = c + d[1];
    if (nr < 0 || nr >= m.length || nc < 0 || nc >= m[0].length) continue;
    visit(m[nr][nc]);
}
\`\`\`

\`DIRS8\` adds the diagonals, for problems where a corner counts as a neighbour.
The bounds check is not optional — stepping off the edge is an
\`ArrayIndexOutOfBoundsException\`, not a quiet \`null\` — and all four conditions
are needed. Write it once as an \`inside(m, r, c)\` helper and you stop getting it
wrong. Once you are stepping between neighbouring cells you are doing a graph
search with the edges implied rather than stored, which is why the grid problems
and the [graphs](#/dsa/graphs/notes) problems are the same problems in different
packaging.

## Transpose, and why the inner loop starts at i + 1

![Only the cells above the diagonal are visited by the transpose loop](diagrams/matrix-notes-transpose-upper-triangle.jpg)

Transposing reflects the grid across its main diagonal: whatever was at \`(i, j)\`
ends up at \`(j, i)\`, so rows become columns. For a **square** grid you can do it
in place by swapping pairs.

\`\`\`text
1 2 3        1 4 7
4 5 6   ->   2 5 8
7 8 9        3 6 9
\`\`\`

\`\`\`java
for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++) {
        int t = m[i][j];  m[i][j] = m[j][i];  m[j][i] = t;
    }
\`\`\`

The \`j = i + 1\` is the entire subtlety. A swap handles **both** cells at once —
one visit to the pair \`(0,1)\`/\`(1,0)\` finishes both. If \`j\` started at \`0\` you
would swap that pair, then reach \`(1,0)\` later and swap it straight back. Every
pair is touched twice and the grid comes out unchanged. Starting at \`i + 1\`
visits only the cells strictly above the diagonal, which is each pair exactly
once, and it skips \`i == j\` — as it should, since a cell on the diagonal is its
own reflection. For \`n = 3\` that is three swaps: \`(0,1)\`, \`(0,2)\`, \`(1,2)\`.

A **rectangular** transpose cannot be done in place, because the result has a
different shape: \`r × c\` becomes \`c × r\`. Allocate and copy, which is
[Transpose Matrix](problem:transpose-matrix) in full.

\`\`\`java
int[][] out = new int[m[0].length][m.length];
for (int r = 0; r < m.length; r++)
    for (int c = 0; c < m[r].length; c++) out[c][r] = m[r][c];
\`\`\`

## Rotating in place

[Rotate Image](problem:rotate-image) wants a square grid turned 90° clockwise
with no second grid. You could work out the four-way cycle each cell belongs to,
and people do, and they get the indices wrong. The reliable answer is two steps
you already have.

> **Clockwise: transpose, then reverse each row.**

\`\`\`text
1 2 3      transpose    1 4 7      reverse rows   7 4 1
4 5 6      ---------->  2 5 8      ------------>  8 5 2
7 8 9                   3 6 9                     9 6 3
\`\`\`

> **Anticlockwise: transpose, then reverse each column.**

\`\`\`text
1 2 3      transpose    1 4 7      reverse cols   3 6 9
4 5 6      ---------->  2 5 8      ------------>  2 5 8
7 8 9                   3 6 9                     1 4 7
\`\`\`

Check a cell rather than trusting it: the \`1\` starts top-left, and after a
clockwise quarter turn the top-left corner should end up at the top-right. It
does. Reversing each *column* means reversing the **order of the rows**, first
with last and inwards, and because rows are references you swap whole row arrays
rather than cells.

Two things to bank. Order matters — reverse first and transpose second and you
get the other rotation, so if your answer is 90° the wrong way, your two steps
are the wrong way round. And 180° needs no transpose at all: reverse each row,
then reverse the order of the rows.

\`\`\`java Rotations.java @run-matrix-rotations
import java.util.Arrays;

public class Rotations {

    /** Reflect a square grid across its main diagonal, in place. */
    static void transpose(int[][] m) {
        for (int i = 0; i < m.length; i++)
            for (int j = i + 1; j < m.length; j++) {
                int t = m[i][j];
                m[i][j] = m[j][i];
                m[j][i] = t;
            }
    }

    static void reverse(int[] row) {
        for (int lo = 0, hi = row.length - 1; lo < hi; lo++, hi--) {
            int t = row[lo];
            row[lo] = row[hi];
            row[hi] = t;
        }
    }

    /** 90 degrees clockwise: transpose, then reverse each row. */
    static void rotateRight(int[][] m) {
        transpose(m);
        for (int[] row : m) reverse(row);
    }

    /** 90 degrees anticlockwise: transpose, then reverse the order of the rows. */
    static void rotateLeft(int[][] m) {
        transpose(m);
        for (int lo = 0, hi = m.length - 1; lo < hi; lo++, hi--) {
            int[] t = m[lo];
            m[lo] = m[hi];
            m[hi] = t;
        }
    }

    static void show(String label, int[][] m) {
        System.out.println(label);
        for (int[] row : m) System.out.println("  " + Arrays.toString(row));
    }

    public static void main(String[] args) {
        int[][] a = { { 1, 2, 3 }, { 4, 5, 6 }, { 7, 8, 9 } };
        rotateRight(a);
        show("clockwise", a);

        int[][] b = { { 1, 2, 3 }, { 4, 5, 6 }, { 7, 8, 9 } };
        rotateLeft(b);
        show("anticlockwise", b);
    }
}
\`\`\`

\`\`\`output @run-matrix-rotations
clockwise
  [7, 4, 1]
  [8, 5, 2]
  [9, 6, 3]
anticlockwise
  [3, 6, 9]
  [2, 5, 8]
  [1, 4, 7]
\`\`\`

## Zeroing rows and columns in place

[Set Matrix Zeroes](problem:set-matrix-zeroes): wherever the grid holds a \`0\`,
blank that cell's whole row and whole column.

The trap is doing it as you go. Write a row of zeroes immediately and the next
cell you read is a zero you wrote yourself, and the blanking spreads until the
grid is empty. So it is two passes: find the rows and columns first, then apply.

The easy version keeps a \`boolean[rows]\` and a \`boolean[cols]\`, O(r + c) extra
space. The asked-for version is O(1), and the idea is to keep those two flag
arrays **inside the grid**: row 0 becomes the column flags, column 0 becomes the
row flags. That is free, because if any cell in row 0 needs blanking then row 0
ends up all zeroes anyway. The one cell that cannot carry two meanings is
\`m[0][0]\`, which sits in both — so pull one flag out into a single \`boolean\` and
let \`m[0][0]\` speak for the other. The apply pass then runs **backwards**, last
row up and last column back to column 1, because going forwards would overwrite
the flags before the rows below had read them.

\`\`\`java Zeroes.java @run-matrix-zeroes
import java.util.Arrays;

public class Zeroes {

    /** Blank the row and column of every zero, using row 0 and column 0 as the notes. */
    static void setZeroes(int[][] m) {
        if (m.length == 0 || m[0].length == 0) return;
        int rows = m.length, cols = m[0].length;

        // Column 0 cannot hold both its own flag and the flag for row 0.
        boolean firstColumnZero = false;
        for (int r = 0; r < rows; r++) if (m[r][0] == 0) firstColumnZero = true;

        // Mark. Column 0 is left out of the scan; it is the notepad.
        for (int r = 0; r < rows; r++)
            for (int c = 1; c < cols; c++)
                if (m[r][c] == 0) {
                    m[r][0] = 0;
                    m[0][c] = 0;
                }

        // Apply, backwards, so a flag is never overwritten before it is read.
        for (int r = rows - 1; r >= 0; r--) {
            for (int c = cols - 1; c >= 1; c--)
                if (m[r][0] == 0 || m[0][c] == 0) m[r][c] = 0;
            if (firstColumnZero) m[r][0] = 0;
        }
    }

    static void show(int[][] m) {
        for (int[] row : m) System.out.println("  " + Arrays.toString(row));
        System.out.println();
    }

    public static void main(String[] args) {
        int[][] a = { { 1, 1, 1 }, { 1, 0, 1 }, { 1, 1, 1 } };
        setZeroes(a);
        show(a);

        int[][] b = { { 0, 1, 2, 0 }, { 3, 4, 5, 2 }, { 1, 3, 1, 5 } };
        setZeroes(b);
        show(b);

        int[][] c = { { 5 }, { 0 }, { 7 } };   // one column, a zero in it
        setZeroes(c);
        show(c);
    }
}
\`\`\`

\`\`\`output @run-matrix-zeroes
  [1, 0, 1]
  [0, 0, 0]
  [1, 0, 1]

  [0, 0, 0, 0]
  [0, 4, 5, 0]
  [0, 3, 1, 0]

  [0]
  [0]
  [0]
\`\`\`

## Searching a row-and-column-sorted grid

[Search a 2D Matrix II](problem:search-a-2d-matrix-ii) gives a grid where every
row increases left to right and every column increases top to bottom. Note what
it does *not* say: the last value of a row need not be smaller than the first
value of the next, so you cannot treat it as one sorted array.

Start at the **top-right** corner. From there each comparison eliminates a whole
row or a whole column — if the cell is too large then everything below it in
that column is larger still, so drop the column; if it is too small then
everything to its left is smaller still, so drop the row.

\`\`\`java
int r = 0, c = m[0].length - 1;
while (r < m.length && c >= 0) {
    if (m[r][c] == target) return true;
    if (m[r][c] > target) c--; else r++;
}
return false;
\`\`\`

\`\`\`text
[ 1,  4,  7, 11]   target 5, start at 11
[ 2,  5,  8, 12]   11 > 5 -> c--    7 > 5 -> c--    4 < 5 -> r++
[ 3,  6,  9, 16]   m[1][1] = 5, found in three steps
\`\`\`

The corner matters. Top-right works because the two directions disagree — left
gets smaller, down gets larger — so a comparison always rules something out.
Bottom-left works for the same reason; top-left does not, because both
directions grow and a \`<\` tells you nothing about which way to go. Each step
consumes a row or a column, so the walk is at most \`rows + cols\` steps, beating
a binary search per row at \`rows × log cols\`.

![Searching a row-and-column-sorted grid from the top-right corner](diagrams/matrix-notes-corner-search.jpg)

## What it costs

| Operation | Time | Space |
|---|---|---|
| Any full walk | O(rows × cols) | O(1) |
| Transpose or rotate a square grid in place | O(n²) | O(1) |
| Transpose a rectangle | O(rc) | O(rc), the new grid |
| Spiral order | O(rc) | the output list only |
| Set Matrix Zeroes, flag arrays | O(rc) | O(r + c) |
| Set Matrix Zeroes, first row and column | O(rc) | O(1) |
| Search a sorted grid from the corner | O(r + c) | O(1) |
| Neighbour walk over every cell | O(rc) | O(rc) for \`seen\` |

\`O(rows × cols)\` is linear *in the size of the input* even though it is written
with a multiplication — a grid of \`n\` cells cannot be read in fewer than \`n\`
steps. So the interesting question here is nearly always the space, and the
rotation is the one to be able to defend: \`n²\` cells, each moved a constant
number of times, and the only storage is the single \`int\` you swap through.

## The mistakes, in the order people make them

1. **\`m[c][r]\` instead of \`m[r][c]\`.** Row first, always. On a square grid it
   runs and gives the wrong answer, which is worse than crashing.
2. **Using \`m[0].length\` as the width of every row**, or calling it at all on a
   grid with no rows.
3. **Starting the transpose loop at \`j = 0\`.** Every pair swaps twice and the
   grid comes out exactly as it went in.
4. **Transposing a rectangular grid in place.** The shapes do not match; it
   needs a new \`int[cols][rows]\`.
5. **Leaving out the two spiral guards.** Passes every square test case,
   duplicates a row or a column on \`1×n\` and \`n×1\`.
6. **Blanking rows as you find zeroes**, or applying the flags forwards. Mark
   first, apply second, apply backwards.
7. **Forgetting the bounds check on a neighbour step.** \`r - 1\` at \`r == 0\` is
   \`-1\`, which throws rather than wrapping.
8. **\`m.clone()\` as a copy, \`println(m)\` as a print.** Shallow, and a hash code.

## The Java you will reach for

| You want | Write |
|---|---|
| A grid | \`new int[rows][cols]\` |
| Rows, and the width of row \`r\` | \`m.length\`, \`m[r].length\` |
| One cell | \`m[r][c]\` — row first |
| Print the grid, or one row | \`Arrays.deepToString(m)\`, \`Arrays.toString(m[r])\` |
| Copy one row, then the grid | \`m[r].clone()\`, then a loop of those |
| Fill every cell | \`for (int[] row : m) Arrays.fill(row, v)\` |
| Compare two grids | \`Arrays.deepEquals(a, b)\` |
| Sort rows by column 0 | \`Arrays.sort(m, (x, y) -> Integer.compare(x[0], y[0]))\` |
| A visited grid | \`boolean[][] seen = new boolean[rows][cols]\` |
| Four neighbours | \`int[][] DIRS = {{0,1},{1,0},{0,-1},{-1,0}}\` |
| Flatten an index | \`r = i / cols\`, \`c = i % cols\` |
| Walk every row | \`for (int[] row : m)\` — gives you the row array |

\`for (int[] row : m)\` hands you the row *reference*, so \`row[0] = 9\` writes
through to the grid. That is what makes the row reversal in the rotation work,
and it is a surprise the first time it happens by accident.

## Working one from the sheet

[Spiral Matrix](problem:spiral-matrix) reads the grid in a clockwise inward
spiral. Stop thinking about the path and think about four numbers — \`top\`,
\`bottom\`, \`left\`, \`right\`, the edges of the part not yet read. Each leg walks
one edge and then retires it.

\`\`\`text
 1  2  3  4      top=0 bottom=2 left=0 right=3
 5  6  7  8      right along row top    1 2 3 4    top    -> 1
 9 10 11 12      down  along col right  8 12       right  -> 2
                 left  along row bottom 11 10 9    bottom -> 1
                 up    along col left   5          left   -> 1

 6  7            top=1 bottom=1 left=1 right=2
                 right along row top    6 7        top    -> 2
                 down  along col right  (none)     right  -> 1
                 top > bottom now, so the last two legs are skipped
\`\`\`

That skip is what the two guards are for, and they are the part everybody leaves
out. On a square grid they never fire, so the bug survives testing. On a single
row they fire on the first lap: after walking \`1 2 3 4\` rightwards, \`top\` has
become 1 while \`bottom\` is still 0, and without the guard the third leg walks
row 0 again and emits \`3 2 1\`. The \`while\` condition cannot catch that, because
it is checked once per lap while \`top\` and \`right\` both move *inside* the lap.

![A single row spiral, with and without the two boundary guards](diagrams/matrix-notes-spiral-guards.jpg)

\`\`\`java Spiral.java @run-matrix-spiral
import java.util.ArrayList;
import java.util.List;

public class Spiral {

    static List<Integer> spiralOrder(int[][] m) {
        List<Integer> out = new ArrayList<>();
        if (m.length == 0 || m[0].length == 0) return out;

        int top = 0, bottom = m.length - 1;
        int left = 0, right = m[0].length - 1;

        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; c++) out.add(m[top][c]);
            top++;
            for (int r = top; r <= bottom; r++) out.add(m[r][right]);
            right--;
            if (top <= bottom) {                 // still a distinct bottom row?
                for (int c = right; c >= left; c--) out.add(m[bottom][c]);
                bottom--;
            }
            if (left <= right) {                 // still a distinct left column?
                for (int r = bottom; r >= top; r--) out.add(m[r][left]);
                left++;
            }
        }
        return out;
    }

    public static void main(String[] args) {
        System.out.println(spiralOrder(new int[][] { { 1, 2, 3 }, { 4, 5, 6 }, { 7, 8, 9 } }));
        System.out.println(spiralOrder(new int[][] {
            { 1, 2, 3, 4 }, { 5, 6, 7, 8 }, { 9, 10, 11, 12 } }));
        System.out.println(spiralOrder(new int[][] { { 1, 2, 3, 4 } }));      // one row
        System.out.println(spiralOrder(new int[][] { { 1 }, { 2 }, { 3 } })); // one column
        System.out.println(spiralOrder(new int[0][0]));                       // empty
    }
}
\`\`\`

\`\`\`output @run-matrix-spiral
[1, 2, 3, 6, 9, 8, 7, 4, 5]
[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
[1, 2, 3, 4]
[1, 2, 3]
[]
\`\`\`

Run it, then delete the two guards and run it again. The first two cases still
pass. That is the lesson: on this problem a square test proves nothing.

## How to work through the topic

1. [Transpose Matrix](problem:transpose-matrix),
   [Flipping an Image](problem:flipping-an-image),
   [Matrix Diagonal Sum](problem:matrix-diagonal-sum). Indexing drill — get
   \`m[r][c]\`, \`r == c\` and \`r + c == n - 1\` into your fingers, and notice that
   the diagonal sum double-counts the centre of an odd-sized grid.
2. [Toeplitz Matrix](problem:toeplitz-matrix),
   [Count Negative Numbers in a Sorted Matrix](problem:count-negative-numbers-in-a-sorted-matrix).
   Walks with unusual bounds. The second has a staircase answer that is the
   corner search above — find it before you read about it.
3. [Rotate Image](problem:rotate-image),
   [Spiral Matrix](problem:spiral-matrix). The two set pieces. On paper first,
   and test the spiral on \`1×n\` and \`n×1\` or you have not tested it.
4. [Set Matrix Zeroes](problem:set-matrix-zeroes),
   [Valid Sudoku](problem:valid-sudoku). Both are about what you record and
   where you put it. Sudoku's box index is \`(r / 3) * 3 + c / 3\`, and deriving
   that is the point of the problem.
5. [Search a 2D Matrix II](problem:search-a-2d-matrix-ii),
   [Game of Life](problem:game-of-life). Corner navigation, then in-place
   simultaneous update — Game of Life wants a second bit per cell so old and new
   states coexist, the same question as Set Matrix Zeroes wearing a hat.
6. [Word Search](problem:word-search),
   [Shortest Path in Binary Matrix](problem:shortest-path-in-binary-matrix). The
   grid as a graph: backtracking, then breadth-first search. If those feel
   unfamiliar, read [graphs](#/dsa/graphs/notes) and come back.
7. [Maximal Square](problem:maximal-square),
   [Maximal Rectangle](problem:maximal-rectangle),
   [Trapping Rain Water II](problem:trapping-rain-water-ii). The hard band, and
   none is really a grid problem — they are dynamic programming, a monotonic
   [stack](#/dsa/stacks/notes) per row, and a heap. Leave them until the first
   six are routine.
`;export{e as default};