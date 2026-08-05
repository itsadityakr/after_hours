var e=`One row of the triangle, by its index, and nothing else. The obvious route is to
build every row up to it and throw away all but the last. That works — and how
much of it you kept for no reason is the whole question.

## 1. The problem

Given an integer \`rowIndex\`, return row number \`rowIndex\` of Pascal's triangle.

- **In** — \`rowIndex\`, an \`int\`, and \`0 <= rowIndex <= 33\`.
- **Out** — \`List<Integer>\` holding \`rowIndex + 1\` numbers.
- **The rule** — unchanged from
  [Pascal's Triangle](problem:pascals-triangle): edges are 1, everything else is
  the sum of the two above it.

**The indexing is zero-based, and it is the first thing to check.** \`getRow(0)\`
is \`[1]\` — one number, not none. \`getRow(3)\` is \`[1, 3, 3, 1]\` — four numbers,
not three. Part I counted rows and part II indexes them, so the same integer
means different things on the two problems.

The upper bound is doing more work than it looks. 33 is chosen because
C(33, 16) is 1166803110 and the next row's peak is not — it is **the last row
whose numbers all fit in an \`int\`**.

## 2. The brute force

Part I's solution with a \`get\` on the end: build every row up to \`rowIndex\`, then
return the last one.

\`\`\`java RowSlow.java @run-pascals-triangle-ii-row-slow
static List<Integer> getRow(int rowIndex) {

    List<List<Integer>> ans = new ArrayList<>();

    for (int i = 0; i <= rowIndex; i++) {

        List<Integer> row = new ArrayList<>();

        for (int j = 0; j <= i; j++) {

            if (j == 0 || j == i) {
                row.add(1);
            } else {

                int left = ans.get(i - 1).get(j - 1);
                int right = ans.get(i - 1).get(j);

                row.add(left + right);
            }
        }

        ans.add(row);
    }

    return ans.get(rowIndex);
}

static int numbersStored(int rowIndex) {
    return (rowIndex + 1) * (rowIndex + 2) / 2;
}
\`\`\`

\`\`\`output @run-pascals-triangle-ii-row-slow
getRow(0)         -> [1]
getRow(1)         -> [1, 1]
getRow(3)         -> [1, 3, 3, 1]
getRow(4)         -> [1, 4, 6, 4, 1]
getRow(5)         -> [1, 5, 10, 10, 5, 1]
numbersStored(33) -> 595
\`\`\`

\`\`\`demo RowSlow.java
getRow(0)
getRow(1)
getRow(3)
getRow(4)
getRow(5)
numbersStored(33)
\`\`\`

### The code, line by line

- \`for (int i = 0; i <= rowIndex; i++)\` — **\`<=\`, because \`rowIndex\` is an index
  and the row it names has to be built.** Part I's identical loop uses \`<\`,
  because \`numRows\` is a count. That one character is the whole difference
  between the two problems' outer loops, and it is worth pausing on rather than
  pattern matching.
- \`if (j == 0 || j == i)\` — the edges, exactly as in part I, and again the branch
  that quietly disposes of row 0 so the reads below never see \`i - 1\` as \`-1\`.
- \`int left\` / \`int right\` — the two parents, from the row completed on the
  previous turn of the outer loop.
- \`ans.add(row);\` — **the line this whole page is about.** Every row is filed
  away, and all but one of them will never be read again after the turn that
  follows it.
- \`return ans.get(rowIndex);\` — the last row, by index. \`ans.size() - 1\` is the
  same element; using \`rowIndex\` says out loud that the two agree.

## 3. Dry run of the brute force

\`rowIndex = 4\`. One row per turn of the outer loop, with what is being kept.

| i | row built | reads from | rows now stored | numbers now stored |
|---|---|---|---|---|
| 0 | \`[1]\` | — | 1 | 1 |
| 1 | \`[1, 1]\` | row 0 | 2 | 3 |
| 2 | \`[1, 2, 1]\` | row 1 | 3 | 6 |
| 3 | \`[1, 3, 3, 1]\` | row 2 | 4 | 10 |
| 4 | \`[1, 4, 6, 4, 1]\` | row 3 | 5 | **15** |

\`return ans.get(4)\` → \`[1, 4, 6, 4, 1]\` — **5 numbers returned, 15 held.**

Now trace what happens to a single row after it is built. Row 2 is written on
turn 2, read once on turn 3, and then held until the method returns:

![3. Dry run of the brute force — diagram](diagrams/pascals-triangle-ii-notes-mm-1.jpg)

**Green is a row that is still going to be read. Amber is a row that never will
be, and is still in memory.** By the last turn, three of the five rows are amber
— and at \`rowIndex = 33\` it is thirty-three of the thirty-four.

Read the green cells across and one thing is obvious: **there are never more than
two.** A row is written, read once by the row below it, and finished with.

Now \`rowIndex = 0\`:

| i | row built | result |
|---|---|---|
| 0 | \`[1]\` | \`return ans.get(0)\` → \`[1]\` |

The outer loop runs once — because \`i <= 0\` is true for \`i = 0\` — and the
interior branch never runs. **Write \`i < rowIndex\` instead and this returns
nothing at all.**

## 4. Why it is not enough

Time is O(n²) and that part is not negotiable: every cell on the way up is
genuinely needed to reach the last row.

Space is O(n²), and that part is. \`numbersStored(33)\` in the output above is
**595**: the method holds 595 boxed \`Integer\`s, in 34 separate \`ArrayList\`s, to
hand back 34 numbers. Seventeen times the answer, and every surplus one is a heap
object with a header on it rather than a slot in an array.

The dry run already showed why that is avoidable. **At any moment exactly one row
matters** — row \`i\` reads row \`i - 1\` and nothing else is ever consulted — so
keeping the rest is keeping a log of the journey for a caller who asked only for
the destination.

Two rows would already be O(n). But look harder at the update:

\`\`\`text
new row[j] = old row[j] + old row[j - 1]
\`\`\`

The new value at \`j\` depends on old values at \`j\` and to its **left**. So if you
rewrite a single list from its right-hand end backwards, every cell you still
have to read is one you have not yet overwritten — and the second row is not
needed either. That is the whole of the improvement, and the direction is the
part to get right: sweep the other way and each cell reads a value the same pass
just wrote, producing a full-length row of wrong numbers with no exception.

## 5. Key takeaways

- **\`rowIndex\` is an index, not a count.** \`getRow(3)\` returns four numbers, and
  the outer loop needs \`<=\`, not \`<\`.
- **The brute force keeps 595 numbers to return 34.** Not a timeout — a
  follow-up you will be asked for the moment you stop typing.
- **Only one row is ever live.** Row \`i\` reads row \`i - 1\`; everything older is
  dead the turn after it is written.
- **The new value at \`j\` reads \`j\` and \`j - 1\`** — one cell and its left
  neighbour. That single fact decides everything about how far the memory can be
  cut.
- **A single list can overwrite itself, but in one direction only**, and the
  wrong direction fails silently rather than loudly.
- **Row 33 is the last one that fits in an \`int\`.** That bound is a hint about
  where the arithmetic gets interesting, not an arbitrary limit.
`;export{e as default};