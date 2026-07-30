var e=`A square is named by a letter and a digit — \`a1\`, \`h3\`. Is it white? The board
is not stored anywhere and you are not asked to build it: the answer is decided
by the two characters you were handed, and the whole problem is noticing which
arithmetic they hide.

## How to approach it

**1. Draw four squares and label them.** \`a1\` is black. \`a2\`, \`b1\` are white.
\`b2\` is black. Two rows and two columns is enough to see the rule — the colour
flips with every step in either direction, which is what a chequerboard *is*.

**2. Say what "flips every step" means as arithmetic.** Something that alternates
as you add one is a question about **odd or even**. So the answer depends on the
parity of the column plus the row, and nothing else about them.

**3. Turn each character into a number.** The row is already a digit character.
The column is a letter, and turning a letter into its position is the same trick
as turning a digit character into its value: subtract the character it counts
from.

**4. Check your rule against one square you know**, not against the examples you
were given. \`a1\` is black, so \`1 + 1 = 2\` must come out as *not white*.

Nothing loops here. If you find yourself building a board, step back to step 2.

## Approach 1 — the parity of column plus row

\`\`\`java Chessboard.java @run-determine-color-of-a-chessboard-square-chessboard
static boolean squareIsWhite(String coordinates) {
    int col = coordinates.charAt(0) - 'a' + 1;
    int row = coordinates.charAt(1) - '0';

    return (col + row) % 2 != 0;
}
\`\`\`

\`\`\`output @run-determine-color-of-a-chessboard-square-chessboard
squareIsWhite("a1") -> false
squareIsWhite("h3") -> true
squareIsWhite("c7") -> false
squareIsWhite("d5") -> true
squareIsWhite("h8") -> false
\`\`\`

\`\`\`demo Chessboard.java
squareIsWhite("a1")
squareIsWhite("h3")
squareIsWhite("c7")
squareIsWhite("d5")
squareIsWhite("h8")
\`\`\`

**\`char - char\` is the one thing to take from this problem.** Characters are
numbers, and subtracting the start of a run gives you the position in it: \`'7' -
'0'\` is 7 and \`'c' - 'a'\` is 2, for exactly the same reason. The \`+ 1\` is there
only so the column counts from 1 like the row does — and it could be dropped, as
the next section explains, which is precisely why it is worth writing down that
you meant it.

## Approach 2 — look the column up instead of computing it

If the letter-to-number step is the part that feels like a trick, do not do it:
the columns are a list of eight things and finding a position in a list is what
\`indexOf\` is for.

\`\`\`java ChessboardLookup.java @run-determine-color-of-a-chessboard-square-chessboard-lookup
static boolean squareIsWhite(String coordinates) {
    int col = "abcdefgh".indexOf(coordinates.charAt(0));
    int row = Character.getNumericValue(coordinates.charAt(1));

    return (col + row) % 2 == 0;
}
\`\`\`

\`\`\`output @run-determine-color-of-a-chessboard-square-chessboard-lookup
squareIsWhite("a1") -> false
squareIsWhite("h3") -> true
squareIsWhite("c7") -> false
squareIsWhite("d5") -> true
squareIsWhite("h8") -> false
\`\`\`

\`\`\`demo ChessboardLookup.java
squareIsWhite("a1")
squareIsWhite("h3")
squareIsWhite("c7")
squareIsWhite("d5")
squareIsWhite("h8")
\`\`\`

**The test flipped to \`== 0\` and that is not a typo.** \`indexOf\` counts from
zero, so this \`col\` is one less than the one above, and a rule about parity
notices a change of one immediately. It is the clearest illustration on the page
that *what your numbers mean* has to be settled before the parity question is
asked — the arithmetic will not tell you when you are off by one, it will just
answer the opposite.

Slower than approach 1 by a scan of eight characters, which is to say not slower
in any way that can be measured. Write it if it is the one you can explain.

## Approach 3 — add the two characters and forget what they mean

\`\`\`java ChessboardChars.java @run-determine-color-of-a-chessboard-square-chessboard-chars
static boolean squareIsWhite(String coordinates) {
    return (coordinates.charAt(0) + coordinates.charAt(1)) % 2 != 0;
}
\`\`\`

\`\`\`output @run-determine-color-of-a-chessboard-square-chessboard-chars
squareIsWhite("a1") -> false
squareIsWhite("h3") -> true
squareIsWhite("c7") -> false
squareIsWhite("d5") -> true
squareIsWhite("h8") -> false
\`\`\`

\`\`\`demo ChessboardChars.java
squareIsWhite("a1")
squareIsWhite("h3")
squareIsWhite("c7")
squareIsWhite("d5")
squareIsWhite("h8")
\`\`\`

No subtraction at all: add the two characters as they came and ask whether the
sum is odd. It gives the same answer as approach 1 on all sixty-four squares —
and it is worth knowing exactly why, because the reason is a real fact and the
habit is a bad one.

## Why the offsets do not matter

\`'a'\` is 97 and \`'0'\` is 48, so approach 3 adds a column 96 too big to a row 48
too big. The same accident happens in the version people write without meaning
to — \`coordinates.charAt(0) - '0'\` on a *letter* — which numbers the column 49
where it should be 1. Every column is 48 too big.

![Two ways of numbering the column, 48 apart, and why the parity does not notice](diagrams/determine-color-of-a-chessboard-square-notes-parity.jpg)

And 48 is even. So is 96. Adding an even number to something never changes
whether it is odd or even — so a test that only asks *is the sum odd* cannot
tell the numberings apart. Approach 3 computes a column and a row that are both
nonsense, and then asks a question the nonsense does not reach.

That makes it correct and unexplainable, which is the worst combination to leave
in a file. \`- 'a' + 1\` says *this is the column, counting from 1*; the raw
characters say nothing, and the next reader — including you — has to redo the
parity argument above to convince themselves it is not a bug.

Know it, mention it, and write approach 1.

## What the three cost

**Time is the yellow line, memory the green one**, and on this problem both are
flat: there is no \`n\`. Two character reads, a subtraction each, one addition and
one remainder — the same work for \`a1\` as for \`h8\`.

![Time and memory for all three versions, both flat](diagrams/determine-color-of-a-chessboard-square-notes-cost.jpg)

| Approach | Time | Space | |
|---|---|---|---|
| 1 — column and row, then parity | O(1) | O(1) | **write this one** |
| 2 — \`indexOf\` for the column | O(1) | O(1) | eight characters scanned, and no trick |
| 3 — add the characters raw | O(1) | O(1) | correct, and it explains nothing |

Had the problem asked you to colour the whole board it would be O(n²) to build
one — which is exactly the solution the arithmetic saves you from writing.
`;export{e as default};