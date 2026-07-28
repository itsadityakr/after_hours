var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The structure

- \`int[][]\` is an array of \`int[]\` references. There is no true 2-D type.
- \`m.length\` is the row count. \`m[0].length\` is the width of **row 0 only** —
  rows may differ, and it throws on a grid with no rows.
- Guard first: \`if (m.length == 0 || m[0].length == 0) return ...\`.
- \`m[r][c]\` is row then column. Row 0 is the top, column 0 is the left.
- \`m.clone()\` is shallow — the rows are shared. Copy each row with \`m[r].clone()\`.
- \`Arrays.deepToString(m)\` to print; plain \`println(m)\` gives a hash.
- \`for (int[] row : m)\` hands you the row reference, so \`row[0] = 9\` writes
  through to the grid.

## Positions worth naming

- Main diagonal: \`r == c\`. Anti-diagonal: \`r + c == n - 1\`.
- Row-major flattening: \`index = r * cols + c\`, back with \`r = i / cols\`,
  \`c = i % cols\`.
- Sudoku box: \`(r / 3) * 3 + c / 3\`.

## Neighbours

\`\`\`java
static final int[][] DIRS = { { 0, 1 }, { 1, 0 }, { 0, -1 }, { -1, 0 } };

for (int[] d : DIRS) {
    int nr = r + d[0], nc = c + d[1];
    if (nr < 0 || nr >= m.length || nc < 0 || nc >= m[0].length) continue;
    visit(m[nr][nc]);
}
\`\`\`

- Eight directions: add the four corners, \`{1,1} {1,-1} {-1,1} {-1,-1}\`.
- All four bounds conditions are needed. \`-1\` is an exception, not a wrap.
- Stepping between neighbours is a graph search with the edges implied.

## Transpose and rotate

- Transpose in place, square only:
  \`for i, for j = i + 1: swap(m[i][j], m[j][i])\`.
- \`j = i + 1\` because a swap does both cells. From \`0\` every pair swaps twice
  and the grid is unchanged.
- Rectangular transpose needs a new \`int[cols][rows]\`; the shape changes.
- **Clockwise 90°**: transpose, then reverse each row.
- **Anticlockwise 90°**: transpose, then reverse each column — that is
  reversing the order of the rows, and rows are references so you swap whole rows.
- **180°**: reverse each row and reverse the order of the rows. No transpose.
- Wrong direction usually means the two steps are the wrong way round.

## Spiral

\`\`\`java
while (top <= bottom && left <= right) {
    for (int c = left; c <= right; c++) out.add(m[top][c]);      top++;
    for (int r = top; r <= bottom; r++) out.add(m[r][right]);    right--;
    if (top <= bottom) { for (int c = right; c >= left; c--) out.add(m[bottom][c]); bottom--; }
    if (left <= right) { for (int r = bottom; r >= top; r--) out.add(m[r][left]);   left++; }
}
\`\`\`

- Four boundaries around the unread rectangle; each leg retires one edge.
- The two guards exist because \`top\` and \`right\` move *inside* the lap. Without
  them a \`1×n\` or \`n×1\` grid emits a row or column twice.
- If you only tested a square grid, you did not test it.

## Set Matrix Zeroes in O(1)

- Two passes always: mark, then apply. Blanking as you go spreads.
- Store the flags in the grid — row 0 holds the column flags, column 0 holds the
  row flags.
- \`m[0][0]\` is in both, so pull one out into a single \`boolean firstColumnZero\`.
- Apply **backwards** (last row up, last column back to column 1) or you
  overwrite the flags before reading them.

## Sorted grid, top-right corner

\`\`\`java
int r = 0, c = m[0].length - 1;
while (r < m.length && c >= 0)
    if (m[r][c] == target) return true;
    else if (m[r][c] > target) c--; else r++;
\`\`\`

- Works because at that corner left gets smaller and down gets larger, so every
  comparison eliminates a whole row or column. Bottom-left works too; top-left
  does not.
- O(r + c), better than a binary search per row.
- Rows sorted *and* each row starting after the previous ends is the other
  problem — flatten it and binary search.

## The bugs

- \`m[c][r]\` for \`m[r][c]\` — runs fine on a square grid, wrong answer.
- Transpose loop from \`j = 0\`.
- Transposing a rectangle in place.
- Spiral without the two guards.
- Zero flags applied forwards.
- Missing bounds check on a neighbour step.
- \`m.clone()\` treated as a deep copy.

## Costs

| Thing | Time | Space |
|---|---|---|
| Any full walk | O(rc) | O(1) |
| Rotate in place | O(n²) | O(1) |
| Spiral | O(rc) | output only |
| Set zeroes, in place | O(rc) | O(1) |
| Corner search | O(r + c) | O(1) |
`;export{e as default};