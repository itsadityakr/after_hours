var e=`Fill an \`n × n\` grid with 1 to n², walking inwards in a spiral. You know the path
before you start, so this is index arithmetic — and the way to make index
arithmetic easy is to stop tracking where you are and start tracking where the
walls are.

## 1. The problem

Given an integer \`n\`, return an \`n × n\` matrix holding 1 through n², laid out in
clockwise spiral order from the top-left.

- **In** — \`n\`, an \`int\`, and \`1 <= n <= 20\`.
- **Out** — \`int[n][n]\`, every cell written exactly once.
- **The path** — right along the top, down the right side, left along the
  bottom, up the left side, then in one layer and round again.

\`n\` is at least 1, so there is no empty matrix to defend against, and 20 is tiny
— n² is at most 400. Nothing here is about speed. The marks are entirely for
getting the boundaries right.

## 2. The brute force

Track where you are and which way you are pointing. Turn when the next step would
leave the grid or land on a cell that already holds a number.

\`\`\`java SpiralTurn.java @run-spiral-matrix-ii-spiral-turn
static int[][] generateMatrix(int n) {

    int[][] matrix = new int[n][n];

    int[] dr = { 0, 1, 0, -1 };
    int[] dc = { 1, 0, -1, 0 };

    int r = 0;
    int c = 0;
    int dir = 0;

    for (int num = 1; num <= n * n; num++) {

        matrix[r][c] = num;

        int nr = r + dr[dir];
        int nc = c + dc[dir];

        if (nr < 0 || nr == n || nc < 0 || nc == n || matrix[nr][nc] != 0) {
            dir = (dir + 1) % 4;
            nr = r + dr[dir];
            nc = c + dc[dir];
        }

        r = nr;
        c = nc;
    }

    return matrix;
}

static String spiral(int n) {
    return Arrays.deepToString(generateMatrix(n));
}
\`\`\`

\`\`\`output @run-spiral-matrix-ii-spiral-turn
spiral(1) -> [[1]]
spiral(3) -> [[1, 2, 3], [8, 9, 4], [7, 6, 5]]
spiral(4) -> [[1, 2, 3, 4], [12, 13, 14, 5], [11, 16, 15, 6], [10, 9, 8, 7]]
\`\`\`

\`\`\`demo SpiralTurn.java
spiral(1)
spiral(3)
spiral(4)
\`\`\`

The two arrays are the four directions in clockwise order, \`(dir + 1) % 4\` is the
right turn, and the five-clause \`if\` is "can I keep going". It is correct.

## 3. Dry run of the brute force

\`n = 3\`. \`dir\` is 0 right, 1 down, 2 left, 3 up. The "ahead" column is the cell
the current direction points at *after* the number is written.

| num | written at | dir | cell ahead | ahead is | what happens |
|---|---|---|---|---|---|
| 1 | (0,0) | 0 right | (0,1) | empty | carry on |
| 2 | (0,1) | 0 right | (0,2) | empty | carry on |
| 3 | (0,2) | 0 right | (0,3) | off the grid | turn to 1 down, go to (1,2) |
| 4 | (1,2) | 1 down | (2,2) | empty | carry on |
| 5 | (2,2) | 1 down | (3,2) | off the grid | turn to 2 left, go to (2,1) |
| 6 | (2,1) | 2 left | (2,0) | empty | carry on |
| 7 | (2,0) | 2 left | (2,−1) | off the grid | turn to 3 up, go to (1,0) |
| 8 | (1,0) | 3 up | (0,0) | **holds 1** | turn to 0 right, go to (1,1) |
| 9 | (1,1) | — | — | — | loop ends, n² numbers placed |

The grid filling in, \`.\` for a cell still holding zero:

![3. Dry run of the brute force — diagram](diagrams/spiral-matrix-ii-notes-mm-1.jpg)

Orange are the three cells where the walk turned **because it ran off the grid**
— arithmetic, decidable from \`n\` alone. The centre is where it turned because it
*read cell (0,0) and found a 1 there*, and that read is the whole argument of the
next section.

**Row 8 is the whole argument of the next section.** Every other turn was
triggered by running off the grid — pure arithmetic, decidable from \`n\` alone.
That one was triggered by *reading a cell and finding a number in it*.

## 4. Why it is not enough

Time is O(n²), which is the floor — there are n² cells and each must be written.
Space is O(1) beyond the answer. So it does not lose on either axis, and
pretending otherwise would be inventing a problem.

What it costs is one assumption that is never written down. \`matrix[nr][nc] != 0\`
means **"0 cannot be a real value here"** — true, because this problem fills with
1 upwards, but a property of the *data* that the method never states.

Take the same approach to [Spiral Matrix](problem:spiral-matrix), which walks an
existing grid rather than filling a fresh one, and that grid may legitimately
contain 0. The sentinel is gone, so you need a real \`boolean[n][n]\` beside the
matrix — O(n²) of extra memory, bought to rediscover a shape that never changed.

And that is the waste in both versions: **the boundary of the unwritten region is
being discovered, one cell at a time, by reading memory.** It does not need
discovering. At every moment it is exactly four integers, and they only move when
a side finishes.

## 5. Key takeaways

- **The path is known before you start**, so this is bookkeeping, not search.
  O(n²) is the size of the answer, not a cost to reduce.
- **\`(dir + 1) % 4\` is the right turn**, and the two direction arrays are the
  four headings in clockwise order. Get their order wrong and the spiral runs
  anticlockwise.
- **The turn test has two halves and they are not the same kind of fact.** "Am I
  off the grid" is arithmetic, decidable from \`n\` alone. "Is that cell already
  written" is a *memory read*, and it only works because 0 is never a value this
  problem stores.
- **That sentinel is the thing to be uneasy about.** On
  [Spiral Matrix](problem:spiral-matrix), where the grid already holds numbers and
  0 is legal, it collapses — and the repair costs an \`n × n\` array of booleans.
- **The boundary never actually needed discovering.** At every moment it is four
  integers that only move when a side finishes, which is where the next version
  of this comes from.
- **Test \`n = 1\` and \`n = 3\`.** The odd sizes are where a cell gets written twice,
  and a cell written twice does not throw — it just leaves a number missing.
`;export{e as default};