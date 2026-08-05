var e=`Return the square root of \`x\`, rounded down, without \`Math.sqrt\`. The answer is a
binary search — not over an array, but over the answers themselves.

## 1. The problem

Given a non-negative integer \`x\`, return the integer part of its square root.

- **In** — \`x\`, an \`int\`, and \`0 <= x <= 2³¹ − 1\`.
- **Out** — an \`int\`: the largest \`k\` with \`k × k <= x\`.
- **Not allowed** — any built-in exponent or square-root function.

**"Rounded down" is the hard part.** \`mySqrt(8)\` is 2, because 2² is 4 and 3² is
9. Most inputs have no exact root, so the real task is "find the last integer
whose square has not yet passed \`x\`".

The upper bound matters: the answer never exceeds 46340, because 46341² is past
\`2³¹ − 1\`. And \`x\` itself can be \`2³¹ − 1\`, so every multiplication on this page
has to be done in a \`long\` — \`i * i\` in an \`int\` wraps long before it gets there.

## 2. The brute force

Count upwards until the square passes.

\`\`\`java SqrtScan.java @run-sqrtx-sqrt-scan
static int mySqrt(int x) {

    int i = 1;

    while ((long) i * i <= x) {
        i++;
    }

    return i - 1;
}

static int steps(int x) {

    int i = 1;
    int s = 0;

    while ((long) i * i <= x) {
        i++;
        s++;
    }

    return s;
}
\`\`\`

\`\`\`output @run-sqrtx-sqrt-scan
mySqrt(0)          -> 0
mySqrt(1)          -> 1
mySqrt(8)          -> 2
mySqrt(16)         -> 4
mySqrt(2147483647) -> 46340
steps(8)           -> 2
steps(2147483647)  -> 46340
\`\`\`

\`\`\`demo SqrtScan.java
mySqrt(0)
mySqrt(1)
mySqrt(8)
mySqrt(16)
mySqrt(2147483647)
steps(8)
steps(2147483647)
\`\`\`

## 3. Dry run of the brute force

\`x = 8\`. One row per turn of the loop.

| turn | i | i × i | i × i <= 8 | what changes |
|---|---|---|---|---|
| 1 | 1 | 1 | yes | \`i\` → 2 |
| 2 | 2 | 4 | yes | \`i\` → 3 |
| 3 | 3 | 9 | **no** | loop ends, \`i\` stays 3 |
| end | 3 | — | — | \`return i - 1\` → **2** |

The candidates, and how many the loop has ruled out after each turn:

![3. Dry run of the brute force — diagram](diagrams/sqrtx-notes-mm-1.jpg)

How to read it, cell by cell:

- **Orange, marked \`?\`** — the candidate \`i\` is standing on this turn. There is
  exactly one per row.
- **Green, marked \`ok\`** — tested, and its square was at most 8, so it is a
  possible answer.
- **Red, marked \`no\`** — tested, and its square went past 8. This is where the
  loop stops.
- **Nearly black** — never looked at yet.

Read the orange column downwards: **it moves exactly one place per turn.** That
is the cost of this version in one image — each test buys you one candidate, so
eight candidates need up to eight tests, and 2147483647 candidates need 46340.

The last row is the answer, and note where it is: **not** on the red cell the
loop stopped at, but one to its left. That is \`return i - 1\`.

For \`x = 2147483647\` that same table has **46340 rows**.

## 4. Why it is not enough

Time is O(√x), space O(1). It passes — 46340 turns is nothing — but it answers
the wrong question. This problem is on a binary-search list, and "it passed" is
not the reply that gets you the next question.

The waste is visible in the state picture above. **Every answer implies the ones
before it.** Once \`3 × 3\` is known to be too big, so is 4, 5, 6, 7 and 8 — the
test can never go back from false to true, because squaring only grows. The scan
knows this and does nothing with it, visiting every candidate one at a time.

Ask the question about the **middle** candidate instead and half the range goes
either way. 46340 turns becomes the number of times you can halve 2147483647:
thirty-one.

Drawn against each other, with \`x\` along the bottom and turns up the side:

![4. Why it is not enough — diagram](diagrams/sqrtx-notes-mm-2.jpg)

**Blue is counting up, O(√x). Green is halving, O(log x)** — and green is the one
that looks almost flat.

Read the two ends. At \`x = 16\` they are level, four turns each, which is why a
small test tells you nothing. At \`x = 1000000\` the scan is taking a thousand
turns and the halving nineteen, and the gap goes on widening from there, because
one grows like a square root and the other like a logarithm.

Space is O(1) for both — two integers each, whatever the input — so there is no
second chart to draw.

## 5. Key takeaways

- **The answer is a boundary, not a value** — the largest \`k\` with \`k × k <= x\`.
  Most inputs have no exact root, so "find the root" is the wrong sentence to
  start from.
- **The loop stops on the first \`i\` that is too big**, so the answer is the one
  before it. \`i - 1\` falls out of the condition rather than being something to
  remember.
- **\`(long) i * i\`, with the cast on an operand.** At the top of the range
  \`i * i\` in an \`int\` wraps and the comparison becomes meaningless.
  \`(long) (i * i)\` multiplies as \`int\`s first and is the version that looks fixed
  and is not.
- **No guard is needed for 0.** The loop body never runs, \`i\` stays 1, and
  \`i - 1\` is 0.
- **O(√x) — 46340 turns at the very top of the range.** Fast enough to pass,
  which is the trap: the answers are monotone, so a test on the *middle*
  candidate could halve the range instead of removing one from it. That is where
  the next version comes from.
- **Test \`x = 0\`, \`x = 1\`, \`x = 8\` and \`x = 2147483647\`.** The interesting one is
  the last.
`;export{e as default};